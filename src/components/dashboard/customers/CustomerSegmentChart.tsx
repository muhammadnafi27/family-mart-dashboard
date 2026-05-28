'use client'

import ReactECharts from 'echarts-for-react'
import { useCustomersByCity } from '@/hooks/useCustomers'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { CustomerByCityPoint } from '@/types/customer'

const COLORS = ['#0878C8','#37B220','#F97316','#8B5CF6','#EC4899','#0EA5E9','#22C55E','#F59E0B']

export function CustomerSegmentChart() {
  const { data, isLoading, isError } = useCustomersByCity()
  const cities: CustomerByCityPoint[] = Array.isArray(data) ? data : []
  const top10 = cities.slice(0, 10)

  const option = {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { dataIndex: number; value: number; seriesName: string }[]) => {
        const city = top10[params[0]?.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${city?.city_name}</p>
          <p style="font-size:11px;color:#64748B">Pelanggan: <b>${formatNumber(city?.customer_count ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Revenue: <b>${formatCurrency(city?.total_revenue ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Avg Belanja: <b>${formatCurrency(city?.avg_spent ?? 0)}</b></p>`
      },
    },
    grid: { top: 8, right: 16, bottom: 40, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: top10.map((c) => c.city_name),
      axisLabel: { color: '#94A3B8', fontSize: 10, rotate: 20 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: [
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10 }, splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }, axisLine: { show: false } },
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => `${(v / 1_000_000).toFixed(0)}jt` }, splitLine: { show: false }, axisLine: { show: false } },
    ],
    series: [
      { name: 'Pelanggan', type: 'bar', data: top10.map((c, i) => ({ value: c.customer_count, itemStyle: { color: COLORS[i % COLORS.length], borderRadius: [4, 4, 0, 0] } })), barMaxWidth: 32 },
      { name: 'Revenue', type: 'line', yAxisIndex: 1, data: top10.map((c) => c.total_revenue), smooth: true, lineStyle: { color: '#37B220', width: 2 }, itemStyle: { color: '#37B220' }, showSymbol: true, symbolSize: 6 },
    ],
    legend: { bottom: 0, textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8 },
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Pelanggan per Kota</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Top 10 kota berdasarkan jumlah pelanggan</p>
      </div>
      <div className="p-5">
        {isLoading ? <div className="h-52 rounded-xl bg-slate-100 animate-pulse" /> :
          isError || cities.length === 0 ? <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">{isError ? 'Gagal' : 'Tidak ada data'}</div> :
          <ReactECharts option={option} style={{ height: 230 }} notMerge />}
      </div>
    </div>
  )
}
