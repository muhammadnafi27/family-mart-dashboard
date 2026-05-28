'use client'

import * as React from 'react'
import {
  Package, BarChart3, Tag, Award, ShoppingCart,
  DollarSign, TrendingUp, Star, ChevronDown, Check, X, CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Header } from '@/components/layout/Header'
import { TopProductChart } from '@/components/dashboard/products/TopProductChart'
import { CategorySalesChart } from '@/components/dashboard/products/CategorySalesChart'
import { BrandPerformanceChart } from '@/components/dashboard/products/BrandPerformanceChart'
import { ProductMarginTable } from '@/components/dashboard/products/ProductMarginTable'
import { useProductKPIs, useProductFilterOptions } from '@/hooks/useProducts'
import { useProductFilterStore } from '@/store/productFilterStore'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { ProductKPIs } from '@/types/product'

/* ─── helpers ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{children}</span>
    </div>
  )
}

/* ─── Filter bar ─── */
type SelectOpt = { value: string; label: string }
function FilterChip({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: SelectOpt[]; onChange: (v: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all whitespace-nowrap ${
          value !== 'all' ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]/50'
        }`}
      >
        <span className="truncate max-w-[120px]">{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1">
          {[{ value: 'all', label: placeholder }, ...options].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[#F8FAFC] ${opt.value === value ? 'text-[#0878C8] font-semibold' : 'text-[#0F172A]'}`}
            >
              <Check className={`h-3.5 w-3.5 shrink-0 ${opt.value === value ? 'opacity-100 text-[#0878C8]' : 'opacity-0'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductFilterBar() {
  const { from, to, categoryId, brandId, status, setDateRange, setCategoryId, setBrandId, setStatus, reset } = useProductFilterStore()
  const { data: opts } = useProductFilterOptions()
  const [calOpen, setCalOpen] = React.useState(false)
  const calRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const dateLabel = from && to
    ? `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    : 'Pilih periode'

  const active = [categoryId, brandId, status].filter(Boolean).length
  const catOpts: SelectOpt[] = (opts?.categories ?? []).map((c: { category_id: number; category_name: string }) => ({ value: String(c.category_id), label: c.category_name }))
  const brandOpts: SelectOpt[] = (opts?.brands ?? []).map((b: { brand_id: number; brand_name: string }) => ({ value: String(b.brand_id), label: b.brand_name }))
  const statusOpts: SelectOpt[] = [{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={calRef} className="relative">
        <button
          onClick={() => setCalOpen((o) => !o)}
          className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${
            from || to ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]' : 'border-[#E2E8F0] bg-white text-[#64748B]'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {dateLabel}
          <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${calOpen ? 'rotate-180' : ''}`} />
        </button>
        {calOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-[#E2E8F0] bg-white shadow-lg p-3">
            <DayPicker
              mode="range"
              selected={{ from, to } as DateRange}
              onSelect={(r) => setDateRange(r?.from, r?.to)}
              locale={idLocale}
              numberOfMonths={2}
              className="text-sm"
            />
          </div>
        )}
      </div>
      <FilterChip value={categoryId ? String(categoryId) : 'all'} placeholder="Semua Kategori" options={catOpts} onChange={(v) => setCategoryId(v === 'all' ? undefined : Number(v))} />
      <FilterChip value={brandId ? String(brandId) : 'all'} placeholder="Semua Brand" options={brandOpts} onChange={(v) => setBrandId(v === 'all' ? undefined : Number(v))} />
      <FilterChip value={status || 'all'} placeholder="Semua Status" options={statusOpts} onChange={(v) => setStatus(v === 'all' ? '' : v as 'active' | 'inactive')} />
      {active > 0 && (
        <button onClick={reset} className="flex items-center gap-1 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-[#EF4444] hover:bg-red-100 transition-colors">
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
function KpiSkeleton() {
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse"><div className="h-4 w-20 rounded bg-slate-200 mb-2" /><div className="h-6 w-28 rounded bg-slate-200 mb-2" /><div className="h-3 w-16 rounded bg-slate-200" /></div>
}

/* ─── Banner ─── */
function ProductBanner({ kpis }: { kpis: ProductKPIs | undefined }) {
  const { from, to } = useProductFilterStore((s) => ({ from: s.from, to: s.to }))
  const period = from && to ? `${format(from, 'd MMM yyyy', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}` : 'Semua Periode'
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: 'linear-gradient(135deg, #0878C8 0%, #0B8BD3 45%, #059669 80%, #37B220 100%)' }}>
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Product Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">Analitik Produk</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {period}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Revenue Produk', value: kpis ? formatCurrency(kpis.productRevenue) : '—' },
            { label: 'Gross Profit', value: kpis ? formatCurrency(kpis.grossProfit) : '—', badge: kpis ? `${formatPercent(kpis.grossMargin)}` : undefined },
            { label: 'Unit Terjual', value: kpis ? formatNumber(kpis.totalUnitsSold) : '—' },
            { label: 'Total Produk', value: kpis ? `${formatNumber(kpis.activeProducts)} aktif` : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-1">{s.label}</p>
              <div className="flex items-end gap-1.5">
                <span className="text-base font-extrabold">{s.value}</span>
                {s.badge && <span className="text-[10px] font-bold text-[#22C55E] bg-white/15 rounded-full px-1.5 py-0.5 mb-0.5">{s.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {kpis?.bestSellingProduct && (
        <div className="relative mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <Star className="h-3 w-3 text-yellow-300" />
            Best Seller: {kpis.bestSellingProduct.name} ({formatNumber(kpis.bestSellingProduct.qty_sold)} pcs)
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function ProductsPage() {
  const { data: kpis, isLoading } = useProductKPIs()
  const k = kpis as ProductKPIs | undefined

  const kpiDefs: KDef[] = [
    { title: 'Total Produk', value: k ? formatNumber(k.totalProducts) : '—', sub: `${k ? formatNumber(k.activeProducts) : '—'} aktif`, icon: <Package className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Total Kategori', value: k ? formatNumber(k.totalCategories) : '—', icon: <Tag className="h-5 w-5" />, accent: '#0B8BD3', bg: '#EFF6FF' },
    { title: 'Total Brand', value: k ? formatNumber(k.totalBrands) : '—', icon: <Award className="h-5 w-5" />, accent: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Unit Terjual', value: k ? formatNumber(k.totalUnitsSold) : '—', sub: 'Total pcs terjual', icon: <ShoppingCart className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Revenue Produk', value: k ? formatCurrency(k.productRevenue) : '—', icon: <DollarSign className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Gross Profit', value: k ? formatCurrency(k.grossProfit) : '—', sub: k ? `Margin ${formatPercent(k.grossMargin)}` : 'Margin kotor', icon: <TrendingUp className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Best Seller', value: k?.bestSellingProduct?.name ?? '—', sub: k?.bestSellingProduct ? `${formatNumber(k.bestSellingProduct.qty_sold)} pcs` : 'Tidak ada data', icon: <Star className="h-5 w-5" />, accent: '#F59E0B', bg: '#FFFBEB' },
    { title: 'Gross Margin', value: k ? formatPercent(k.grossMargin) : '—', sub: 'Rata-rata semua produk', icon: <BarChart3 className="h-5 w-5" />, accent: k && k.grossMargin >= 20 ? '#37B220' : '#F97316', bg: k && k.grossMargin >= 20 ? '#F0FDF4' : '#FFF7ED' },
  ]

  return (
    <>
      <Header title="Produk" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <ProductBanner kpis={k} />
        <ProductFilterBar />

        <section>
          <SectionLabel>Key Metrics</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            {isLoading ? Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />) : kpiDefs.map((k) => <KpiCard key={k.title} {...k} />)}
          </div>
        </section>

        <section>
          <SectionLabel>Analitik Penjualan</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopProductChart />
            <CategorySalesChart />
          </div>
        </section>

        <section>
          <SectionLabel>Performa Brand</SectionLabel>
          <BrandPerformanceChart />
        </section>

        <section>
          <SectionLabel>Daftar Produk & Margin</SectionLabel>
          <ProductMarginTable />
        </section>
      </main>
    </>
  )
}
