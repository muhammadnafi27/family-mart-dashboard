'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useStoreSales } from '@/hooks/useSales'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { StoreSalePoint } from '@/types/sales'

type Metric = 'revenue' | 'transactions' | 'avg_order'
const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: 'revenue',       label: 'Revenue',    color: '#0878C8' },
  { key: 'transactions',  label: 'Transaksi',  color: '#37B220' },
  { key: 'avg_order',     label: 'Avg/Order',  color: '#8B5CF6' },
]

function fmt(key: Metric, v: number) {
  return key === 'transactions' ? `${formatNumber(v)} trx` : formatCurrency(v)
}

export function StoreSalesChart() {
  const [metric, setMetric] = React.useState<Metric>('revenue')
  const { data, isLoading, isError } = useStoreSales()
  const stores: StoreSalePoint[] = Array.isArray(data) ? data : []

  const sorted = [...stores].sort((a, b) => a[metric] - b[metric])
  const cfg = METRICS.find((m) => m.key === metric)!
  const maxVal = Math.max(...sorted.map((s) => s[metric]), 1)

  const names = sorted.map((s) => {
    const n = s.store_name.replace(/familymart|family mart/gi, 'FM').trim()
    return n.length > 22 ? n.slice(0, 22) + '…' : n
  })

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
        const s = sorted[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${s?.store_name}</p>
          <p style="font-size:11px;color:#64748B">Revenue: <b>${formatCurrency(s?.revenue ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Transaksi: <b>${formatNumber(s?.transactions ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Avg/Order: <b>${formatCurrency(s?.avg_order ?? 0)}</b></p>`
      },
    },
    grid: { top: 8, right: 80, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#94A3B8', fontSize: 10,
        formatter: (v: number) =>
          metric === 'transactions'
            ? `${(v / 1000).toFixed(0)}k`
            : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`,
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
      data: sorted.map((s, i) => ({
        value: s[metric],
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: `${cfg.color}${Math.round(40 + (s[metric] / maxVal) * 60).toString(16)}` },
              { offset: 1, color: cfg.color },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: (p: { value: unknown }) => fmt(metric, Number(p.value)),
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
          <h3 className="text-sm font-bold text-[#0F172A]">Penjualan per Toko</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{stores.length} toko aktif</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                metric === m.key ? 'bg-white shadow-sm' : 'text-[#64748B]'
              }`}
              style={{ color: metric === m.key ? m.color : undefined }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 rounded-md bg-slate-100 animate-pulse" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        ) : isError || stores.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: Math.max(stores.length * 40 + 16, 200) }}
            notMerge
          />
        )}
      </div>
    </div>
  )
}
