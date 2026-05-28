'use client'

import {
  Download, BarChart3, Package, Wallet, Users, Tag, RotateCcw,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { StorePerformanceChart } from '@/components/dashboard/StorePerformanceChart'
import { TopProductsChart } from '@/components/dashboard/TopProductsChart'

const REPORT_TYPES = [
  { label: 'Laporan Penjualan Harian', desc: 'Rekap penjualan per hari, cabang, dan kasir', icon: BarChart3, color: '#0878C8', bg: '#EFF6FF' },
  { label: 'Laporan Inventori',        desc: 'Status stok semua produk per cabang',          icon: Package,   color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Laporan Keuangan',         desc: 'Ringkasan revenue, pengeluaran, dan profit',   icon: Wallet,    color: '#37B220', bg: '#F0FDF4' },
  { label: 'Laporan Pelanggan',        desc: 'Analisis loyalitas dan segmentasi pelanggan',  icon: Users,     color: '#0EA5E9', bg: '#EFF6FF' },
  { label: 'Laporan Promosi',          desc: 'Efektivitas kampanye dan penggunaan kupon',    icon: Tag,       color: '#F97316', bg: '#FFF7ED' },
  { label: 'Laporan Retur',            desc: 'Analisis alasan dan tren retur produk',        icon: RotateCcw, color: '#EF4444', bg: '#FEF2F2' },
]

export default function ReportsPage() {
  return (
    <>
      <Header title="Laporan" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />

        {/* Report cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((r) => {
            const Icon = r.icon
            return (
              <Card key={r.label} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: r.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-fm-navy">{r.label}</p>
                    <p className="text-xs text-fm-muted mt-1">{r.desc}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RevenueChart />
          <StorePerformanceChart />
        </div>
        <TopProductsChart />
      </main>
    </>
  )
}
