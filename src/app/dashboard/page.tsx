'use client'

import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  Tag, RotateCcw, Package, Receipt, AlertTriangle,
  BarChart3, Store,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { MetricCard, MetricCardSkeleton } from '@/components/dashboard/MetricCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { StorePerformanceChart } from '@/components/dashboard/StorePerformanceChart'
import { TopProductsChart } from '@/components/dashboard/TopProductsChart'
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart'
import { LowStockTable } from '@/components/dashboard/LowStockTable'
import { RecentTransactionsTable } from '@/components/dashboard/RecentTransactionsTable'
import { useOverviewKPIs } from '@/hooks/useOverview'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { useFilterStore } from '@/store/filterStore'
import { formatDate } from '@/lib/format'

/* ─── Types ─── */
type KPIData = {
  totalRevenue: number
  netSales: number
  totalTransactions: number
  avgOrderValue: number
  totalDiscount: number
  totalTax: number
  totalRefund: number
  refundCount: number
  totalExpense: number
  totalItemsSold: number
  grossProfit: number
  grossMargin: number
  lowStockCount: number
  totalCustomers: number
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-4 w-1 rounded-full bg-gradient-to-b from-[#0878C8] to-[#37B220]" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
        {children}
      </span>
    </div>
  )
}

/* ─── Summary banner (small) ─── */
function SummaryBanner({ kpis }: { kpis: KPIData | undefined }) {
  const { from, to } = useFilterStore()
  const period =
    from && to
      ? `${formatDate(from, 'd MMM yyyy')} – ${formatDate(to, 'd MMM yyyy')}`
      : 'Semua Periode'

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 text-white"
      style={{
        background: 'linear-gradient(135deg, #0878C8 0%, #0B8BD3 40%, #1BA650 80%, #37B220 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute top-4 right-32 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: title + period */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-4 w-4 text-white/80" />
            <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">
              FamilyMart Sales Dashboard
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
            Ringkasan Penjualan
          </h1>
          <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            {period}
          </p>
        </div>

        {/* Right: 4 quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              label: 'Total Revenue',
              value: kpis ? formatCurrency(kpis.totalRevenue) : '—',
              icon: <DollarSign className="h-3.5 w-3.5" />,
            },
            {
              label: 'Gross Profit',
              value: kpis ? formatCurrency(kpis.grossProfit) : '—',
              icon: <TrendingUp className="h-3.5 w-3.5" />,
              badge: kpis ? `${formatPercent(kpis.grossMargin)}` : undefined,
            },
            {
              label: 'Total Transaksi',
              value: kpis ? formatNumber(kpis.totalTransactions) : '—',
              icon: <ShoppingCart className="h-3.5 w-3.5" />,
            },
            {
              label: 'Item Terjual',
              value: kpis ? formatNumber(kpis.totalItemsSold) : '—',
              icon: <Package className="h-3.5 w-3.5" />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 rounded-xl bg-white/15 backdrop-blur-sm px-3.5 py-3"
            >
              <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-semibold uppercase tracking-wide">
                {s.icon}
                {s.label}
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-base md:text-lg font-extrabold leading-none">
                  {s.value}
                </span>
                {s.badge && (
                  <span className="text-[10px] font-bold text-[#22C55E] bg-white/15 rounded-full px-1.5 py-0.5 mb-0.5">
                    {s.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function DashboardPage() {
  const { data: kpis, isLoading } = useOverviewKPIs()

  const metrics = [
    /* Row 1 – Revenue metrics */
    {
      title: 'Total Revenue',
      value: kpis ? formatCurrency(kpis.totalRevenue) : '—',
      subtitle: 'Grand total semua transaksi',
      icon: <DollarSign className="h-5 w-5" />,
      accentColor: '#0878C8',
    },
    {
      title: 'Net Sales',
      value: kpis ? formatCurrency(kpis.netSales) : '—',
      subtitle: 'Subtotal – diskon',
      icon: <TrendingUp className="h-5 w-5" />,
      accentColor: '#0B8BD3',
    },
    {
      title: 'Gross Profit',
      value: kpis ? formatCurrency(kpis.grossProfit) : '—',
      subtitle: kpis ? `Margin ${formatPercent(kpis.grossMargin)}` : 'Margin kotor',
      icon: <BarChart3 className="h-5 w-5" />,
      accentColor: '#37B220',
      variant: 'success' as const,
    },
    {
      title: 'Avg Order Value',
      value: kpis ? formatCurrency(kpis.avgOrderValue) : '—',
      subtitle: 'Rata-rata per transaksi',
      icon: <Receipt className="h-5 w-5" />,
      accentColor: '#8B5CF6',
    },
    /* Row 2 – Volume metrics */
    {
      title: 'Total Transaksi',
      value: kpis ? formatNumber(kpis.totalTransactions) : '—',
      subtitle: 'Jumlah sales order',
      icon: <ShoppingCart className="h-5 w-5" />,
      accentColor: '#0EA5E9',
    },
    {
      title: 'Item Terjual',
      value: kpis ? formatNumber(kpis.totalItemsSold) : '—',
      subtitle: 'Total unit produk',
      icon: <Package className="h-5 w-5" />,
      accentColor: '#6366F1',
    },
    {
      title: 'Total Pelanggan',
      value: kpis ? formatNumber(kpis.totalCustomers) : '—',
      subtitle: 'Customer terdaftar',
      icon: <Users className="h-5 w-5" />,
      accentColor: '#0878C8',
    },
    /* Row 3 – Deduction metrics */
    {
      title: 'Total Diskon',
      value: kpis ? formatCurrency(kpis.totalDiscount) : '—',
      subtitle: 'Diskon diberikan',
      icon: <Tag className="h-5 w-5" />,
      accentColor: '#F97316',
    },
    {
      title: 'Total Refund',
      value: kpis ? formatCurrency(kpis.totalRefund) : '—',
      subtitle: kpis ? `${kpis.refundCount} retur diproses` : 'Dana dikembalikan',
      icon: <RotateCcw className="h-5 w-5" />,
      accentColor: '#EF4444',
      variant: 'danger' as const,
    },
    {
      title: 'Total Pengeluaran',
      value: kpis ? formatCurrency(kpis.totalExpense) : '—',
      subtitle: 'Biaya operasional',
      icon: <DollarSign className="h-5 w-5" />,
      accentColor: '#EC4899',
    },
    {
      title: 'Stok Rendah',
      value: kpis ? formatNumber(kpis.lowStockCount) : '—',
      subtitle: 'Produk perlu restock',
      icon: <AlertTriangle className="h-5 w-5" />,
      accentColor: '#EF4444',
      variant: kpis && kpis.lowStockCount > 0 ? ('danger' as const) : ('default' as const),
    },
  ]

  return (
    <>
      <Header title="Overview" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">

        {/* ── Summary Banner ── */}
        <SummaryBanner kpis={kpis} />

        {/* ── Filters ── */}
        <FilterBar />

        {/* ── KPI Grid ── */}
        <section>
          <SectionLabel>Key Performance Indicators</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            {isLoading
              ? Array.from({ length: 11 }).map((_, i) => <MetricCardSkeleton key={i} />)
              : metrics.map((m) => (
                <MetricCard key={m.title} {...m} loading={false} />
              ))}
          </div>
        </section>

        {/* ── Revenue + Payment ── */}
        <section>
          <SectionLabel>Revenue & Pembayaran</SectionLabel>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <PaymentMethodChart />
            </div>
          </div>
        </section>

        {/* ── Store + Products ── */}
        <section>
          <SectionLabel>Performa Toko & Produk</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StorePerformanceChart />
            <TopProductsChart />
          </div>
        </section>

        {/* ── Transactions + Low Stock ── */}
        <section>
          <SectionLabel>Transaksi & Inventori</SectionLabel>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <RecentTransactionsTable />
            </div>
            <div>
              <LowStockTable />
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
