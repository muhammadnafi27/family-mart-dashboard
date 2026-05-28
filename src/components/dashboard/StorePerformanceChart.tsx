'use client'

import ReactECharts from 'echarts-for-react'
import { useStorePerformance } from '@/hooks/useOverview'
import { formatCurrency } from '@/lib/utils'

export function StorePerformanceChart() {
  const { data, isLoading, isError } = useStorePerformance()
  const stores: { store_name: string; revenue: number; transactions: number }[] =
    data?.stores ?? []

  const sorted = [...stores].sort((a, b) => a.revenue - b.revenue)
  const names = sorted.map((s) => {
    const short = s.store_name.replace(/familymart|family mart/gi, 'FM').trim()
    return short.length > 22 ? short.slice(0, 22) + '…' : short
  })
  const revenues = sorted.map((s) => s.revenue)
  const maxRev = Math.max(...revenues, 1)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        const idx = names.indexOf(p.name)
        const tx = sorted[idx]?.transactions ?? 0
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Revenue: <b style="color:#0878C8">${formatCurrency(p.value)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Transaksi: <b>${Number(tx).toLocaleString('id-ID')}</b></p>`
      },
    },
    grid: { top: 8, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94A3B8',
        fontSize: 10,
        formatter: (v: number) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`,
      },
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
    series: [
      {
        type: 'bar',
        data: revenues.map((v) => ({
          value: v,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: `rgba(8,120,200,${0.4 + (v / maxRev) * 0.6})` },
                { offset: 1, color: '#0878C8' },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barWidth: 18,
        label: {
          show: true,
          position: 'right',
          formatter: (p: { value: unknown }) =>
            `${(Number(p.value) / 1_000_000).toFixed(1)}jt`,
          color: '#64748B',
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Performa per Toko</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Revenue tertinggi → terendah</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 rounded-md bg-slate-100 animate-pulse" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        ) : isError || stores.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: Math.max(stores.length * 38 + 16, 200) }}
            notMerge
          />
        )}
      </div>
    </div>
  )
}
