'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePromoProductTable } from '@/hooks/usePromotions'
import { usePromotionFilterStore } from '@/store/promotionFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { PromoProductRow } from '@/types/promotion'

const STATUS_STYLE = {
  active:   { bg: '#DCFCE7', color: '#15803D', label: 'Aktif' },
  expired:  { bg: '#F1F5F9', color: '#64748B', label: 'Berakhir' },
  upcoming: { bg: '#FEF9C3', color: '#A16207', label: 'Mendatang' },
}

function RowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {[120, 180, 80, 72, 72, 72, 80, 64].map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export function PromoProductTable() {
  const { data, isLoading, isError } = usePromoProductTable()
  const { page, setPage } = usePromotionFilterStore()
  const [search, setSearch] = React.useState('')

  const rows: PromoProductRow[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = data?.totalPages ?? 1
  const pageSize: number = data?.pageSize ?? 25

  const filtered = search
    ? rows.filter((r) =>
        r.promo_name.toLowerCase().includes(search.toLowerCase()) ||
        r.product_name.toLowerCase().includes(search.toLowerCase()) ||
        r.promo_code.toLowerCase().includes(search.toLowerCase())
      )
    : rows

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Performa Produk Promosi</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {!isLoading && `${filtered.length} produk dari ${total.toLocaleString('id-ID')} total`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari promo / produk..."
            className="h-8 w-56 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {['Promosi','Produk','Kategori','Tipe Diskon','Nilai','Digunakan','Diskon Total','Revenue','Status'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? <tr><td colSpan={9} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <span className="text-2xl">🏷️</span>
                          <p className="text-sm font-medium">Tidak ada data promosi</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((r, i) => {
                    const st = STATUS_STYLE[r.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.expired
                    return (
                      <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        {/* Promosi */}
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-[#0F172A] max-w-[120px] truncate">{r.promo_name}</p>
                          <span className="font-mono text-[10px] text-[#0878C8]">{r.promo_code}</span>
                        </td>

                        {/* Produk */}
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-medium text-[#0F172A] max-w-[160px] truncate">{r.product_name}</p>
                        </td>

                        {/* Kategori */}
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-[#64748B]">{r.category_name}</span>
                        </td>

                        {/* Tipe */}
                        <td className="px-3 py-2.5">
                          <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                            r.discount_type === 'percent' ? 'bg-[#EFF6FF] text-[#0878C8]' : 'bg-[#FFF7ED] text-[#C2410C]'
                          }`}>
                            {r.discount_type === 'percent' ? '%' : 'Rp'}
                          </span>
                        </td>

                        {/* Nilai */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold text-[#F97316]">
                            {r.discount_type === 'percent' ? `${r.discount_value}%` : formatCurrency(r.discount_value)}
                          </span>
                        </td>

                        {/* Digunakan */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#0878C8]">{formatNumber(r.usage_count)}</span>
                            <span className="text-[10px] text-[#94A3B8]">×</span>
                          </div>
                        </td>

                        {/* Diskon Total */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-medium text-[#F97316]">
                            {r.total_discount > 0 ? formatCurrency(r.total_discount) : '—'}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold text-[#0F172A]">
                            {r.revenue > 0 ? formatCurrency(r.revenue) : '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">Hal. <b>{page}</b> / <b>{totalPages}</b></span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page <= 1}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p < 1 || p > totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold ${p === page ? 'bg-[#0878C8] text-white border border-[#0878C8]' : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]'}`}>
                {p}
              </button>
            )
          })}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">»</button>
        </div>
      </div>
    </div>
  )
}
