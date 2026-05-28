'use client'

import ReactECharts from 'echarts-for-react'
import { usePaymentDistribution } from '@/hooks/useOverview'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#0878C8', '#37B220', '#F97316', '#8B5CF6', '#EC4899', '#0EA5E9']

export function PaymentMethodChart() {
  const { data, isLoading, isError } = usePaymentDistribution()
  const methods: { method_name: string; total: number; count: number; percent: number }[] =
    data?.payments ?? []

  const grandTotal = methods.reduce((s, m) => s + m.total, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number; dataIndex: number }) => {
        const m = methods[p.dataIndex]
        return `
          <p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Total: <b>${formatCurrency(p.value)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Transaksi: <b>${m?.count?.toLocaleString('id-ID')}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Porsi: <b>${p.percent.toFixed(1)}%</b></p>
        `
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '48%'],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 12, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' },
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 700,
            color: '#0F172A',
            formatter: '{d}%',
          },
        },
        data: methods.map((m, i) => ({
          name: m.method_name,
          value: m.total,
          itemStyle: { color: COLORS[i % COLORS.length] },
        })),
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full flex flex-col">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Metode Pembayaran</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Distribusi per metode bayar</p>
      </div>

      <div className="flex-1 p-5">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-40 w-40 rounded-full bg-slate-100 animate-pulse" />
            <div className="space-y-2 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 rounded-md bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        ) : isError || methods.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">
            {isError ? 'Gagal memuat data' : 'Tidak ada data'}
          </div>
        ) : (
          <>
            <ReactECharts option={option} style={{ height: 200 }} notMerge />

            {/* Legend table */}
            <div className="mt-3 space-y-2">
              {methods.map((m, i) => (
                <div key={m.method_name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-[#64748B] flex-1 truncate">{m.method_name}</span>
                  <span className="text-xs font-semibold text-[#0F172A] tabular-nums">
                    {formatCurrency(m.total)}
                  </span>
                  <span
                    className="text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[38px] text-center"
                    style={{
                      background: `${COLORS[i % COLORS.length]}15`,
                      color: COLORS[i % COLORS.length],
                    }}
                  >
                    {m.percent.toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-1 border-t border-[#F1F5F9] flex justify-between">
                <span className="text-xs font-semibold text-[#64748B]">Total</span>
                <span className="text-xs font-bold text-[#0878C8]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
