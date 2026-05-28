'use client'

import ReactECharts from 'echarts-for-react'
import { useAdjustmentTrend } from '@/hooks/useInventory'
import { formatDate } from '@/lib/format'
import type { AdjustmentTrendPoint } from '@/types/inventory'

export function InventoryAdjustmentChart() {
  const { data, isLoading, isError } = useAdjustmentTrend()
  const trend: AdjustmentTrendPoint[] = Array.isArray(data) ? data : []

  const xData = trend.map((t) => formatDate(t.date, 'dd/MM'))
  const posData = trend.map((t) => t.positive_qty)
  const negData = trend.map((t) => t.negative_qty)
  const netData = trend.map((t) => t.net_qty)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (params: { name: string; value: number; seriesName: string; color: string }[]) => {
        let html = `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${params[0]?.name}</p>`
        params.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="font-size:11px;color:#64748B">${p.seriesName}: <b>${p.value > 0 ? '+' : ''}${p.value}</b></span>
          </div>`
        })
        return html
      },
    },
    legend: {
      data: ['Masuk (+)', 'Keluar (-)', 'Net'],
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 11 },
      icon: 'circle',
      itemWidth: 8, itemHeight: 8, itemGap: 16,
    },
    grid: { top: 12, right: 16, bottom: 44, left: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 11, interval: Math.max(0, Math.floor(xData.length / 8) - 1) },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94A3B8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Masuk (+)',
        type: 'bar',
        stack: 'adj',
        data: posData,
        itemStyle: { color: '#22C55E', borderRadius: [2, 2, 0, 0] },
        barMaxWidth: 28,
      },
      {
        name: 'Keluar (-)',
        type: 'bar',
        stack: 'adj',
        data: negData.map((v) => -v),
        itemStyle: { color: '#EF4444', borderRadius: [0, 0, 2, 2] },
        barMaxWidth: 28,
      },
      {
        name: 'Net',
        type: 'line',
        data: netData,
        smooth: true,
        lineStyle: { color: '#0878C8', width: 2.5 },
        itemStyle: { color: '#0878C8' },
        showSymbol: false,
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Tren Penyesuaian Inventori</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Pergerakan stok masuk dan keluar harian</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="h-56 w-full rounded-xl bg-slate-100 animate-pulse" />
        ) : isError ? (
          <div className="h-56 flex items-center justify-center text-sm text-[#64748B]">Gagal memuat data</div>
        ) : trend.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-[#64748B]">Tidak ada adjustment dalam periode ini</div>
        ) : (
          <ReactECharts option={option} style={{ height: 240 }} notMerge />
        )}
      </div>
    </div>
  )
}
