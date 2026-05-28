'use client'

import * as React from 'react'
import {
  Users, UserCheck, UserX, UserPlus, DollarSign, Crown,
  CalendarDays, ChevronDown, Check, X,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Header } from '@/components/layout/Header'
import { CustomerGrowthChart }  from '@/components/dashboard/customers/CustomerGrowthChart'
import { MembershipTierChart }  from '@/components/dashboard/customers/MembershipTierChart'
import { TopCustomerTable }     from '@/components/dashboard/customers/TopCustomerTable'
import { CustomerSegmentChart } from '@/components/dashboard/customers/CustomerSegmentChart'
import { useCustomerKPIs }      from '@/hooks/useCustomers'
import { useCustomerFilterStore } from '@/store/customerFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { CustomerKPIs } from '@/types/customer'
import { useQuery } from '@tanstack/react-query'

/* ─── Section label ─── */
function SL({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{children}</span>
    </div>
  )
}

/* ─── Filter bar ─── */
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

function CustomerFilterBar() {
  const { from, to, cityId, tierId, setDateRange, setCityId, setTierId, reset } = useCustomerFilterStore()
  const [calOpen, setCalOpen] = React.useState(false)
  const calRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const { data: opts } = useQuery({
    queryKey: ['cust-filter-opts'],
    queryFn: async () => { const r = await fetch('/api/overview?type=filters'); return r.json() },
    staleTime: Infinity,
  })

  const dateLabel = from && to
    ? `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    : 'Pilih periode'

  const cityOpts: Opt[] = (opts?.cities ?? []).map((c: { city_id: number; city_name: string }) => ({ value: String(c.city_id), label: c.city_name }))
  const tierOpts: Opt[] = [
    { value: '1', label: 'Platinum' }, { value: '2', label: 'Gold' },
    { value: '3', label: 'Silver' }, { value: '4', label: 'Bronze' },
  ]
  const active = [cityId, tierId].filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={calRef} className="relative">
        <button onClick={() => setCalOpen((o) => !o)} className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${from || to ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]' : 'border-[#E2E8F0] bg-white text-[#64748B]'}`}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {dateLabel}
          <ChevronDown className={`h-3 w-3 transition-transform ${calOpen ? 'rotate-180' : ''}`} />
        </button>
        {calOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-[#E2E8F0] bg-white shadow-lg p-3">
            <DayPicker mode="range" selected={{ from, to } as DateRange} onSelect={(r) => setDateRange(r?.from, r?.to)} locale={idLocale} numberOfMonths={2} className="text-sm" />
          </div>
        )}
      </div>
      <Chip value={cityId ? String(cityId) : 'all'} placeholder="Semua Kota" options={cityOpts} onChange={(v) => setCityId(v === 'all' ? undefined : Number(v))} />
      <Chip value={tierId ? String(tierId) : 'all'} placeholder="Semua Tier" options={tierOpts} onChange={(v) => setTierId(v === 'all' ? undefined : Number(v))} />
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
function CustomerBanner({ kpis }: { kpis: CustomerKPIs | undefined }) {
  const { from, to } = useCustomerFilterStore((s) => ({ from: s.from, to: s.to }))
  const period = from && to ? `${format(from, 'd MMM yyyy', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}` : 'Semua Periode'
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: 'linear-gradient(135deg, #0878C8 0%, #0B8BD3 40%, #059669 80%, #37B220 100%)' }}>
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Customer & Membership</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">Analitik Pelanggan</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {period}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Pelanggan', value: kpis ? formatNumber(kpis.totalCustomers) : '—' },
            { label: 'Total Member', value: kpis ? formatNumber(kpis.totalMembers) : '—' },
            { label: 'Baru Bulan Ini', value: kpis ? formatNumber(kpis.newThisMonth) : '—' },
            { label: 'Avg Belanja', value: kpis ? formatCurrency(kpis.avgPurchasePerCustomer) : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-1">{s.label}</p>
              <p className="text-base font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      {kpis?.topCustomer && (
        <div className="relative mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <Crown className="h-3 w-3 text-yellow-300" />
            Top Customer: {kpis.topCustomer.name} ({formatCurrency(kpis.topCustomer.total_spent)})
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function CustomersPage() {
  const { data: kpis, isLoading } = useCustomerKPIs()
  const k = kpis as CustomerKPIs | undefined

  const kpiDefs: KDef[] = [
    { title: 'Total Pelanggan', value: k ? formatNumber(k.totalCustomers) : '—', sub: 'Customer terdaftar', icon: <Users className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Total Member', value: k ? formatNumber(k.totalMembers) : '—', sub: `${k ? formatNumber(k.totalNonMembers) : '—'} non-member`, icon: <UserCheck className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Non-Member', value: k ? formatNumber(k.totalNonMembers) : '—', sub: 'Tanpa kartu member', icon: <UserX className="h-5 w-5" />, accent: '#64748B', bg: '#F8FAFC' },
    { title: 'Baru Bulan Ini', value: k ? formatNumber(k.newThisMonth) : '—', sub: 'Pelanggan baru', icon: <UserPlus className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF', tcolor: '#0878C8' },
    { title: 'Avg Belanja', value: k ? formatCurrency(k.avgPurchasePerCustomer) : '—', sub: 'Per pelanggan', icon: <DollarSign className="h-5 w-5" />, accent: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Top Customer', value: k?.topCustomer?.name ?? '—', sub: k?.topCustomer ? formatCurrency(k.topCustomer.total_spent) : '—', icon: <Crown className="h-5 w-5" />, accent: '#D97706', bg: '#FEF9C3' },
  ]

  return (
    <>
      <Header title="Pelanggan" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <CustomerBanner kpis={k} />
        <CustomerFilterBar />

        <section>
          <SL>Key Metrics</SL>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <KSkel key={i} />) : kpiDefs.map((d) => <KpiCard key={d.title} {...d} />)}
          </div>
        </section>

        <section>
          <SL>Pertumbuhan & Membership</SL>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CustomerGrowthChart />
            <MembershipTierChart />
          </div>
        </section>

        <section>
          <SL>Distribusi Geografis</SL>
          <CustomerSegmentChart />
        </section>

        <section>
          <SL>Top Pelanggan</SL>
          <TopCustomerTable />
        </section>
      </main>
    </>
  )
}
