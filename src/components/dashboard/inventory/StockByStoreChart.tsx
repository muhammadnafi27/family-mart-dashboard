'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useStockByStore } from '@/hooks/useInventory'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { StockByStorePoint } from '@/types/inventory'

type View = 'qty' | 'value' | 'alerts'
const VIEWS: { key: View; label: string; color: string }[] = [
  { key: 'qty',    label: 'Qty Stok',     color: '#0878C8' },
  { key: 'value',  label: 'Nilai Stok',   color: '#37B220' },
  { key: 'alerts', label: 'Stok Rendah',  color: '#EF4444' },
]

export function StockByStoreChart() {
  const [view, setView] = React.useState<View>('qty')
  const { data, isLoading, isError } = useStockByStore()
  const stores: StockByStorePoint[] = Array.isArray(data) ? data : []

  const cfg = VIEWS.find((v) => v.key === view)!
  const sorted = [...stores].sort((a, b) => {
    if (view === 'qty') return a.total_qty - b.total_qty
    if (view === 'value') return a.total_value - b.total_value
    return a.low_stock_count - b.low_stock_count
  })
  const names = sorted.map((s) => s.store_name.replace(/familymart|family mart/gi, 'FM').trim())
  const values = sorted.map((s) => view === 'qty' ? s.total_qty : view === 'value' ? s.total_value : s.low_stock_count)

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
        const s = sorted[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${s?.store_name}</p>
          <p style="font-size:11px;color:#64748B">Qty Stok: <b>${formatNumber(s?.total_qty ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Nilai Stok: <b>${formatCurrency(s?.total_value ?? 0)}</b></p>
          <p style="font-size:11px;color:#EF4444;margin-top:2px">Stok Rendah: <b>${s?.low_stock_count ?? 0} produk</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Habis: <b>${s?.out_of_stock_count ?? 0} produk</b></p>`
      },
    },
    grid: { top: 8, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94A3B8', fontSize: 10,
        formatter: (v: number) =>
          view === 'value' ? (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`)
          : formatNumber(v),
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
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${cfg.color}25` },
              { offset: 1, color: cfg.color },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 18,
      label: {
        show: true, position: 'right',
        formatter: (p: { value: unknown }) =>
          view === 'value' ? `${(Number(p.value) / 1_000_000).toFixed(1)}jt` : formatNumber(Number(p.value)),
        color: '#64748B', fontSize: 10, fontWeight: 600,
      },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Stok per Toko</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{stores.length} toko aktif</p>
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
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-5 rounded-md bg-slate-100 animate-pulse" style={{ width: `${90 - i * 10}%` }} />
          ))}</div>
        ) : isError || stores.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts option={option} style={{ height: Math.max(stores.length * 40 + 16, 200) }} notMerge />
        )}
      </div>
    </div>
  )
}
