'use client'

import * as React from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { useLowStockTable } from '@/hooks/useInventory'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { LowStockRow } from '@/types/inventory'

const URGENCY = {
  out:      { label: 'Habis',    bg: '#FEE2E2', color: '#DC2626' },
  critical: { label: 'Kritis',   bg: '#FEF3C7', color: '#B45309' },
  low:      { label: 'Rendah',   bg: '#FFF7ED', color: '#C2410C' },
}

function StockBar({ pct, urgency }: { pct: number; urgency: string }) {
  const color = urgency === 'out' ? '#EF4444' : urgency === 'critical' ? '#F97316' : '#F59E0B'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums min-w-[32px]" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

function RowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {[180, 64, 80, 80, 64, 64, 64, 64, 64].map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export function LowStockTable() {
  const { data, isLoading, isError } = useLowStockTable()
  const all: LowStockRow[] = Array.isArray(data) ? data : []
  const [search, setSearch] = React.useState('')
  const [urgencyFilter, setUrgencyFilter] = React.useState<string>('all')

  const filtered = all.filter((r) => {
    const matchSearch = search === '' || r.product_name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase())
    const matchUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter
    return matchSearch && matchUrgency
  })

  const outCount = all.filter((r) => r.urgency === 'out').length
  const critCount = all.filter((r) => r.urgency === 'critical').length

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-[#F97316]" />
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Stok Rendah & Habis</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{all.length} item perlu perhatian</p>
          </div>
          <div className="flex gap-2 ml-2">
            {outCount > 0 && <span className="rounded-full bg-[#FEE2E2] text-[#DC2626] text-[11px] font-bold px-2.5 py-0.5">{outCount} habis</span>}
            {critCount > 0 && <span className="rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-bold px-2.5 py-0.5">{critCount} kritis</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Urgency filter */}
          <div className="flex items-center gap-0.5 bg-[#F8FAFC] rounded-lg p-0.5">
            {[['all','Semua'],['out','Habis'],['critical','Kritis'],['low','Rendah']].map(([k,l]) => (
              <button
                key={k}
                onClick={() => setUrgencyFilter(k)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${urgencyFilter === k ? 'bg-white shadow-sm text-[#0878C8]' : 'text-[#64748B]'}`}
              >{l}</button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="h-8 w-48 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs outline-none focus:border-[#EF4444]/50 focus:ring-2 focus:ring-[#EF4444]/10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="sticky top-0">
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {['Produk','SKU','Kategori','Toko','Supplier','Qty','Reorder','Stok %','Nilai Stok','Status'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? <tr><td colSpan={10} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <span className="text-2xl">✓</span>
                          <p className="text-sm font-medium text-[#22C55E]">Semua stok dalam kondisi baik!</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((r, i) => {
                    const cfg = URGENCY[r.urgency]
                    return (
                      <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-3 py-2.5">
                          <p className="text-xs font-semibold text-[#0F172A] max-w-[160px] truncate">{r.product_name}</p>
                        </td>
                        <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-[#64748B]">{r.sku}</span></td>
                        <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B]">{r.category_name}</span></td>
                        <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] max-w-[100px] truncate block">{r.store_name}</span></td>
                        <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] max-w-[100px] truncate block">{r.supplier_name}</span></td>
                        <td className="px-3 py-2.5"><span className={`text-sm font-bold ${r.qty_on_hand === 0 ? 'text-[#DC2626]' : 'text-[#F97316]'}`}>{r.qty_on_hand}</span></td>
                        <td className="px-3 py-2.5"><span className="text-xs text-[#64748B]">{r.reorder_level}</span></td>
                        <td className="px-3 py-2.5"><StockBar pct={r.stock_pct} urgency={r.urgency} /></td>
                        <td className="px-3 py-2.5"><span className="text-xs font-medium text-[#0F172A]">{formatCurrency(r.stock_value)}</span></td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && !isLoading && (
        <div className="px-5 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]">
          <p className="text-xs text-[#64748B]">Menampilkan {filtered.length} dari {all.length} produk</p>
        </div>
      )}
    </div>
  )
}
