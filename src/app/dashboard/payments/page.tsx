'use client'

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/store/filterStore'
import { formatCurrency } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'

export default function PaymentsPage() {
  const { from, to } = useFilterStore()

  const { data, isLoading } = useQuery({
    queryKey: ['payments', from, to],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (from) sp.set('from', from.toISOString())
      if (to) sp.set('to', to.toISOString())
      const res = await fetch(`/api/payments?${sp.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const payments = Array.isArray(data) ? data : []

  return (
    <>
      <Header title="Pembayaran" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />
        <Card>
          <CardHeader><CardTitle>Riwayat Pembayaran</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-fm-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>No Referensi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p: {
                    payment_id: number
                    sale: { invoice_number: string; store: { store_name: string } }
                    method: { method_name: string }
                    paid_amount: number
                    payment_time: string
                    reference_no: string | null
                    status: string
                  }) => (
                    <TableRow key={p.payment_id}>
                      <TableCell className="font-mono text-xs text-fm-primary">{p.sale.invoice_number}</TableCell>
                      <TableCell className="text-xs text-fm-muted">{p.sale.store.store_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{p.method.method_name}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(Number(p.paid_amount))}</TableCell>
                      <TableCell className="text-xs text-fm-muted whitespace-nowrap">{formatDateTime(p.payment_time)}</TableCell>
                      <TableCell className="font-mono text-xs text-fm-muted">{p.reference_no ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'success' ? 'success' : 'destructive'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
