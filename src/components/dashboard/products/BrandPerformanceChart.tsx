'use client'

import ReactECharts from 'echarts-for-react'
import { useBrandPerformance } from '@/hooks/useProducts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { BrandPerformancePoint } from '@/types/product'

const COLORS = ['#0878C8','#37B220','#F97316','#8B5CF6','#EC4899','#0EA5E9','#22C55E','#F59E0B','#6366F1','#EF4444','#14B8A6','#84CC16','#FB923C','#A78BFA','#F43F5E','#0891B2','#16A34A','#D97706','#7C3AED','#BE185D']

export function BrandPerformanceChart() {
  const { data, isLoading, isError } = useBrandPerformance()
  const brands: BrandPerformancePoint[] = (Array.isArray(data) ? data : []).slice(0, 15)

  const sorted = [...brands].sort((a, b) => a.revenue - b.revenue)
  const names = sorted.map((b) => b.brand_name.length > 20 ? b.brand_name.slice(0, 20) + '…' : b.brand_name)
  const maxRev = Math.max(...sorted.map((b) => b.revenue), 1)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (params: { dataIndex: number; value: number }[]) => {
        const p = params[0]
        const b = sorted[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${b?.brand_name}</p>
          <p style="font-size:11px;color:#64748B">Revenue: <b>${formatCurrency(b?.revenue ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Qty Terjual: <b>${formatNumber(b?.qty_sold ?? 0)} pcs</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Produk: <b>${b?.product_count ?? 0} SKU</b></p>
          <p style="font-size:11px;color:#37B220;margin-top:2px">Gross Profit: <b>${formatCurrency(b?.gross_profit ?? 0)}</b></p>`
      },
    },
    grid: { top: 8, right: 90, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb` },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#64748B', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: sorted.map((b, i) => ({
        value: b.revenue,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${COLORS[i % COLORS.length]}25` },
              { offset: 1, color: COLORS[i % COLORS.length] },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 16,
      label: {
        show: true,
        position: 'right',
        formatter: (p: { value: unknown }) => `${(Number(p.value) / 1_000_000).toFixed(1)}jt`,
        color: '#64748B',
        fontSize: 10,
        fontWeight: 600,
      },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Performa Brand</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Top {brands.length} brand berdasarkan revenue</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 rounded-md bg-slate-100 animate-pulse" style={{ width: `${90 - i * 5}%` }} />
          ))}</div>
        ) : isError || brands.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts option={option} style={{ height: Math.max(brands.length * 38 + 16, 200) }} notMerge />
        )}
      </div>
    </div>
  )
}
