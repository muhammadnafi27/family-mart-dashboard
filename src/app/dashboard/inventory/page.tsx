'use client'

import * as React from 'react'
import {
  Warehouse, AlertTriangle, PackageX, TrendingDown,
  RefreshCw, BarChart3, DollarSign, ChevronDown, Check, X, CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Header } from '@/components/layout/Header'
import { StockByStoreChart } from '@/components/dashboard/inventory/StockByStoreChart'
import { LowStockTable } from '@/components/dashboard/inventory/LowStockTable'
import { ReorderAlertTable } from '@/components/dashboard/inventory/ReorderAlertTable'
import { InventoryAdjustmentChart } from '@/components/dashboard/inventory/InventoryAdjustmentChart'
import { StockMovementTable } from '@/components/dashboard/inventory/StockMovementTable'
import { useInventoryKPIs } from '@/hooks/useInventory'
import { useInventoryFilterStore } from '@/store/inventoryFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import type { InventoryKPIs, StockByCategoryPoint } from '@/types/inventory'
import ReactECharts from 'echarts-for-react'

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

function InventoryFilterBar() {
  const { storeId, categoryId, from, to, setStoreId, setCategoryId, setDateRange, reset } = useInventoryFilterStore()
  const [calOpen, setCalOpen] = React.useState(false)
  const calRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const { data: storeOpts } = useQuery({
    queryKey: ['inv-store-opts'],
    queryFn: async () => {
      const res = await fetch('/api/overview?type=filters')
      if (!res.ok) throw new Error()
      return res.json()
    },
    staleTime: Infinity,
  })

  const dateLabel = from && to
    ? `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    : 'Pilih periode'

  const storeOptions: SelectOpt[] = (storeOpts?.stores ?? []).map((s: { store_id: number; store_name: string }) => ({ value: String(s.store_id), label: s.store_name }))
  const catOptions: SelectOpt[] = (storeOpts?.categories ?? []).map((c: { category_id: number; category_name: string }) => ({ value: String(c.category_id), label: c.category_name }))
  const active = [storeId, categoryId].filter(Boolean).length

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
          <ChevronDown className={`h-3 w-3 transition-transform ${calOpen ? 'rotate-180' : ''}`} />
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
      <FilterChip value={storeId ? String(storeId) : 'all'} placeholder="Semua Toko" options={storeOptions} onChange={(v) => setStoreId(v === 'all' ? undefined : Number(v))} />
      <FilterChip value={categoryId ? String(categoryId) : 'all'} placeholder="Semua Kategori" options={catOptions} onChange={(v) => setCategoryId(v === 'all' ? undefined : Number(v))} />
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
function KpiSkeleton() {
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse"><div className="h-4 w-20 rounded bg-slate-200 mb-2" /><div className="h-6 w-28 rounded bg-slate-200 mb-2" /><div className="h-3 w-16 rounded bg-slate-200" /></div>
}

/* ─── Stock by Category chart (inline) ─── */
function StockByCategoryChart() {
  const { getFilters } = useInventoryFilterStore()
  const f = getFilters()
  const { data, isLoading } = useQuery({
    queryKey: ['inv-by-cat', f],
    queryFn: async () => {
      const sp = new URLSearchParams({ type: 'by-cat' })
      if (f.storeId) sp.set('storeId', String(f.storeId))
      const res = await fetch(`/api/inventory?${sp.toString()}`)
      if (!res.ok) throw new Error()
      return res.json()
    },
  })
  const cats: StockByCategoryPoint[] = Array.isArray(data) ? data : []

  const COLORS = ['#0878C8','#37B220','#F97316','#8B5CF6','#EC4899','#0EA5E9','#22C55E','#F59E0B','#6366F1','#EF4444']
  const totalVal = cats.reduce((s, c) => s + c.total_value, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number; dataIndex: number }) => {
        const c = cats[p.dataIndex]
        return `<p style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:6px">${p.name}</p>
          <p style="font-size:11px;color:#64748B">Nilai Stok: <b>${formatCurrency(p.value)}</b> (${p.percent.toFixed(1)}%)</p>
          <p style="font-size:11px;color:#64748B;margin-top:2px">Qty: <b>${formatNumber(c?.total_qty ?? 0)}</b></p>
          <p style="font-size:11px;color:#EF4444;margin-top:2px">Stok Rendah: <b>${c?.low_stock_count ?? 0}</b></p>`
      },
    },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['40%', '50%'],
      padAngle: 2,
      data: cats.map((c, i) => ({
        name: c.category_name,
        value: c.total_value,
        itemStyle: { color: COLORS[i % COLORS.length], borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
    legend: { orient: 'vertical', right: '2%', top: 'middle', textStyle: { color: '#64748B', fontSize: 11 }, icon: 'circle', itemWidth: 8, itemHeight: 8 },
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Stok per Kategori</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Total nilai: {formatCurrency(totalVal)}</p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="h-52 w-full rounded-xl bg-slate-100 animate-pulse" />
        ) : (
          <ReactECharts option={option} style={{ height: 220 }} notMerge />
        )}
      </div>
    </div>
  )
}

/* ─── Banner ─── */
function InventoryBanner({ kpis }: { kpis: InventoryKPIs | undefined }) {
  const { from, to } = useInventoryFilterStore((s) => ({ from: s.from, to: s.to }))
  const period = from && to ? `${format(from, 'd MMM yyyy', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}` : 'Semua Periode'
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 45%, #0B6B3A 80%, #166534 100%)' }}>
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/5" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Warehouse className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Inventory Dashboard</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold">Manajemen Inventori</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {period}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nilai Stok', value: kpis ? formatCurrency(kpis.totalStockValue) : '—' },
            { label: 'Total Qty', value: kpis ? formatNumber(kpis.totalStockQty) : '—' },
            { label: 'Stok Rendah', value: kpis ? String(kpis.lowStockCount) : '—' },
            { label: 'Habis Stok', value: kpis ? String(kpis.outOfStockCount) : '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur-sm px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-1">{s.label}</p>
              <span className="text-base font-extrabold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      {kpis && (
        <div className="relative flex flex-wrap gap-2 mt-4">
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Aman: {formatNumber(kpis.totalProductsTracked - kpis.belowReorderCount)} produk
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" /> Di bawah reorder: {kpis.belowReorderCount}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" /> Habis: {kpis.outOfStockCount}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function InventoryPage() {
  const { data: kpis, isLoading } = useInventoryKPIs()
  const k = kpis as InventoryKPIs | undefined

  const kpiDefs: KDef[] = [
    { title: 'Total Qty Stok', value: k ? formatNumber(k.totalStockQty) : '—', sub: `${k ? formatNumber(k.totalProductsTracked) : '—'} SKU tercatat`, icon: <Warehouse className="h-5 w-5" />, accent: '#0878C8', bg: '#EFF6FF' },
    { title: 'Nilai Stok', value: k ? formatCurrency(k.totalStockValue) : '—', sub: 'Total nilai inventori', icon: <DollarSign className="h-5 w-5" />, accent: '#37B220', bg: '#F0FDF4', tcolor: '#15803D' },
    { title: 'Stok Rendah', value: k ? formatNumber(k.lowStockCount) : '—', sub: 'qty_on_hand ≤ reorder_level', icon: <AlertTriangle className="h-5 w-5" />, accent: '#F97316', bg: '#FFF7ED', tcolor: '#C2410C' },
    { title: 'Habis Stok', value: k ? formatNumber(k.outOfStockCount) : '—', sub: 'qty_on_hand = 0', icon: <PackageX className="h-5 w-5" />, accent: '#EF4444', bg: '#FEF2F2', tcolor: '#DC2626' },
    { title: 'Di Bawah Reorder', value: k ? formatNumber(k.belowReorderCount) : '—', sub: 'Perlu tindakan', icon: <TrendingDown className="h-5 w-5" />, accent: '#F97316', bg: '#FFF7ED' },
    { title: 'Total Adjustment', value: k ? formatNumber(k.totalAdjustments) : '—', sub: `+${k ? k.positiveAdjustments : '—'} / -${k ? k.negativeAdjustments : '—'}`, icon: <RefreshCw className="h-5 w-5" />, accent: '#8B5CF6', bg: '#F5F3FF' },
  ]

  return (
    <>
      <Header title="Inventori" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <InventoryBanner kpis={k} />
        <InventoryFilterBar />

        <section>
          <SectionLabel>Key Metrics</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />) : kpiDefs.map((k) => <KpiCard key={k.title} {...k} />)}
          </div>
        </section>

        <section>
          <SectionLabel>Distribusi Stok</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StockByStoreChart />
            <StockByCategoryChart />
          </div>
        </section>

        <section>
          <SectionLabel>Tren Penyesuaian</SectionLabel>
          <InventoryAdjustmentChart />
        </section>

        <section>
          <SectionLabel>Stok Rendah & Habis</SectionLabel>
          <LowStockTable />
        </section>

        <section>
          <SectionLabel>Reorder Alert</SectionLabel>
          <ReorderAlertTable />
        </section>

        <section>
          <SectionLabel>Riwayat Pergerakan Stok</SectionLabel>
          <StockMovementTable />
        </section>
      </main>
    </>
  )
}
