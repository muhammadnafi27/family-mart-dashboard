'use client'

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/store/filterStore'
import { formatCurrency } from '@/lib/utils'

const TIER_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  Gold: 'warning',
  Silver: 'secondary',
  Platinum: 'default',
  Bronze: 'outline',
  'Non-Member': 'secondary',
}

export default function CustomersPage() {
  const { from, to } = useFilterStore()

  const { data, isLoading } = useQuery({
    queryKey: ['top-customers', from, to],
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (from) sp.set('from', from.toISOString())
      if (to) sp.set('to', to.toISOString())
      const res = await fetch(`/api/customers?${sp.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const customers = Array.isArray(data) ? data : []

  return (
    <>
      <Header title="Pelanggan" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />
        <Card>
          <CardHeader>
            <CardTitle>Top Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-fm-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Total Belanja</TableHead>
                    <TableHead className="text-right">Jumlah Order</TableHead>
                    <TableHead className="text-right">Avg/Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c: {
                    customer_id: number
                    full_name: string
                    tier_name: string
                    total_spent: number
                    order_count: number
                  }, i: number) => (
                    <TableRow key={c.customer_id}>
                      <TableCell className="text-xs text-fm-muted font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium text-sm">{c.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={TIER_VARIANT[c.tier_name] ?? 'secondary'}>
                          {c.tier_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(c.total_spent)}</TableCell>
                      <TableCell className="text-right text-fm-muted">{c.order_count}</TableCell>
                      <TableCell className="text-right text-xs text-fm-muted">
                        {formatCurrency(c.total_spent / c.order_count)}
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
