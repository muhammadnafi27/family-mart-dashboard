'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useProductCategorySales } from '@/hooks/useProducts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { CategorySalesPoint } from '@/types/product'

const COLORS = ['#0878C8', '#37B220', '#F97316', '#8B5CF6', '#EC4899', '#0EA5E9', '#22C55E', '#F59E0B', '#6366F1', '#EF4444']

export function CategorySalesChart() {
  const [view, setView] = React.useState<'donut' | 'bar'>('donut')
  const { data, isLoading, isError } = useProductCategorySales()
  const cats: CategorySalesPoint[] = Array.isArray(data) ? data : []

  const total = cats.reduce((s, c) => s + c.revenue, 0)

  const donutOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number; dataIndex: number }) => {
        const c = cats[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Revenue: <b>${formatCurrency(p.value)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Qty: <b>${formatNumber(c?.qty_sold ?? 0)} pcs</b></p>
          <p style="font-size:11px;color:#37B220;margin-top:2px">Gross Profit: <b>${formatCurrency(c?.gross_profit ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Porsi: <b>${p.percent.toFixed(1)}%</b></p>`
      },
    },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['40%', '52%'],
      padAngle: 2,
      data: cats.map((c, i) => ({
        name: c.category_name,
        value: c.revenue,
        itemStyle: { color: COLORS[i % COLORS.length], borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'middle',
      textStyle: { color: '#64748B', fontSize: 11 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
    },
  }

  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
    },
    grid: { top: 8, right: 8, bottom: 40, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: cats.map((c) => c.category_name),
      axisLabel: { color: '#94A3B8', fontSize: 10, rotate: 20 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb` },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      { name: 'Revenue', type: 'bar', data: cats.map((c, i) => ({ value: c.revenue, itemStyle: { color: COLORS[i % COLORS.length], borderRadius: [4, 4, 0, 0] } })), barMaxWidth: 36 },
      { name: 'Gross Profit', type: 'bar', data: cats.map((c, i) => ({ value: c.gross_profit, itemStyle: { color: `${COLORS[i % COLORS.length]}60`, borderRadius: [4, 4, 0, 0] } })), barMaxWidth: 36 },
    ],
    legend: { bottom: 0, textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8 },
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Penjualan per Kategori</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{cats.length} kategori aktif</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {(['donut', 'bar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${view === v ? 'bg-white shadow-sm text-[#0878C8]' : 'text-[#64748B]'}`}
            >
              {v === 'donut' ? 'Donut' : 'Bar'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
        ) : isError || cats.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <>
            <ReactECharts option={view === 'donut' ? donutOption : barOption} style={{ height: 240 }} notMerge />
            {/* Summary row */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Total Revenue', value: formatCurrency(total) },
                { label: 'Total Qty', value: `${formatNumber(cats.reduce((s, c) => s + c.qty_sold, 0))} pcs` },
                { label: 'Gross Profit', value: formatCurrency(cats.reduce((s, c) => s + c.gross_profit, 0)) },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-center">
                  <p className="text-[10px] text-[#94A3B8] font-medium">{s.label}</p>
                  <p className="text-xs font-bold text-[#0F172A] mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
