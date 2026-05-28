'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useSalesTrend } from '@/hooks/useSales'
import { useSalesFilterStore } from '@/store/salesFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { SalesTrendPoint } from '@/types/sales'

type Metric = 'revenue' | 'transactions' | 'avg_order' | 'discount'

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: 'revenue',       label: 'Revenue',       color: '#0878C8' },
  { key: 'transactions',  label: 'Transaksi',      color: '#37B220' },
  { key: 'avg_order',     label: 'Avg. Order',     color: '#8B5CF6' },
  { key: 'discount',      label: 'Diskon',         color: '#F97316' },
]

function formatVal(key: Metric, v: number) {
  if (key === 'transactions') return `${formatNumber(v)} trx`
  return formatCurrency(v)
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
      <div className="h-5 w-32 rounded-md bg-slate-100 animate-pulse mb-4" />
      <div className="h-72 w-full rounded-xl bg-slate-100 animate-pulse" />
    </div>
  )
}

export function SalesTrendChart() {
  const [activeMetric, setActiveMetric] = React.useState<Metric>('revenue')
  const { groupBy, setGroupBy } = useSalesFilterStore((s) => ({ groupBy: s.groupBy, setGroupBy: s.setGroupBy }))
  const { data, isLoading, isError } = useSalesTrend()
  const trend: SalesTrendPoint[] = Array.isArray(data) ? data : []

  const fmt = groupBy === 'month' ? 'MMM yyyy' : 'd MMM'
  const xData = trend.map((t) => formatDate(t.date, fmt))
  const yData = trend.map((t) => t[activeMetric])

  const cfg = METRICS.find((m) => m.key === activeMetric)!

  const option = {
    animation: true,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [12, 16],
      axisPointer: { type: 'cross', lineStyle: { color: '#E2E8F0' } },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:12px;color:#64748B">${cfg.label}: <b style="color:${cfg.color}">${formatVal(activeMetric, p.value)}</b></p>`
      },
    },
    grid: { top: 12, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: activeMetric !== 'revenue' && activeMetric !== 'discount',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 11,
        interval: Math.max(0, Math.floor(xData.length / 10) - 1),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#94A3B8',
        fontSize: 11,
        formatter: (v: number) => {
          if (activeMetric === 'transactions') return formatNumber(v)
          return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt`
            : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : String(v)
        },
      },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: activeMetric === 'transactions' ? 'bar' : 'line',
      data: yData,
      smooth: true,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: cfg.color, width: 2.5 },
      itemStyle: {
        color: cfg.color,
        borderRadius: activeMetric === 'transactions' ? [4, 4, 0, 0] : undefined,
      },
      barMaxWidth: 32,
      areaStyle: activeMetric !== 'transactions' ? {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${cfg.color}25` },
            { offset: 1, color: `${cfg.color}00` },
          ],
        },
      } : undefined,
    }],
  }

  if (isLoading) return <Skeleton />

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Tren Penjualan</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {trend.length > 0
              ? `${xData[0]} – ${xData[xData.length - 1]}`
              : 'Tidak ada data'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Metric selector */}
          <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  activeMetric === m.key
                    ? 'bg-white shadow-sm text-[#0F172A]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                )}
                style={{ color: activeMetric === m.key ? m.color : undefined }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Group by */}
          <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
            {(['day', 'month'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  groupBy === g
                    ? 'bg-white shadow-sm text-[#0878C8]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                )}
              >
                {g === 'day' ? 'Harian' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        {isError ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">Gagal memuat data</div>
        ) : trend.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">Tidak ada data untuk periode ini</div>
        ) : (
          <ReactECharts option={option} style={{ height: 280 }} notMerge />
        )}
      </div>
    </div>
  )
}

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}
