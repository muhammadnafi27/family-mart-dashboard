'use client'

import ReactECharts from 'echarts-for-react'
import { usePaymentMethods } from '@/hooks/usePayments'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { PaymentMethodStat } from '@/types/payment'

const METHOD_COLORS: Record<string, string> = {
  'Cash': '#22C55E', 'Tunai': '#22C55E', 'Kartu Debit': '#0878C8', 'Kartu Kredit': '#8B5CF6',
  'QRIS': '#F97316', 'Transfer': '#0EA5E9', 'GoPay': '#37B220', 'OVO': '#7C3AED', 'Dana': '#3B82F6',
}
function getColor(name: string, idx: number) {
  return METHOD_COLORS[name] ?? ['#0878C8','#37B220','#F97316','#8B5CF6','#EC4899','#0EA5E9'][idx % 6]
}

export function PaymentMethodChart() {
  const { data, isLoading, isError } = usePaymentMethods()
  const methods: PaymentMethodStat[] = Array.isArray(data) ? data : []

  const grandTotal = methods.reduce((s, m) => s + m.total_amount, 0)
  const cashTotal = methods.filter((m) => m.is_cash).reduce((s, m) => s + m.total_amount, 0)
  const nonCashTotal = grandTotal - cashTotal

  const donutOption = {
    tooltip: {
      trigger: 'item', backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number; dataIndex: number }) => {
        const m = methods[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Total: <b>${formatCurrency(p.value)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Transaksi: <b>${formatNumber(m?.transaction_count ?? 0)}</b></p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Porsi: <b>${p.percent.toFixed(1)}%</b></p>
          <p style="font-size:11px;margin-top:2px">Tipe: <b style="color:${m?.is_cash ? '#22C55E' : '#0878C8'}">${m?.is_cash ? 'Tunai' : 'Non-Tunai'}</b></p>`
      },
    },
    series: [{
      type: 'pie', radius: ['48%', '72%'], center: ['40%', '50%'], padAngle: 2,
      data: methods.map((m, i) => ({
        name: m.method_name, value: m.total_amount,
        itemStyle: { color: getColor(m.method_name, i), borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
    legend: { orient: 'vertical', right: '2%', top: 'middle', textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8 },
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Distribusi Metode Bayar</h3>
        <p className="text-xs text-[#64748B] mt-0.5">{methods.length} metode pembayaran aktif</p>
      </div>
      <div className="p-5">
        {isLoading ? <div className="h-52 rounded-xl bg-slate-100 animate-pulse" /> :
          isError || methods.length === 0 ? <div className="h-52 flex items-center justify-center text-sm text-[#64748B]">{isError ? 'Gagal' : 'Tidak ada data'}</div> :
          <>
            <ReactECharts option={donutOption} style={{ height: 200 }} notMerge />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Tunai', value: cashTotal, color: '#22C55E', bg: '#F0FDF4' },
                { label: 'Non-Tunai', value: nonCashTotal, color: '#0878C8', bg: '#EFF6FF' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: s.bg }}>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm font-extrabold mt-0.5" style={{ color: s.color }}>{formatCurrency(s.value)}</p>
                  <p className="text-[10px] text-[#94A3B8]">{grandTotal > 0 ? `${((s.value / grandTotal) * 100).toFixed(1)}%` : '0%'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {methods.map((m, i) => (
                <div key={m.method_name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: getColor(m.method_name, i) }} />
                  <span className="text-xs text-[#64748B] flex-1 truncate">{m.method_name}</span>
                  <span className="text-xs font-semibold text-[#0F172A] tabular-nums">{formatCurrency(m.total_amount)}</span>
                  <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[38px] text-center" style={{ background: `${getColor(m.method_name, i)}15`, color: getColor(m.method_name, i) }}>
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
        }
      </div>
    </div>
  )
}
