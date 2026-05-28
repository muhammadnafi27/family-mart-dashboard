'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { usePromoUsageStats, usePromoTrend } from '@/hooks/usePromotions'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { PromoUsageStat, PromoRevenueTrendPoint } from '@/types/promotion'

const STATUS_COLORS = { active: '#22C55E', expired: '#94A3B8', upcoming: '#F97316' }

type View = 'usage' | 'discount' | 'revenue'
const VIEWS: { key: View; label: string; color: string }[] = [
  { key: 'usage',    label: 'Penggunaan', color: '#0878C8' },
  { key: 'discount', label: 'Diskon',     color: '#F97316' },
  { key: 'revenue',  label: 'Revenue',    color: '#37B220' },
]

export function PromotionUsageChart() {
  const [view, setView] = React.useState<View>('usage')
  const { data: usageData, isLoading: uLoad } = usePromoUsageStats()
  const { data: trendData, isLoading: tLoad } = usePromoTrend()

  const promos: PromoUsageStat[] = (Array.isArray(usageData) ? usageData : []).slice(0, 12)
  const trend: PromoRevenueTrendPoint[] = Array.isArray(trendData) ? trendData : []

  const cfg = VIEWS.find((v) => v.key === view)!
  const sorted = [...promos].sort((a, b) => {
    if (view === 'usage') return a.usage_count - b.usage_count
    if (view === 'discount') return a.total_discount - b.total_discount
    return a.revenue - b.revenue
  })
  const names = sorted.map((p) => p.promo_name.length > 22 ? p.promo_name.slice(0, 22) + '…' : p.promo_name)
  const values = sorted.map((p) => view === 'usage' ? p.usage_count : view === 'discount' ? p.total_discount : p.revenue)

  const barOption = {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { dataIndex: number; value: number }[]) => {
        const p = params[0]; const pr = sorted[p.dataIndex]
        const sc = STATUS_COLORS[pr?.status ?? 'active']
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${pr?.promo_name}</p>
          <p style="font-size:11px;color:#64748B">Kode: <b>${pr?.promo_code}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Digunakan: <b>${formatNumber(pr?.usage_count ?? 0)}×</b></p>
          <p style="font-size:11px;color:#F97316;margin-top:2px">Diskon: <b>${formatCurrency(pr?.total_discount ?? 0)}</b></p>
          <p style="font-size:11px;color:#37B220;margin-top:2px">Revenue: <b>${formatCurrency(pr?.revenue ?? 0)}</b></p>
          <p style="font-size:11px;margin-top:4px">Status: <b style="color:${sc}">${pr?.status}</b></p>`
      },
    },
    grid: { top: 8, right: 90, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => view === 'usage' ? formatNumber(v) : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${(v / 1_000).toFixed(0)}rb` },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }, axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: { type: 'category', data: names, axisLabel: { color: '#64748B', fontSize: 10.5 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar',
      data: values.map((v) => ({ value: v, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: `${cfg.color}25` }, { offset: 1, color: cfg.color }] }, borderRadius: [0, 6, 6, 0] } })),
      barWidth: 16,
      label: { show: true, position: 'right', formatter: (p: { value: unknown }) => view === 'usage' ? `${formatNumber(Number(p.value))}×` : `${(Number(p.value) / 1_000_000).toFixed(1)}jt`, color: '#64748B', fontSize: 10, fontWeight: 600 },
    }],
  }

  const trendOption = {
    tooltip: {
      trigger: 'axis', backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { name: string; value: number; seriesName: string; color: string }[]) => {
        let html = `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${params[0]?.name}</p>`
        params.forEach((p) => {
          const val = p.seriesName === 'Transaksi' ? `${formatNumber(p.value)} trx` : formatCurrency(p.value)
          html += `<p style="font-size:11px;color:#64748B">${p.seriesName}: <b style="color:${p.color}">${val}</b></p>`
        })
        return html
      },
    },
    legend: { bottom: 0, textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 16 },
    grid: { top: 12, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: { type: 'category', data: trend.map((t) => formatDate(t.month, 'MMM yy')), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#94A3B8', fontSize: 11 } },
    yAxis: [
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => `${(v / 1_000_000).toFixed(0)}jt` }, splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }, axisLine: { show: false }, axisTick: { show: false } },
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10 }, splitLine: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    ],
    series: [
      { name: 'Revenue', type: 'line', smooth: true, showSymbol: false, data: trend.map((t) => t.revenue), lineStyle: { color: '#37B220', width: 2.5 }, itemStyle: { color: '#37B220' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(55,178,32,0.2)' }, { offset: 1, color: 'rgba(55,178,32,0.01)' }] } } },
      { name: 'Diskon', type: 'line', smooth: true, showSymbol: false, data: trend.map((t) => t.discount), lineStyle: { color: '#F97316', width: 2, type: 'dashed' }, itemStyle: { color: '#F97316' } },
      { name: 'Transaksi', type: 'bar', yAxisIndex: 1, data: trend.map((t) => t.transaction_count), itemStyle: { color: '#0878C820', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 24 },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Analitik Promosi</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{promos.length} promosi tercatat</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {VIEWS.map((v) => (
            <button key={v.key} onClick={() => setView(v.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${view === v.key ? 'bg-white shadow-sm' : 'text-[#64748B]'}`}
              style={{ color: view === v.key ? v.color : undefined }}>{v.label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#F1F5F9]">
        <div className="lg:col-span-3 p-5">
          <p className="text-xs font-semibold text-[#64748B] mb-3">Performa per Promosi</p>
          {uLoad ? <div className="h-48 rounded-xl bg-slate-100 animate-pulse" /> :
            promos.length === 0 ? <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">Tidak ada data</div> :
            <ReactECharts option={barOption} style={{ height: Math.max(promos.length * 36 + 16, 160) }} notMerge />}
        </div>
        <div className="lg:col-span-2 p-5">
          <p className="text-xs font-semibold text-[#64748B] mb-3">Tren Revenue Promosi</p>
          {tLoad ? <div className="h-48 rounded-xl bg-slate-100 animate-pulse" /> :
            trend.length === 0 ? <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">Tidak ada data</div> :
            <ReactECharts option={trendOption} style={{ height: Math.max(promos.length * 36 + 16, 160) }} notMerge />}
        </div>
      </div>
    </div>
  )
}
