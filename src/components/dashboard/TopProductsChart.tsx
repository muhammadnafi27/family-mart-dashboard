'use client'

import ReactECharts from 'echarts-for-react'
import { useTopProducts } from '@/hooks/useOverview'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#0878C8', '#0B8BD3', '#37B220', '#22C55E', '#8B5CF6', '#6366F1', '#F97316', '#FB923C', '#EC4899', '#F43F5E']

export function TopProductsChart() {
  const { data, isLoading, isError } = useTopProducts()
  const products: { product_name: string; category_name: string; qty_sold: number; revenue: number; gross_profit: number }[] =
    (data?.products ?? []).slice(0, 10)

  const names = products.map((p) => {
    const n = p.product_name
    return n.length > 28 ? n.slice(0, 28) + '…' : n
  })
  const qtys = products.map((p) => p.qty_sold)
  const maxQty = Math.max(...qtys, 1)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (params: { name: string; value: number; dataIndex: number }[]) => {
        const p = params[0]
        const prod = products[p.dataIndex]
        return `
          <p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${prod?.product_name}</p>
          <p style="font-size:11px;color:#64748B">Kategori: <b>${prod?.category_name}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Terjual: <b>${p.value.toLocaleString('id-ID')} pcs</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Revenue: <b>${formatCurrency(prod?.revenue ?? 0)}</b></p>
          <p style="font-size:11px;color:#37B220;margin-top:2px">Gross Profit: <b>${formatCurrency(prod?.gross_profit ?? 0)}</b></p>
        `
      },
    },
    grid: { top: 8, right: 70, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#64748B', fontSize: 10.5, width: 160 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: qtys.map((v, i) => ({
          value: v,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: `${COLORS[i]}30` },
                { offset: 1, color: COLORS[i] },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          formatter: (p: { value: unknown }) => `${Number(p.value).toLocaleString('id-ID')}`,
          color: '#64748B',
          fontSize: 10,
          fontWeight: 600,
        },
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Top 10 Produk Terlaris</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Berdasarkan jumlah unit terjual</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 rounded-md bg-slate-100 animate-pulse" style={{ width: `${95 - i * 8}%` }} />
            ))}
          </div>
        ) : isError || products.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: Math.max(products.length * 38 + 16, 200) }}
            notMerge
          />
        )}
      </div>
    </div>
  )
}
