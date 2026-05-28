'use client'

import * as React from 'react'
import {
  Tag, CheckCircle, Clock, XCircle, TrendingUp,
  Ticket, DollarSign, Zap,
  CalendarDays, ChevronDown, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Header }                from '@/components/layout/Header'
import { PromotionUsageChart }   from '@/components/dashboard/promotions/PromotionUsageChart'
import { CouponUsageChart }      from '@/components/dashboard/promotions/CouponUsageChart'
import { PromoProductTable }     from '@/components/dashboard/promotions/PromoProductTable'
import { usePromotionKPIs }      from '@/hooks/usePromotions'
import { usePromotionFilterStore } from '@/store/promotionFilterStore'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { PromotionKPIs } from '@/types/promotion'

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{children}</span>
    </div>
  )
}

/* ─── Filter bar ─── */
function PromoFilterBar() {
  const { from, to, status, setDateRange, setStatus, reset } = usePromotionFilterStore()
  const [calOpen, setCalOpen] = React.useState(false)
  const calRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const dateLabel = from && to
    ? `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    : 'Pilih periode'

  const STATUS_OPTS = [
    { value: '', label: 'Semua Status' },
    { value: 'active', label: '🟢 Aktif' },
    { value: 'upcoming', label: '🟡 Mendatang' },
    { value: 'expired', label: '⚫ Berakhir' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date */}
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

      {/* Status */}
      <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
        {STATUS_OPTS.map((s) => (
          <button key={s.value} onClick={() => setStatus(s.value as typeof status)}
            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${status === s.value ? 'bg-white shadow-sm text-[#0878C8]' : 'text-[#64748B]'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {(from || to) && (
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
function PromoBanner({ kpis }: { kpis: PromotionKPIs | undefined }) {
  const { from, to } = usePromotionFilterStore((s) => ({ from: s.from, to: s.to }))
  const period = from && to ? `${format(from, 'd MMM yyyy', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}` : 'Semua Periode'
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #0878C8 50%, #37B220 100%)' }}>
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Promotion Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">Analitik Promosi</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />{period}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Promosi Aktif', value: kpis ? formatNumber(kpis.activeCount) : '—' },
            { label: 'Total Penggunaan', value: kpis ? formatNumber(kpis.totalUsage) : '—' },
            { label: 'Total Diskon', value: kpis ? formatCurrency(kpis.totalDiscountGiven) : '—' },
            { label: 'Coupon Rate', value: kpis ? formatPercent(kpis.couponUsageRate) : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-1">{s.label}</p>
              <p className="text-base font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      {kpis && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Aktif: {kpis.activeCount}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FCD34D]" /> Mendatang: {kpis.upcomingCount}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" /> Berakhir: {kpis.expiredCount}
          </span>
          {kpis.mostUsedPromo && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
              <Zap className="h-3 w-3 text-yellow-300" />
              Terpopuler: {kpis.mostUsedPromo.name}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function PromotionsPage() {
  const { data: kpis, isLoading } = usePromotionKPIs()
  const k = kpis as PromotionKPIs | undefined

  const kpiDefs: KDef[] = [
    { title: 'Promosi Aktif',     value: k ? formatNumber(k.activeCount) : '—',          sub: 'Berjalan saat ini',         icon: <CheckCircle className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Mendatang',         value: k ? formatNumber(k.upcomingCount) : '—',         sub: 'Belum dimulai',             icon: <Clock className="h-5 w-5" />,        accent: '#F97316', bg: '#FFF7ED' },
    { title: 'Berakhir',          value: k ? formatNumber(k.expiredCount) : '—',          sub: 'Sudah selesai',             icon: <XCircle className="h-5 w-5" />,       accent: '#64748B', bg: '#F8FAFC' },
    { title: 'Total Penggunaan',  value: k ? formatNumber(k.totalUsage) : '—',            sub: 'Item dengan promo',         icon: <Tag className="h-5 w-5" />,           accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Total Diskon',      value: k ? formatCurrency(k.totalDiscountGiven) : '—',  sub: 'Diberikan ke pelanggan',    icon: <DollarSign className="h-5 w-5" />,    accent: '#F97316', bg: '#FFF7ED', tcolor: '#C2410C' },
    { title: 'Revenue Promo',     value: k ? formatCurrency(k.revenueFromPromo) : '—',    sub: 'Dari transaksi berpromo',   icon: <TrendingUp className="h-5 w-5" />,    accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Total Kupon',       value: k ? formatNumber(k.totalCoupons) : '—',          sub: `${k ? k.usedCoupons : '—'} digunakan`,  icon: <Ticket className="h-5 w-5" />, accent: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Coupon Usage Rate', value: k ? formatPercent(k.couponUsageRate) : '—',       sub: 'Tingkat penggunaan kupon',  icon: <Zap className="h-5 w-5" />,          accent: '#0878C8', bg: '#EFF6FF' },
  ]

  return (
    <>
      <Header title="Promosi" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <PromoBanner kpis={k} />
        <PromoFilterBar />

        <section>
          <SL>Key Metrics</SL>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {isLoading ? Array.from({ length: 8 }).map((_, i) => <KSkel key={i} />) : kpiDefs.map((d) => <KpiCard key={d.title} {...d} />)}
          </div>
        </section>

        <section>
          <SL>Analitik Penggunaan Promosi</SL>
          <PromotionUsageChart />
        </section>

        <section>
          <SL>Analitik Kupon</SL>
          <CouponUsageChart />
        </section>

        <section>
          <SL>Performa Produk Promosi</SL>
          <PromoProductTable />
        </section>
      </main>
    </>
  )
}
