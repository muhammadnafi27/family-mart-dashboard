'use client'

import * as React from 'react'
import {
  CreditCard, Wallet, Banknote, Receipt, AlertCircle, TrendingUp, Award,
  CalendarDays, ChevronDown, Check, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { PaymentMethodChart } from '@/components/dashboard/payments/PaymentMethodChart'
import { PaymentTrendChart } from '@/components/dashboard/payments/PaymentTrendChart'
import { PaymentStatusChart, PaymentTransactionTable } from '@/components/dashboard/payments/PaymentStatusChart'
import { usePaymentKPIs } from '@/hooks/usePayments'
import { usePaymentFilterStore } from '@/store/paymentFilterStore'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { PaymentKPIs } from '@/types/payment'

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{children}</span>
    </div>
  )
}

/* ─── Filter chip ─── */
type Opt = { value: string; label: string }
function Chip({ value, placeholder, options, onChange }: { value: string; placeholder: string; options: Opt[]; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const sel = options.find((o) => o.value === value)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all whitespace-nowrap ${value !== 'all' ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]/50'}`}>
        <span className="truncate max-w-[120px]">{sel?.label ?? placeholder}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1">
          {[{ value: 'all', label: placeholder }, ...options].map((opt) => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[#F8FAFC] ${opt.value === value ? 'text-[#0878C8] font-semibold' : 'text-[#0F172A]'}`}>
              <Check className={`h-3.5 w-3.5 shrink-0 ${opt.value === value ? 'opacity-100 text-[#0878C8]' : 'opacity-0'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentFilterBar() {
  const { from, to, storeId, methodId, status, setDateRange, setStoreId, setMethodId, setStatus, reset } = usePaymentFilterStore()
  const [calOpen, setCalOpen] = React.useState(false)
  const calRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const { data: opts } = useQuery({
    queryKey: ['pay-filter-opts'],
    queryFn: async () => { const r = await fetch('/api/overview?type=filters'); return r.json() },
    staleTime: Infinity,
  })

  const dateLabel = from && to
    ? `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    : 'Pilih periode'

  const storeOpts: Opt[] = (opts?.stores ?? []).map((s: { store_id: number; store_name: string }) => ({ value: String(s.store_id), label: s.store_name }))
  const methodOpts: Opt[] = (opts?.paymentMethods ?? []).map((m: { method_id: number; method_name: string }) => ({ value: String(m.method_id), label: m.method_name }))
  const STATUS_OPTS: Opt[] = [
    { value: 'success', label: 'Sukses' },
    { value: 'failed', label: 'Gagal' },
    { value: 'pending', label: 'Pending' },
  ]

  const active = [storeId, methodId, status].filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={calRef} className="relative">
        <button onClick={() => setCalOpen((o) => !o)} className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${from || to ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]' : 'border-[#E2E8F0] bg-white text-[#64748B]'}`}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />{dateLabel}
          <ChevronDown className={`h-3 w-3 transition-transform ${calOpen ? 'rotate-180' : ''}`} />
        </button>
        {calOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-[#E2E8F0] bg-white shadow-lg p-3">
            <DayPicker mode="range" selected={{ from, to } as DateRange} onSelect={(r) => setDateRange(r?.from, r?.to)} locale={idLocale} numberOfMonths={2} className="text-sm" />
          </div>
        )}
      </div>
      <Chip value={storeId ? String(storeId) : 'all'} placeholder="Semua Toko" options={storeOpts} onChange={(v) => setStoreId(v === 'all' ? undefined : Number(v))} />
      <Chip value={methodId ? String(methodId) : 'all'} placeholder="Semua Metode" options={methodOpts} onChange={(v) => setMethodId(v === 'all' ? undefined : Number(v))} />
      <Chip value={status || 'all'} placeholder="Semua Status" options={STATUS_OPTS} onChange={(v) => setStatus(v === 'all' ? '' : v)} />
      {active > 0 && (
        <button onClick={reset} className="flex items-center gap-1 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-[#EF4444] hover:bg-red-100">
          <X className="h-3 w-3" /> Reset
        </button>
      )}
    </div>
  )
}

/* ─── KPI card ─── */
type KDef = { title: string; value: string; sub?: string; icon: React.ReactNode; accent: string; bg: string; tcolor?: string }
function KpiCard({ title, value, sub, icon, accent, bg, tcolor }: KDef) {
  return (
    <div className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] truncate">{title}</p>
          <p className="mt-1.5 text-xl font-extrabold truncate" style={{ color: tcolor ?? '#0F172A' }}>{value}</p>
          {sub && <p className="mt-1 text-[11px] text-[#64748B] truncate">{sub}</p>}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-transform group-hover:scale-110" style={{ background: bg }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
function KSkel() {
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse"><div className="h-4 w-20 rounded bg-slate-200 mb-2" /><div className="h-6 w-28 rounded bg-slate-200 mb-2" /><div className="h-3 w-16 rounded bg-slate-200" /></div>
}

/* ─── Banner ─── */
function PaymentBanner({ kpis }: { kpis: PaymentKPIs | undefined }) {
  const { from, to } = usePaymentFilterStore((s) => ({ from: s.from, to: s.to }))
  const period = from && to ? `${format(from, 'd MMM yyyy', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}` : 'Semua Periode'
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0878C8 50%, #37B220 100%)' }}>
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Payment Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">Analitik Pembayaran</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />{period}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Pembayaran', value: kpis ? formatCurrency(kpis.totalAmount) : '—' },
            { label: 'Tunai', value: kpis ? formatCurrency(kpis.cashAmount) : '—' },
            { label: 'Non-Tunai', value: kpis ? formatCurrency(kpis.nonCashAmount) : '—' },
            { label: 'Success Rate', value: kpis ? formatPercent(kpis.successRate) : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-1">{s.label}</p>
              <p className="text-base font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      {kpis?.mostUsedMethod && (
        <div className="relative mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <Award className="h-3 w-3 text-yellow-300" />
            Metode Terpopuler: {kpis.mostUsedMethod.name} ({formatNumber(kpis.mostUsedMethod.count)} trx)
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function PaymentsPage() {
  const { data: kpis, isLoading } = usePaymentKPIs()
  const k = kpis as PaymentKPIs | undefined

  const kpiDefs: KDef[] = [
    { title: 'Total Pembayaran', value: k ? formatCurrency(k.totalAmount) : '—', sub: `${k ? formatNumber(k.transactionCount) : '—'} transaksi`, icon: <CreditCard className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Pembayaran Tunai', value: k ? formatCurrency(k.cashAmount) : '—', sub: 'Cash payment', icon: <Banknote className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Non-Tunai', value: k ? formatCurrency(k.nonCashAmount) : '—', sub: 'Kartu, QRIS, e-wallet', icon: <Wallet className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Metode Terpopuler', value: k?.mostUsedMethod?.name ?? '—', sub: k?.mostUsedMethod ? `${formatNumber(k.mostUsedMethod.count)} transaksi` : 'Tidak ada data', icon: <Award className="h-5 w-5" />, accent: '#F59E0B', bg: '#FFFBEB' },
    { title: 'Gagal', value: k ? formatNumber(k.failedCount) : '—', sub: 'Pembayaran gagal', icon: <AlertCircle className="h-5 w-5" />, accent: '#EF4444', bg: '#FEF2F2', tcolor: '#DC2626' },
    { title: 'Avg Pembayaran', value: k ? formatCurrency(k.avgPaymentAmount) : '—', sub: 'Rata-rata per transaksi', icon: <Receipt className="h-5 w-5" />, accent: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Total Transaksi', value: k ? formatNumber(k.transactionCount) : '—', sub: 'Semua status', icon: <TrendingUp className="h-5 w-5" />, accent: '#0EA5E9', bg: '#EFF6FF' },
    { title: 'Success Rate', value: k ? formatPercent(k.successRate) : '—', sub: 'Tingkat keberhasilan', icon: <TrendingUp className="h-5 w-5" />, accent: k && k.successRate >= 95 ? '#37B220' : '#F97316', bg: k && k.successRate >= 95 ? '#F0FDF4' : '#FFF7ED', tcolor: k && k.successRate >= 95 ? '#15803D' : '#C2410C' },
  ]

  return (
    <>
      <Header title="Pembayaran" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <PaymentBanner kpis={k} />
        <PaymentFilterBar />

        <section>
          <SL>Key Metrics</SL>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {isLoading ? Array.from({ length: 8 }).map((_, i) => <KSkel key={i} />) : kpiDefs.map((d) => <KpiCard key={d.title} {...d} />)}
          </div>
        </section>

        <section>
          <SL>Tren & Distribusi</SL>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <PaymentTrendChart />
            </div>
            <div>
              <PaymentStatusChart />
            </div>
          </div>
        </section>

        <section>
          <SL>Metode Pembayaran</SL>
          <PaymentMethodChart />
        </section>

        <section>
          <SL>Riwayat Transaksi</SL>
          <PaymentTransactionTable />
        </section>
      </main>
    </>
  )
}
