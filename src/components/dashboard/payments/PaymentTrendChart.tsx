'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { usePaymentTrend } from '@/hooks/usePayments'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { PaymentTrendPoint } from '@/types/payment'

type View = 'total' | 'split' | 'count'

export function PaymentTrendChart() {
  const [view, setView] = React.useState<View>('total')
  const { data, isLoading, isError } = usePaymentTrend()
  const trend: PaymentTrendPoint[] = Array.isArray(data) ? data : []

  const xData = trend.map((t) => formatDate(t.date, 'dd/MM'))

  const totalOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { name: string; value: number; seriesName: string; color: string }[]) => {
        let html = `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${params[0]?.name}</p>`
        params.forEach((p) => {
          const val = p.seriesName === 'Transaksi'
            ? `${formatNumber(p.value)} trx`
            : formatCurrency(p.value)
          html += `<p style="font-size:11px;color:#64748B">${p.seriesName}: <b style="color:${p.color}">${val}</b></p>`
        })
        return html
      },
    },
    legend: { bottom: 0, textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20 },
    grid: { top: 12, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: {
      type: 'category', data: xData, boundaryGap: false,
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 11, interval: Math.max(0, Math.floor(xData.length / 8) - 1) },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${(v / 1_000).toFixed(0)}rb` },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
        axisLine: { show: false }, axisTick: { show: false },
      },
      {
        type: 'value',
        axisLabel: { color: '#94A3B8', fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: false }, axisTick: { show: false },
      },
    ],
    series: [
      {
        name: 'Total Bayar',
        type: 'line', smooth: true, showSymbol: false,
        data: trend.map((t) => t.total_amount),
        lineStyle: { color: '#0878C8', width: 2.5 },
        itemStyle: { color: '#0878C8' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(8,120,200,0.2)' }, { offset: 1, color: 'rgba(8,120,200,0.01)' }] } },
      },
      {
        name: 'Transaksi',
        type: 'bar', yAxisIndex: 1,
        data: trend.map((t) => t.transaction_count),
        itemStyle: { color: '#37B22020', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 24,
      },
    ],
  }

  const splitOption = {
    ...totalOption,
    series: [
      {
        name: 'Tunai',
        type: 'bar', stack: 'split',
        data: trend.map((t) => t.cash_amount),
        itemStyle: { color: '#22C55E', borderRadius: [0, 0, 0, 0] },
        barMaxWidth: 28,
      },
      {
        name: 'Non-Tunai',
        type: 'bar', stack: 'split',
        data: trend.map((t) => t.non_cash_amount),
        itemStyle: { color: '#0878C8', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 28,
      },
    ],
    yAxis: [totalOption.yAxis[0]],
  }

  const countOption = {
    ...totalOption,
    yAxis: [{
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false },
    }],
    series: [{
      name: 'Transaksi',
      type: 'bar',
      data: trend.map((t) => t.transaction_count),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#0878C8' }, { offset: 1, color: '#0878C820' }] },
        borderRadius: [4, 4, 0, 0],
      },
      barMaxWidth: 28,
    }],
  }

  const activeOption = view === 'total' ? totalOption : view === 'split' ? splitOption : countOption

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Tren Pembayaran</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {trend.length > 0 ? `${xData[0]} – ${xData[xData.length - 1]}` : 'Tidak ada data'}
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {([['total','Total'],['split','Tunai/Non'],['count','Jumlah Trx']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setView(k as View)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${view === k ? 'bg-white shadow-sm text-[#0878C8]' : 'text-[#64748B]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {isLoading
          ? <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          : isError || trend.length === 0
            ? <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">{isError ? 'Gagal' : 'Tidak ada data'}</div>
            : <ReactECharts option={activeOption} style={{ height: 260 }} notMerge />
        }
      </div>
    </div>
  )
}
