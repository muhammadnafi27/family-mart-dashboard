'use client'

import { FileBarChart, Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { StorePerformanceChart } from '@/components/dashboard/StorePerformanceChart'
import { TopProductsChart } from '@/components/dashboard/TopProductsChart'

const REPORT_TYPES = [
  { label: 'Laporan Penjualan Harian', desc: 'Rekap penjualan per hari, cabang, dan kasir', icon: '📊' },
  { label: 'Laporan Inventori', desc: 'Status stok semua produk per cabang', icon: '📦' },
  { label: 'Laporan Keuangan', desc: 'Ringkasan revenue, pengeluaran, dan profit', icon: '💰' },
  { label: 'Laporan Pelanggan', desc: 'Analisis loyalitas dan segmentasi pelanggan', icon: '👥' },
  { label: 'Laporan Promosi', desc: 'Efektivitas kampanye dan penggunaan kupon', icon: '🏷️' },
  { label: 'Laporan Retur', desc: 'Analisis alasan dan tren retur produk', icon: '↩️' },
]

export default function ReportsPage() {
  return (
    <>
      <Header title="Laporan" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <FilterBar />

        {/* Report cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((r) => (
            <Card key={r.label} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5 flex items-start gap-4">
                <span className="text-3xl">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-fm-navy">{r.label}</p>
                  <p className="text-xs text-fm-muted mt-1">{r.desc}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
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
