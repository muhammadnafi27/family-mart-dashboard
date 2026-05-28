'use client'

import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFilterStore } from '@/store/filterStore'
import { formatCurrency } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'

export default function FinancePage() {
  const { from, to, storeId } = useFilterStore()

  const buildParams = () => {
    const sp = new URLSearchParams()
    if (from) sp.set('from', from.toISOString())
    if (to) sp.set('to', to.toISOString())
    if (storeId) sp.set('storeId', String(storeId))
    return sp.toString()
  }

  const { data: expenses } = useQuery({
    queryKey: ['expenses', from, to, storeId],
    queryFn: async () => {
      const res = await fetch(`/api/finance?${buildParams()}`)
      if (!res.ok) throw new Error('Failed to fetch expenses')
      return res.json()
    },
  })

  const { data: returns } = useQuery({
    queryKey: ['return-reasons', from, to],
    queryFn: async () => {
      const sp = new URLSearchParams({ type: 'returns' })
      if (from) sp.set('from', from.toISOString())
      if (to) sp.set('to', to.toISOString())
      const res = await fetch(`/api/finance?${sp.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch returns')
      return res.json()
    },
  })

  const expenseList = Array.isArray(expenses) ? expenses : []
  const returnList = Array.isArray(returns) ? returns : []

  const expenseOption = {
    tooltip: { trigger: 'item', formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: ${formatCurrency(p.value)} (${p.percent.toFixed(1)}%)` },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      data: expenseList.map((e: { expense_category: string; total: number }, i: number) => ({
        name: e.expense_category,
        value: e.total,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
    }],
  }

  const returnOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 8, right: 8, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: returnList.map((r: { reason_name: string }) => r.reason_name),
      axisLabel: { color: '#64748B', fontSize: 10, rotate: 15 },
    },
    yAxis: { type: 'value', axisLabel: { color: '#64748B', fontSize: 10 }, splitLine: { lineStyle: { color: '#F1F5F9' } } },
    series: [{
      type: 'bar',
      data: returnList.map((r: { count: number }, i: number) => ({
        value: r.count,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderRadius: [3, 3, 0, 0] },
      })),
    }],
  }

  return (
    <>
      <Header title="Keuangan" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expense chart */}
          <Card>
            <CardHeader><CardTitle>Pengeluaran per Kategori</CardTitle></CardHeader>
            <CardContent>
              {expenseList.length > 0 ? (
                <ReactECharts option={expenseOption} style={{ height: 260 }} notMerge />
              ) : (
                <div className="h-40 flex items-center justify-center text-sm text-fm-muted">Tidak ada data</div>
              )}
            </CardContent>
          </Card>

          {/* Return chart */}
          <Card>
            <CardHeader><CardTitle>Alasan Retur</CardTitle></CardHeader>
            <CardContent>
              {returnList.length > 0 ? (
                <ReactECharts option={returnOption} style={{ height: 260 }} notMerge />
              ) : (
                <div className="h-40 flex items-center justify-center text-sm text-fm-muted">Tidak ada data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense table */}
        <Card>
          <CardHeader><CardTitle>Detail Pengeluaran</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Rata-rata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseList.map((e: { expense_category: string; total: number; count: number }) => (
                  <TableRow key={e.expense_category}>
                    <TableCell className="font-medium">{e.expense_category}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(e.total)}</TableCell>
                    <TableCell className="text-right text-fm-muted">{e.count}</TableCell>
                    <TableCell className="text-right text-xs text-fm-muted">{formatCurrency(e.total / e.count)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
