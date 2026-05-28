'use client'

import ReactECharts from 'echarts-for-react'
import { useHourlyHeatmap } from '@/hooks/useSales'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { HourlyHeatmapPoint } from '@/types/sales'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

export function HourlyHeatmapChart() {
  const { data, isLoading, isError } = useHourlyHeatmap()
  const points: HourlyHeatmapPoint[] = Array.isArray(data) ? data : []

  // Build full 7×24 grid (fill missing cells with 0)
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  const revenueGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  points.forEach((p) => {
    if (p.day_of_week >= 0 && p.day_of_week < 7 && p.hour >= 0 && p.hour < 24) {
      grid[p.day_of_week][p.hour] = p.transaction_count
      revenueGrid[p.day_of_week][p.hour] = p.revenue
    }
  })

  // Flatten for ECharts: [hour, day, count]
  const heatData: [number, number, number][] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatData.push([hour, day, grid[day][hour]])
    }
  }
  const maxVal = Math.max(...heatData.map((d) => d[2]), 1)

  const option = {
    tooltip: {
      position: 'top',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (p: { data: [number, number, number] }) => {
        const [hour, day, cnt] = p.data
        const rev = revenueGrid[day]?.[hour] ?? 0
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${DAYS[day]} ${HOURS[hour]}</p>
          <p style="font-size:11px;color:#64748B">Transaksi: <b>${formatNumber(cnt)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Revenue: <b>${formatCurrency(rev)}</b></p>`
      },
    },
    grid: { top: 20, right: 20, bottom: 40, left: 48 },
    xAxis: {
      type: 'category',
      data: HOURS,
      splitArea: { show: true },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 9,
        interval: 1,
        formatter: (_: string, i: number) => i % 2 === 0 ? HOURS[i] : '',
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: DAYS,
      splitArea: { show: true },
      axisLabel: { color: '#64748B', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      inverse: false,
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: false,
      show: false,
      inRange: {
        color: ['#EFF6FF', '#BAE6FD', '#38BDF8', '#0878C8', '#0369A1'],
      },
    },
    series: [{
      name: 'Transaksi',
      type: 'heatmap',
      data: heatData,
      label: {
        show: maxVal <= 20,
        fontSize: 9,
        color: '#fff',
        formatter: (p: { data: [number, number, number] }) => p.data[2] > 0 ? String(p.data[2]) : '',
      },
      emphasis: {
        itemStyle: { shadowBlur: 6, shadowColor: 'rgba(8,120,200,0.4)' },
      },
      itemStyle: { borderRadius: 2, borderColor: '#fff', borderWidth: 1.5 },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Heatmap Transaksi per Jam</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Intensitas transaksi — hari vs jam</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
        ) : isError ? (
          <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">Gagal memuat data</div>
        ) : points.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">Tidak ada data</div>
        ) : (
          <ReactECharts option={option} style={{ height: 210 }} notMerge />
        )}
      </div>
    </div>
  )
}
