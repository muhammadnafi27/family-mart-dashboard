'use client'

import ReactECharts from 'echarts-for-react'
import { useCouponStats } from '@/hooks/usePromotions'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { CouponStat } from '@/types/promotion'

export function CouponUsageChart() {
  const { data, isLoading, isError } = useCouponStats()
  const coupons: CouponStat[] = Array.isArray(data) ? data : []

  const totalIssued = coupons.reduce((s, c) => s + c.total_issued, 0)
  const totalUsed   = coupons.reduce((s, c) => s + c.total_used, 0)
  const overallRate = totalIssued > 0 ? (totalUsed / totalIssued) * 100 : 0

  /* Donut: total used vs unused */
  const donutOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number }) =>
        `<p style="font-weight:700;font-size:12px;color:#0F172A">${p.name}</p>
         <p style="font-size:11px;color:#64748B">${formatNumber(p.value)} kupon (${p.percent.toFixed(1)}%)</p>`,
    },
    series: [{
      type: 'pie',
      radius: ['52%', '75%'],
      center: ['50%', '50%'],
      padAngle: 3,
      data: [
        { name: 'Digunakan', value: totalUsed, itemStyle: { color: '#0878C8', borderRadius: 6, borderColor: '#fff', borderWidth: 2 } },
        { name: 'Belum Digunakan', value: totalIssued - totalUsed, itemStyle: { color: '#E2E8F0', borderRadius: 6, borderColor: '#fff', borderWidth: 2 } },
      ],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 700, formatter: '{d}%', color: '#0F172A' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' },
      },
    }],
  }

  /* Horizontal bar per promotion */
  const sorted = [...coupons].sort((a, b) => b.usage_rate - a.usage_rate).slice(0, 10)
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (params: { dataIndex: number; value: number; seriesName: string }[]) => {
        const p = params[0]
        const c = sorted[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${c?.promo_name}</p>
          <p style="font-size:11px;color:#64748B">Dikeluarkan: <b>${formatNumber(c?.total_issued ?? 0)}</b></p>
          <p style="font-size:11px;color:#0878C8;margin-top:2px">Digunakan: <b>${formatNumber(c?.total_used ?? 0)}</b></p>
          <p style="font-size:11px;color:#37B220;margin-top:2px">Usage Rate: <b>${formatPercent(c?.usage_rate ?? 0)}</b></p>`
      },
    },
    grid: { top: 8, right: 70, bottom: 8, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#94A3B8', fontSize: 10, formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: sorted.map((c) => c.promo_name.length > 20 ? c.promo_name.slice(0, 20) + '…' : c.promo_name),
      axisLabel: { color: '#64748B', fontSize: 10.5 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: sorted.map((c) => ({
        value: c.usage_rate,
        itemStyle: {
          color: c.usage_rate >= 70 ? '#37B220' : c.usage_rate >= 40 ? '#0878C8' : '#F97316',
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 16,
      label: {
        show: true, position: 'right',
        formatter: (p: { value: unknown }) => `${Number(p.value).toFixed(1)}%`,
        color: '#64748B', fontSize: 10, fontWeight: 600,
      },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Analitik Kupon</h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          {!isLoading && `${formatNumber(totalUsed)} / ${formatNumber(totalIssued)} kupon digunakan`}
        </p>
      </div>
      <div className="p-5">
        {isLoading
          ? <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          : isError || coupons.length === 0
            ? <div className="h-64 flex items-center justify-center text-sm text-[#64748B]">{isError ? 'Gagal memuat' : 'Tidak ada kupon'}</div>
            : (
              <div className="space-y-5">
                {/* Summary + Donut */}
                <div className="flex items-center gap-5">
                  <div className="w-32 shrink-0">
                    <ReactECharts option={donutOption} style={{ height: 120, width: 120 }} notMerge />
                  </div>
                  <div className="flex-1 space-y-3">
                    {[
                      { label: 'Total Dikeluarkan', value: formatNumber(totalIssued), color: '#64748B' },
                      { label: 'Digunakan', value: formatNumber(totalUsed), color: '#0878C8' },
                      { label: 'Belum Digunakan', value: formatNumber(totalIssued - totalUsed), color: '#94A3B8' },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between items-center">
                        <span className="text-xs text-[#64748B]">{s.label}</span>
                        <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                    {/* Rate bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-[#64748B] mb-1">
                        <span>Usage Rate</span>
                        <span className="font-bold text-[#0878C8]">{formatPercent(overallRate)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div className="h-full rounded-full bg-[#0878C8]" style={{ width: `${overallRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-promo bar */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] mb-2">Usage Rate per Promosi</p>
                  <ReactECharts option={barOption} style={{ height: Math.max(sorted.length * 34 + 16, 120) }} notMerge />
                </div>
              </div>
            )}
      </div>
    </div>
  )
}
