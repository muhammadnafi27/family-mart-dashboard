'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useRevenueTrend } from '@/hooks/useOverview'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/format'

/* ─── Skeleton ─── */
function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-slate-100 animate-pulse"
      style={{ height }}
    />
  )
}

/* ─── Empty ─── */
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#64748B]">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F1F5F9" />
        <path d="M12 36 L20 24 L28 28 L36 16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

/* ─── Chart tabs ─── */
type Tab = 'revenue' | 'transactions'

export function RevenueChart() {
  const { data, isLoading, isError } = useRevenueTrend()
  const [activeTab, setActiveTab] = React.useState<Tab>('revenue')
  const trend: { date: string; revenue: number; transactions: number; avg_order: number }[] =
    data?.trend ?? []

  const xData = trend.map((d) => formatDate(d.date, 'dd MMM'))
  const revenueData = trend.map((d) => d.revenue)
  const txData = trend.map((d) => d.transactions)

  const option = {
    animation: true,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#0F172A', fontSize: 12 },
      axisPointer: { type: 'cross', lineStyle: { color: '#E2E8F0' } },
      formatter: (params: { name: string; value: number; seriesName: string; color: string }[]) => {
        const date = params[0]?.name ?? ''
        let html = `<p style="font-weight:700;font-size:12px;margin-bottom:8px;color:#0F172A">${date}</p>`
        params.forEach((p) => {
          const val =
            p.seriesName === 'Revenue'
              ? formatCurrency(p.value)
              : `${Number(p.value).toLocaleString('id-ID')} transaksi`
          html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="color:#64748B;font-size:11px">${p.seriesName}</span>
            <span style="font-weight:700;font-size:11px;margin-left:auto">${val}</span>
          </div>`
        })
        return html
      },
    },
    legend: {
      data: ['Revenue', 'Transaksi'],
      bottom: 0,
      left: 'center',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#64748B', fontSize: 12 },
      itemGap: 20,
    },
    grid: { top: 16, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 11, interval: Math.floor(xData.length / 8) },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
          formatter: (v: number) =>
            v >= 1_000_000
              ? `${(v / 1_000_000).toFixed(1)}jt`
              : v >= 1000
                ? `${(v / 1_000).toFixed(0)}rb`
                : String(v),
        },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      {
        type: 'value',
        axisLabel: { color: '#94A3B8', fontSize: 11 },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        data: revenueData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: '#0878C8', width: 2.5 },
        itemStyle: { color: '#0878C8' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(8,120,200,0.20)' },
              { offset: 1, color: 'rgba(8,120,200,0.01)' },
            ],
          },
        },
        emphasis: { focus: 'series' },
      },
      {
        name: 'Transaksi',
        type: 'line',
        yAxisIndex: 1,
        data: txData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: '#37B220', width: 2, type: 'dashed' },
        itemStyle: { color: '#37B220' },
        emphasis: { focus: 'series' },
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Tren Revenue</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Pendapatan & transaksi harian</p>
        </div>
        <div className="flex items-center gap-1 bg-[#F8FAFC] rounded-lg p-1">
          {(['revenue', 'transactions'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === t
                  ? 'bg-white text-[#0878C8] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t === 'revenue' ? 'Revenue' : 'Transaksi'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="p-5">
        {isLoading ? (
          <ChartSkeleton height={280} />
        ) : isError ? (
          <EmptyChart message="Gagal memuat data grafik" />
        ) : trend.length === 0 ? (
          <EmptyChart message="Tidak ada data untuk periode ini" />
        ) : (
          <ReactECharts
            option={
              activeTab === 'transactions'
                ? {
                    ...option,
                    series: [
                      {
                        name: 'Transaksi',
                        type: 'bar',
                        data: txData,
                        itemStyle: {
                          color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                              { offset: 0, color: '#37B220' },
                              { offset: 1, color: '#37B22040' },
                            ],
                          },
                          borderRadius: [4, 4, 0, 0],
                        },
                        barMaxWidth: 24,
                      },
                    ],
                    yAxis: [{ ...option.yAxis[0], axisLabel: { color: '#94A3B8', fontSize: 11 } }],
                    legend: { ...option.legend, data: ['Transaksi'] },
                  }
                : option
            }
            style={{ height: 280 }}
            notMerge
          />
        )}
      </div>
    </div>
  )
}
