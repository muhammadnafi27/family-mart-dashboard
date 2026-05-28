'use client'

import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, CreditCard } from 'lucide-react'
import { usePaymentStatus, usePaymentTransactions } from '@/hooks/usePayments'
import { usePaymentFilterStore } from '@/store/paymentFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import type { PaymentStatusStat, PaymentTransactionRow } from '@/types/payment'

const STATUS_CFG = {
  success: { bg: '#DCFCE7', color: '#15803D', label: 'Sukses' },
  failed:  { bg: '#FEE2E2', color: '#DC2626', label: 'Gagal' },
  pending: { bg: '#FEF9C3', color: '#A16207', label: 'Pending' },
}

const METHOD_COLOR: Record<string, string> = {
  'Cash':'#22C55E','Tunai':'#22C55E','Kartu Debit':'#0878C8','Kartu Kredit':'#8B5CF6',
  'QRIS':'#F97316','Transfer':'#0EA5E9','GoPay':'#37B220','OVO':'#7C3AED',
}

export function PaymentStatusChart() {
  const { data, isLoading } = usePaymentStatus()
  const statuses: PaymentStatusStat[] = Array.isArray(data) ? data : []

  const option = {
    tooltip: {
      trigger: 'item', backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number }) =>
        `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:4px">${STATUS_CFG[p.name as keyof typeof STATUS_CFG]?.label ?? p.name}</p>
         <p style="font-size:11px;color:#64748B">${formatNumber(p.value)} transaksi (${p.percent.toFixed(1)}%)</p>
         <p style="font-size:11px;color:#64748B;margin-top:2px">Nilai: ${formatCurrency(statuses.find((s) => s.status === p.name)?.total_amount ?? 0)}</p>`,
    },
    series: [{
      type: 'pie', radius: ['50%', '72%'], center: ['50%', '48%'], padAngle: 3,
      data: statuses.map((s) => {
        const cfg = STATUS_CFG[s.status as keyof typeof STATUS_CFG]
        return { name: s.status, value: s.count, itemStyle: { color: cfg?.color ?? '#94A3B8', borderRadius: 6, borderColor: '#fff', borderWidth: 2 } }
      }),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Status Pembayaran</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Distribusi status transaksi</p>
      </div>
      <div className="p-5">
        {isLoading ? <div className="h-48 rounded-xl bg-slate-100 animate-pulse" /> :
          statuses.length === 0 ? <div className="h-48 flex items-center justify-center text-sm text-[#64748B]">Tidak ada data</div> :
          <>
            <ReactECharts option={option} style={{ height: 170 }} notMerge />
            <div className="mt-4 space-y-2">
              {statuses.map((s) => {
                const cfg = STATUS_CFG[s.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending
                return (
                  <div key={s.status} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                    <span className="text-xs text-[#64748B] flex-1">{cfg.label}</span>
                    <span className="text-xs font-semibold text-[#0F172A]">{formatNumber(s.count)}</span>
                    <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 tabular-nums" style={{ background: cfg.bg, color: cfg.color }}>{s.percent.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </>
        }
      </div>
    </div>
  )
}

function SortIcon({ s }: { s: false | 'asc' | 'desc' }) {
  if (s === 'asc') return <ChevronUp className="h-3 w-3 text-[#0878C8]" />
  if (s === 'desc') return <ChevronDown className="h-3 w-3 text-[#0878C8]" />
  return <ChevronsUpDown className="h-3 w-3 text-[#CBD5E1]" />
}

export function PaymentTransactionTable() {
  const { data, isLoading, isError } = usePaymentTransactions()
  const { search, page, pageSize, sortBy, sortDir, setSearch, setPage, setSort } = usePaymentFilterStore()
  const [localSearch, setLocalSearch] = React.useState(search)

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 350)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  const rows: PaymentTransactionRow[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = data?.totalPages ?? 1

  const COLS = [
    { key: 'invoice_number', label: 'Invoice', sortable: false },
    { key: 'store_name', label: 'Toko', sortable: false },
    { key: 'customer_name', label: 'Pelanggan', sortable: false },
    { key: 'method_name', label: 'Metode', sortable: false },
    { key: 'paid_amount', label: 'Jumlah', sortable: true },
    { key: 'payment_time', label: 'Waktu', sortable: true },
    { key: 'reference_no', label: 'Referensi', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
  ]

  function handleSort(key: string) {
    if (!COLS.find((c) => c.key === key)?.sortable) return
    setSort(key, sortBy === key && sortDir === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Transaksi Pembayaran</h3>
          <p className="text-xs text-[#64748B] mt-0.5">{!isLoading && total > 0 && `${((page - 1) * pageSize + 1).toLocaleString('id-ID')}–${Math.min(page * pageSize, total).toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')}`}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
          <input type="text" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Cari invoice / metode..."
            className="h-8 w-56 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {COLS.map((c) => (
                <th key={c.key} onClick={() => handleSort(c.key)}
                  className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap ${c.sortable ? 'cursor-pointer hover:text-[#0878C8] select-none' : ''}`}>
                  <span className="flex items-center gap-1">{c.label}{c.sortable && <SortIcon s={sortBy === c.key ? sortDir : false} />}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-[#F1F5F9]">{COLS.map((_, j) => (
                <td key={j} className="px-3 py-3"><div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: j === 0 ? 88 : 64 }} /></td>
              ))}</tr>
            ))
              : isError ? <tr><td colSpan={COLS.length} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
              : rows.length === 0 ? <tr><td colSpan={COLS.length} className="py-12 text-center"><div className="flex flex-col items-center gap-2 text-[#64748B]"><CreditCard className="h-8 w-8 text-[#CBD5E1]" /><p className="text-sm font-medium">Tidak ada transaksi ditemukan</p></div></td></tr>
              : rows.map((r) => {
                const st = STATUS_CFG[r.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending
                const mc = METHOD_COLOR[r.method_name] ?? '#64748B'
                return (
                  <tr key={r.payment_id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-3 py-2.5"><span className="font-mono text-[11px] font-bold text-[#0878C8]">{r.invoice_number}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] max-w-[100px] truncate block">{r.store_name}</span></td>
                    <td className="px-3 py-2.5">{r.customer_name ? <span className="text-xs text-[#0F172A]">{r.customer_name}</span> : <span className="text-xs italic text-[#94A3B8]">Umum</span>}</td>
                    <td className="px-3 py-2.5"><span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ background: `${mc}15`, color: mc }}>{r.method_name}</span></td>
                    <td className="px-3 py-2.5"><span className="text-sm font-bold text-[#0F172A]">{formatCurrency(r.paid_amount)}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] whitespace-nowrap">{formatDateTime(r.payment_time)}</span></td>
                    <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-[#94A3B8]">{r.reference_no ?? '—'}</span></td>
                    <td className="px-3 py-2.5"><span className="text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">Hal. <b>{page}</b> / <b>{totalPages}</b></span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:border-[#0878C8]"><ChevronLeft className="h-3.5 w-3.5" /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p < 1 || p > totalPages) return null
            return <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold ${p === page ? 'bg-[#0878C8] text-white border border-[#0878C8]' : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]'}`}>{p}</button>
          })}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:border-[#0878C8]"><ChevronRight className="h-3.5 w-3.5" /></button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">»</button>
        </div>
      </div>
    </div>
  )
}
