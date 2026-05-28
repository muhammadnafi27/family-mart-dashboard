'use client'

import ReactECharts from 'echarts-for-react'
import { useMembershipTiers, useMemberSegments } from '@/hooks/useCustomers'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { MembershipTierStat, MemberVsNonMember } from '@/types/customer'

const TIER_COLORS: Record<string, string> = {
  'Platinum': '#7C3AED',
  'Gold':     '#D97706',
  'Silver':   '#64748B',
  'Bronze':   '#92400E',
  'Non-Member': '#CBD5E1',
}
const SEGMENT_COLORS = { 'Member': '#0878C8', 'Non-Member': '#E2E8F0' }

export function MembershipTierChart() {
  const { data: tiers, isLoading: tiersLoading } = useMembershipTiers()
  const { data: segments, isLoading: segmentsLoading } = useMemberSegments()

  const tierData: MembershipTierStat[] = Array.isArray(tiers) ? tiers : []
  const segData: MemberVsNonMember[] = Array.isArray(segments) ? segments : []

  const donutOption = {
    tooltip: {
      trigger: 'item', backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number; dataIndex: number }) => {
        const t = tierData[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Anggota: <b>${formatNumber(p.value)}</b> (${p.percent.toFixed(1)}%)</p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Revenue: <b>${formatCurrency(t?.total_revenue ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Avg Order: <b>${formatCurrency(t?.avg_order ?? 0)}</b></p>`
      },
    },
    legend: { orient: 'vertical', right: '2%', top: 'middle', textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8 },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['38%', '50%'],
      padAngle: 2,
      data: tierData.map((t) => ({
        name: t.tier_name, value: t.count,
        itemStyle: { color: TIER_COLORS[t.tier_name] ?? '#94A3B8', borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
  }

  const barOption = {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { name: string; seriesName: string; value: number; color: string }[]) => {
        let html = `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${params[0]?.name}</p>`
        params.forEach((p) => html += `<p style="font-size:11px;color:#64748B">${p.seriesName}: <b style="color:${p.color}">${p.seriesName === 'Pelanggan' ? formatNumber(p.value) : formatCurrency(p.value)}</b></p>`)
        return html
      },
    },
    grid: { top: 8, right: 16, bottom: 8, left: 8, containLabel: true },
    xAxis: { type: 'category', data: segData.map((s) => s.segment), axisLabel: { color: '#64748B', fontSize: 12 }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: [
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10 }, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLine: { show: false } },
      { type: 'value', axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => `${(v / 1_000_000).toFixed(0)}jt` }, splitLine: { show: false }, axisLine: { show: false } },
    ],
    series: [
      { name: 'Pelanggan', type: 'bar', data: segData.map((s, i) => ({ value: s.customer_count, itemStyle: { color: Object.values(SEGMENT_COLORS)[i] ?? '#64748B', borderRadius: [4, 4, 0, 0] } })), barWidth: 40 },
      { name: 'Revenue', type: 'line', yAxisIndex: 1, data: segData.map((s) => s.total_revenue), smooth: true, lineStyle: { color: '#37B220', width: 2.5 }, itemStyle: { color: '#37B220' }, showSymbol: true, symbolSize: 8 },
    ],
    legend: { bottom: 0, textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 20 },
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Distribusi Membership</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Tier anggota & perbandingan segmen</p>
      </div>
      <div className="p-5 space-y-5">
        {tiersLoading ? <div className="h-40 rounded-xl bg-slate-100 animate-pulse" /> :
          <ReactECharts option={donutOption} style={{ height: 180 }} notMerge />}
        {segmentsLoading ? <div className="h-36 rounded-xl bg-slate-100 animate-pulse" /> :
          segData.length > 0 && <ReactECharts option={barOption} style={{ height: 160 }} notMerge />}
      </div>
    </div>
  )
}
