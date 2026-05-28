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

export default function ReturnsPage() {
  const { from, to } = useFilterStore()

  const { data, isLoading } = useQuery({
    queryKey: ['returns', from, to],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (from) sp.set('from', from.toISOString())
      if (to) sp.set('to', to.toISOString())
      const res = await fetch(`/api/returns?${sp.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const returns = Array.isArray(data) ? data : []

  return (
    <>
      <Header title="Retur" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />
        <Card>
          <CardHeader><CardTitle>Daftar Retur</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-fm-primary border-t-transparent animate-spin" />
              </div>
            ) : returns.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-fm-muted">Tidak ada retur</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Asli</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead className="text-right">Refund</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Ditangani</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((r: {
                    return_id: number
                    sale: { invoice_number: string }
                    customer: { full_name: string } | null
                    reason: { reason_name: string }
                    refund_amount: number
                    return_date: string
                    handler: { full_name: string }
                    status: string
                  }) => (
                    <TableRow key={r.return_id}>
                      <TableCell className="font-mono text-xs text-fm-primary">{r.sale.invoice_number}</TableCell>
                      <TableCell className="text-xs">{r.customer?.full_name ?? <span className="italic text-fm-muted">Umum</span>}</TableCell>
                      <TableCell className="text-xs">{r.reason.reason_name}</TableCell>
                      <TableCell className="text-right font-semibold text-fm-red">{formatCurrency(Number(r.refund_amount))}</TableCell>
                      <TableCell className="text-xs text-fm-muted whitespace-nowrap">{formatDateTime(r.return_date)}</TableCell>
                      <TableCell className="text-xs text-fm-muted">{r.handler.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'approved' ? 'success' : 'secondary'}>{r.status}</Badge>
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
