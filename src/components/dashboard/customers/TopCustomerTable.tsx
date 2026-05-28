'use client'

import * as React from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useTopCustomers } from '@/hooks/useCustomers'
import { useCustomerFilterStore } from '@/store/customerFilterStore'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { TopCustomerRow } from '@/types/customer'

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  Platinum: { bg: '#F5F3FF', color: '#7C3AED' },
  Gold:     { bg: '#FEF3C7', color: '#B45309' },
  Silver:   { bg: '#F1F5F9', color: '#475569' },
  Bronze:   { bg: '#FEF9EE', color: '#92400E' },
  'Non-Member': { bg: '#F8FAFC', color: '#94A3B8' },
}

function RowSkeleton({ cols = 9 }: { cols?: number }) {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: i === 1 ? 120 : 64 }} />
        </td>
      ))}
    </tr>
  )
}

function SortIcon({ s }: { s: false | 'asc' | 'desc' }) {
  if (s === 'asc') return <ChevronUp className="h-3 w-3 text-[#0878C8]" />
  if (s === 'desc') return <ChevronDown className="h-3 w-3 text-[#0878C8]" />
  return <ChevronsUpDown className="h-3 w-3 text-[#CBD5E1]" />
}

export function TopCustomerTable() {
  const { data, isLoading, isError } = useTopCustomers()
  const { search, page, pageSize, sortBy, sortDir, setSearch, setPage, setSort } = useCustomerFilterStore()
  const [localSearch, setLocalSearch] = React.useState(search)

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 350)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  const rows: TopCustomerRow[] = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const COLS = [
    { key: '#', label: '#', sortable: false },
    { key: 'full_name', label: 'Nama', sortable: false },
    { key: 'city_name', label: 'Kota', sortable: false },
    { key: 'tier_name', label: 'Tier', sortable: false },
    { key: 'member_no', label: 'No. Member', sortable: false },
    { key: 'order_count', label: 'Transaksi', sortable: true },
    { key: 'total_spent', label: 'Total Belanja', sortable: true },
    { key: 'avg_order', label: 'Avg/Order', sortable: true },
    { key: 'last_purchase', label: 'Terakhir Beli', sortable: true },
  ]

  function handleSort(key: string) {
    if (!COLS.find((c) => c.key === key)?.sortable) return
    setSort(key, sortBy === key && sortDir === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Top Pelanggan</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {!isLoading && total > 0 && `${((page - 1) * pageSize + 1).toLocaleString('id-ID')}–${Math.min(page * pageSize, total).toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} pelanggan`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari nama / telepon..."
            className="h-8 w-56 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {COLS.map((c) => (
                <th key={c.key}
                  onClick={() => handleSort(c.key)}
                  className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap ${c.sortable ? 'cursor-pointer hover:text-[#0878C8] select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {c.label}
                    {c.sortable && <SortIcon s={sortBy === c.key ? sortDir : false} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? <tr><td colSpan={9} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : rows.length === 0
                  ? <tr><td colSpan={9} className="py-12 text-center"><div className="flex flex-col items-center gap-2 text-[#64748B]"><span className="text-2xl">👥</span><p className="text-sm font-medium">Tidak ada pelanggan ditemukan</p></div></td></tr>
                  : rows.map((c, i) => {
                    const tier = TIER_STYLE[c.tier_name] ?? TIER_STYLE['Non-Member']
                    return (
                      <tr key={c.customer_id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#F8FAFC] text-[11px] font-bold text-[#64748B]">
                            {(page - 1) * pageSize + i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-[#0878C8]">{c.full_name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0F172A]">{c.full_name}</p>
                              {c.gender && <p className="text-[10px] text-[#94A3B8]">{c.gender}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B]">{c.city_name ?? '—'}</span></td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5" style={tier}>{c.tier_name}</span>
                        </td>
                        <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-[#64748B]">{c.member_no ?? '—'}</span></td>
                        <td className="px-3 py-2.5 text-center"><span className="text-xs font-medium text-[#0878C8]">{formatNumber(c.order_count)}</span></td>
                        <td className="px-3 py-2.5"><span className="text-sm font-bold text-[#0F172A]">{formatCurrency(c.total_spent)}</span></td>
                        <td className="px-3 py-2.5"><span className="text-xs text-[#64748B]">{formatCurrency(c.avg_order)}</span></td>
                        <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] whitespace-nowrap">{c.last_purchase ? formatDate(c.last_purchase, 'dd/MM/yyyy') : '—'}</span></td>
                      </tr>
                    )
                  })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">Hal. <b>{page}</b> / <b>{totalPages}</b></span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"><ChevronLeft className="h-3.5 w-3.5" /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p < 1 || p > totalPages) return null
            return <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold ${p === page ? 'bg-[#0878C8] text-white border border-[#0878C8]' : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]'}`}>{p}</button>
          })}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"><ChevronRight className="h-3.5 w-3.5" /></button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">»</button>
        </div>
      </div>
    </div>
  )
}
