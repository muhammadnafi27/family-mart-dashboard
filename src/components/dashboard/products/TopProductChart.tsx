'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useTopProducts } from '@/hooks/useProducts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { TopProductPoint } from '@/types/product'

type View = 'qty' | 'revenue' | 'profit'
const VIEWS: { key: View; label: string; color: string }[] = [
  { key: 'qty',     label: 'Qty Terjual', color: '#0878C8' },
  { key: 'revenue', label: 'Revenue',     color: '#37B220' },
  { key: 'profit',  label: 'Gross Profit', color: '#8B5CF6' },
]

function fmt(key: View, v: number) {
  return key === 'qty' ? `${formatNumber(v)} pcs` : formatCurrency(v)
}

export function TopProductChart() {
  const [view, setView] = React.useState<View>('qty')
  const { data, isLoading, isError } = useTopProducts()
  const products: TopProductPoint[] = Array.isArray(data) ? data : []

  const cfg = VIEWS.find((v) => v.key === view)!
  const sorted = [...products].sort((a, b) => {
    if (view === 'qty') return a.qty_sold - b.qty_sold
    if (view === 'revenue') return a.revenue - b.revenue
    return a.gross_profit - b.gross_profit
  })

  const names = sorted.map((p) => {
    const n = p.product_name
    return n.length > 28 ? n.slice(0, 28) + '…' : n
  })
  const values = sorted.map((p) =>
    view === 'qty' ? p.qty_sold : view === 'revenue' ? p.revenue : p.gross_profit
  )
  const maxVal = Math.max(...values, 1)

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
        const prod = sorted[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${prod?.product_name}</p>
          <p style="font-size:11px;color:#64748B">Kategori: ${prod?.category_name}</p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">${cfg.label}: <b style="color:${cfg.color}">${fmt(view, p.value)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Qty Terjual: <b>${formatNumber(prod?.qty_sold ?? 0)} pcs</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Revenue: <b>${formatCurrency(prod?.revenue ?? 0)}</b></p>`
      },
    },
    grid: { top: 8, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94A3B8', fontSize: 10,
        formatter: (v: number) =>
          view === 'qty' ? formatNumber(v)
          : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt`
          : `${(v / 1_000).toFixed(0)}rb`,
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#64748B', fontSize: 10.5, width: 200 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: values.map((v) => ({
        value: v,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${cfg.color}30` },
              { offset: 1, color: cfg.color },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 16,
      label: {
        show: true,
        position: 'right',
        formatter: (p: { value: unknown }) => fmt(view, Number(p.value)),
        color: '#64748B',
        fontSize: 10,
        fontWeight: 600,
      },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Top 10 Produk Terlaris</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Berdasarkan performa penjualan</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${view === v.key ? 'bg-white shadow-sm' : 'text-[#64748B]'}`}
              style={{ color: view === v.key ? v.color : undefined }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 rounded-md bg-slate-100 animate-pulse" style={{ width: `${90 - i * 8}%` }} />
          ))}</div>
        ) : isError || products.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts option={option} style={{ height: Math.max(products.length * 40 + 16, 200) }} notMerge />
        )}
      </div>
    </div>
  )
}
