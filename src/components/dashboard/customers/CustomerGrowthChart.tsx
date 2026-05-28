'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { useCustomerGrowth } from '@/hooks/useCustomers'
import { formatDate } from '@/lib/format'
import type { CustomerGrowthPoint } from '@/types/customer'

export function CustomerGrowthChart() {
  const [view, setView] = React.useState<'new' | 'cumulative'>('new')
  const { data, isLoading, isError } = useCustomerGrowth()
  const points: CustomerGrowthPoint[] = Array.isArray(data) ? data : []

  const xData = points.map((p) => formatDate(p.month, 'MMM yyyy'))
  const yData = points.map((p) => view === 'new' ? p.new_customers : p.cumulative)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:4px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">${view === 'new' ? 'Pelanggan Baru' : 'Kumulatif'}: <b style="color:#0878C8">${p.value.toLocaleString('id-ID')}</b></p>`
      },
    },
    grid: { top: 12, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: {
      type: 'category', data: xData, boundaryGap: view === 'new',
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 11, interval: Math.max(0, Math.floor(xData.length / 6) - 1) },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: view === 'new' ? 'bar' : 'line',
      data: yData,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: '#0878C8', borderRadius: view === 'new' ? [4, 4, 0, 0] : undefined },
      lineStyle: { color: '#0878C8', width: 2.5 },
      barMaxWidth: 32,
      areaStyle: view === 'cumulative' ? {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(8,120,200,0.25)' }, { offset: 1, color: 'rgba(8,120,200,0.01)' }] }
      } : undefined,
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Pertumbuhan Pelanggan</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{points.length} bulan data</p>
        </div>
        <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
          {(['new', 'cumulative'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${view === v ? 'bg-white shadow-sm text-[#0878C8]' : 'text-[#64748B]'}`}>
              {v === 'new' ? 'Baru/Bulan' : 'Kumulatif'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {isLoading ? <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" /> :
          isError || points.length === 0 ? <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">{isError ? 'Gagal memuat data' : 'Tidak ada data'}</div> :
          <ReactECharts option={option} style={{ height: 220 }} notMerge />}
      </div>
    </div>
  )
}
