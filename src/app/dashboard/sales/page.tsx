'use client'

import * as React from 'react'
import {
  ShoppingCart, DollarSign, Receipt, Package, Tag,
  Store, UserCheck, TrendingUp,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { SalesFilterBar } from '@/components/dashboard/sales/SalesFilterBar'
import { SalesTrendChart } from '@/components/dashboard/sales/SalesTrendChart'
import { HourlyHeatmapChart } from '@/components/dashboard/sales/HourlyHeatmapChart'
import { StoreSalesChart } from '@/components/dashboard/sales/StoreSalesChart'
import { CashierLeaderboard } from '@/components/dashboard/sales/CashierLeaderboard'
import { SalesOrderTable } from '@/components/dashboard/sales/SalesOrderTable'
import { useSalesKPIs } from '@/hooks/useSales'
import { useSalesFilterStore } from '@/store/salesFilterStore'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { SalesKPIs } from '@/types/sales'
import ReactECharts from 'echarts-for-react'

/* ─────────────── helpers ─────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{children}</span>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 rounded-full bg-slate-200" />
          <div className="h-7 w-28 rounded-md bg-slate-200" />
          <div className="h-3 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-slate-200 shrink-0" />
      </div>
    </div>
  )
}

type KpiDef = {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  accent: string
  bg: string
  variant?: 'default' | 'success' | 'danger' | 'warn'
}

function KpiCard({ title, value, subtitle, icon, accent, bg, variant = 'default' }: KpiDef) {
  const textColor =
    variant === 'success' ? '#15803D' :
    variant === 'danger'  ? '#DC2626' :
    variant === 'warn'    ? '#A16207' :
    '#0F172A'

  return (
    <div className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5">
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] truncate">{title}</p>
          <p className="mt-2 text-xl font-extrabold leading-tight truncate" style={{ color: textColor }}>{value}</p>
          {subtitle && <p className="mt-1 text-[11px] text-[#64748B] truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform group-hover:scale-110" style={{ background: bg }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Banner ─────────────── */
function SalesBanner({ kpis }: { kpis: SalesKPIs | undefined }) {
  const { from, to } = useSalesFilterStore((s) => ({ from: s.from, to: s.to }))
  const completionRate = kpis
    ? kpis.totalTransactions > 0 ? (kpis.completedCount / kpis.totalTransactions) * 100 : 0
    : 0

  const period = from && to
    ? `${formatDate(from, 'd MMM yyyy')} – ${formatDate(to, 'd MMM yyyy')}`
    : 'Semua Periode'

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white"
      style={{ background: 'linear-gradient(135deg, #0878C8 0%, #0B8BD3 45%, #1DAA55 80%, #37B220 100%)' }}
    >
      {/* Decorative */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute bottom-0 left-24 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Sales Analytics</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold leading-tight">Analitik Penjualan</h1>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {period}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Revenue', value: kpis ? formatCurrency(kpis.totalRevenue) : '—', icon: <DollarSign className="h-3.5 w-3.5" /> },
            { label: 'Transaksi', value: kpis ? formatNumber(kpis.totalTransactions) : '—', icon: <ShoppingCart className="h-3.5 w-3.5" /> },
            { label: 'Avg. Order', value: kpis ? formatCurrency(kpis.avgOrderValue) : '—', icon: <Receipt className="h-3.5 w-3.5" /> },
            {
              label: 'Completion Rate',
              value: kpis ? `${completionRate.toFixed(1)}%` : '—',
              icon: <TrendingUp className="h-3.5 w-3.5" />,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-semibold uppercase tracking-wide mb-1">
                {s.icon} {s.label}
              </div>
              <p className="text-base font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status mini-pills */}
      {kpis && (
        <div className="relative flex gap-2 mt-4 flex-wrap">
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            Selesai: {formatNumber(kpis.completedCount)}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FCD34D]" />
            Pending: {formatNumber(kpis.pendingCount)}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FCA5A5]" />
            Batal: {formatNumber(kpis.cancelledCount)}
          </span>
          {kpis.bestStore && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
              <Store className="h-3 w-3" />
              Terbaik: {kpis.bestStore.name}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────── Order status donut ─────────────── */
function OrderStatusChart({ kpis }: { kpis: SalesKPIs | undefined; isLoading: boolean }) {
  if (!kpis) return null

  const statusData = [
    { name: 'Selesai',    value: kpis.completedCount, color: '#22C55E' },
    { name: 'Pending',    value: kpis.pendingCount,   color: '#F59E0B' },
    { name: 'Dibatalkan', value: kpis.cancelledCount, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  const total = statusData.reduce((s, d) => s + d.value, 0)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: [10, 14],
      formatter: (p: { name: string; value: number; percent: number }) =>
        `<p style="font-weight:700;font-size:12px;color:#0F172A">${p.name}</p>
         <p style="font-size:11px;color:#64748B">${formatNumber(p.value)} trx (${p.percent.toFixed(1)}%)</p>`,
    },
    series: [{
      type: 'pie',
      radius: ['50%', '72%'],
      center: ['50%', '50%'],
      padAngle: 3,
      data: statusData.map((d) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.color, borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 700, formatter: '{d}%', color: '#0F172A' } },
    }],
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <h3 className="text-sm font-bold text-[#0F172A]">Status Order</h3>
        <p className="text-xs text-[#64748B] mt-0.5">Distribusi status transaksi</p>
      </div>
      <div className="p-5">
        <ReactECharts option={option} style={{ height: 180 }} notMerge />
        <div className="mt-3 space-y-2">
          {statusData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-[#64748B] flex-1">{d.name}</span>
              <span className="text-xs font-semibold text-[#0F172A]">{formatNumber(d.value)}</span>
              <span className="text-[10px] text-[#94A3B8] w-10 text-right">
                {total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Page ─────────────── */
export default function SalesPage() {
  const { data: kpis, isLoading: kpisLoading } = useSalesKPIs()

  const kpiDefs: KpiDef[] = [
    {
      title: 'Total Revenue',
      value: kpis ? formatCurrency(kpis.totalRevenue) : '—',
      subtitle: 'Grand total transaksi',
      icon: <DollarSign className="h-5 w-5" />,
      accent: '#0878C8', bg: '#EFF6FF',
    },
    {
      title: 'Total Transaksi',
      value: kpis ? formatNumber(kpis.totalTransactions) : '—',
      subtitle: `${kpis ? formatNumber(kpis.completedCount) : '—'} selesai`,
      icon: <ShoppingCart className="h-5 w-5" />,
      accent: '#0B8BD3', bg: '#EFF6FF',
    },
    {
      title: 'Avg. Order Value',
      value: kpis ? formatCurrency(kpis.avgOrderValue) : '—',
      subtitle: 'Rata-rata per transaksi',
      icon: <Receipt className="h-5 w-5" />,
      accent: '#8B5CF6', bg: '#F5F3FF',
    },
    {
      title: 'Item Terjual',
      value: kpis ? formatNumber(kpis.totalItemsSold) : '—',
      subtitle: 'Total unit produk',
      icon: <Package className="h-5 w-5" />,
      accent: '#37B220', bg: '#F0FDF4',
      variant: 'success',
    },
    {
      title: 'Total Diskon',
      value: kpis ? formatCurrency(kpis.totalDiscount) : '—',
      subtitle: 'Diskon diberikan',
      icon: <Tag className="h-5 w-5" />,
      accent: '#F97316', bg: '#FFF7ED',
      variant: 'warn',
    },
    {
      title: 'Best Store',
      value: kpis?.bestStore?.name ?? '—',
      subtitle: kpis?.bestStore ? formatCurrency(kpis.bestStore.revenue) : 'Tidak ada data',
      icon: <Store className="h-5 w-5" />,
      accent: '#0878C8', bg: '#EFF6FF',
    },
    {
      title: 'Best Cashier',
      value: kpis?.bestCashier?.name ?? '—',
      subtitle: kpis?.bestCashier ? `${formatNumber(kpis.bestCashier.transactions)} transaksi` : 'Tidak ada data',
      icon: <UserCheck className="h-5 w-5" />,
      accent: '#37B220', bg: '#F0FDF4',
      variant: 'success',
    },
  ]

  return (
    <>
      <Header title="Penjualan" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">

        {/* ── Banner ── */}
        <SalesBanner kpis={kpis} />

        {/* ── Filter ── */}
        <SalesFilterBar />

        {/* ── KPI Cards ── */}
        <section>
          <SectionLabel>Key Metrics</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
            {kpisLoading
              ? Array.from({ length: 7 }).map((_, i) => <KpiSkeleton key={i} />)
              : kpiDefs.map((k) => <KpiCard key={k.title} {...k} />)}
          </div>
        </section>

        {/* ── Trend + Status ── */}
        <section>
          <SectionLabel>Tren & Status</SectionLabel>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3">
              <SalesTrendChart />
            </div>
            <div>
              <OrderStatusChart kpis={kpis} isLoading={kpisLoading} />
            </div>
          </div>
        </section>

        {/* ── Store + Heatmap ── */}
        <section>
          <SectionLabel>Performa Toko & Pola Waktu</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StoreSalesChart />
            <HourlyHeatmapChart />
          </div>
        </section>

        {/* ── Cashier leaderboard ── */}
        <section>
          <SectionLabel>Leaderboard Kasir</SectionLabel>
          <CashierLeaderboard />
        </section>

        {/* ── Orders table ── */}
        <section>
          <SectionLabel>Daftar Transaksi</SectionLabel>
          <SalesOrderTable />
        </section>

      </main>
    </>
  )
}
