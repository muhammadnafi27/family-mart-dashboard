'use client'

import * as React from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, createColumnHelper, type SortingState,
} from '@tanstack/react-table'
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Package } from 'lucide-react'
import { useProductTable } from '@/hooks/useProducts'
import { useProductFilterStore } from '@/store/productFilterStore'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { ProductTableRow } from '@/types/product'

const col = createColumnHelper<ProductTableRow>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: any[] = [
  col.accessor('sku', {
    header: 'SKU',
    cell: (i) => <span className="font-mono text-[11px] text-[#64748B]">{i.getValue() as string}</span>,
  }),
  col.accessor('product_name', {
    header: 'Nama Produk',
    cell: (i) => (
      <div className="max-w-[180px]">
        <p className="text-xs font-semibold text-[#0F172A] truncate">{i.getValue() as string}</p>
        <p className="text-[10px] text-[#94A3B8] truncate">{i.row.original.subcategory_name}</p>
      </div>
    ),
  }),
  col.accessor('category_name', {
    header: 'Kategori',
    cell: (i) => <span className="text-[11px] text-[#64748B]">{i.getValue() as string}</span>,
  }),
  col.accessor('brand_name', {
    header: 'Brand',
    cell: (i) => <span className="text-[11px] text-[#64748B]">{i.getValue() as string}</span>,
  }),
  col.accessor('cost_price', {
    header: 'Harga Pokok',
    cell: (i) => <span className="text-xs text-[#64748B]">{formatCurrency(i.getValue() as number)}</span>,
  }),
  col.accessor('retail_price', {
    header: 'Harga Jual',
    cell: (i) => <span className="text-xs font-semibold text-[#0F172A]">{formatCurrency(i.getValue() as number)}</span>,
  }),
  col.accessor('margin_pct', {
    header: 'Margin',
    cell: (i) => {
      const pct = i.getValue() as number
      const color = pct >= 30 ? '#22C55E' : pct >= 15 ? '#F97316' : '#EF4444'
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color }}>{formatPercent(pct)}</span>
        </div>
      )
    },
  }),
  col.accessor('total_sold', {
    header: 'Terjual',
    cell: (i) => <span className="text-xs font-medium text-[#0878C8]">{formatNumber(i.getValue() as number)}</span>,
  }),
  col.accessor('revenue', {
    header: 'Revenue',
    cell: (i) => <span className="text-xs font-semibold text-[#0F172A]">{formatCurrency(i.getValue() as number)}</span>,
  }),
  col.accessor('gross_profit', {
    header: 'Gross Profit',
    cell: (i) => (
      <span className="text-xs font-semibold text-[#37B220]">{formatCurrency(i.getValue() as number)}</span>
    ),
  }),
  col.accessor('stock_total', {
    header: 'Stok',
    cell: (i) => {
      const v = i.getValue() as number
      return <span className={`text-xs font-medium ${v === 0 ? 'text-[#EF4444]' : v < 10 ? 'text-[#F97316]' : 'text-[#64748B]'}`}>{formatNumber(v)}</span>
    },
  }),
  col.accessor('is_active', {
    header: 'Status',
    cell: (i) => (
      <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${
        i.getValue() ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F1F5F9] text-[#64748B]'
      }`}>
        {i.getValue() ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    enableSorting: false,
  }),
]

function SortIcon({ col: c }: { col: { getIsSorted: () => false | 'asc' | 'desc' } }) {
  const s = c.getIsSorted()
  if (s === 'asc') return <ChevronUp className="h-3 w-3 text-[#0878C8]" />
  if (s === 'desc') return <ChevronDown className="h-3 w-3 text-[#0878C8]" />
  return <ChevronsUpDown className="h-3 w-3 text-[#CBD5E1]" />
}

export function ProductMarginTable() {
  const { data, isLoading, isError } = useProductTable()
  const { search, page, pageSize, sortBy, sortDir, setSearch, setPage, setSort } = useProductFilterStore()
  const [localSearch, setLocalSearch] = React.useState(search)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: sortBy, desc: sortDir === 'desc' }])

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 350)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  React.useEffect(() => {
    if (sorting[0]) setSort(sorting[0].id, sorting[0].desc ? 'desc' : 'asc')
  }, [sorting, setSort])

  const rows: ProductTableRow[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = data?.totalPages ?? 1

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  })

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Daftar Produk & Margin</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {!isLoading && `${((page - 1) * pageSize + 1).toLocaleString('id-ID')}–${Math.min(page * pageSize, total).toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} produk`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari SKU / nama produk..."
            className="h-8 w-56 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap ${h.column.getCanSort() ? 'cursor-pointer hover:text-[#0878C8] select-none' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && <SortIcon col={h.column} />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[#F1F5F9]">
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: j === 1 ? 140 : 64 }} />
                    </td>
                  ))}
                </tr>
              ))
              : isError
                ? <tr><td colSpan={columns.length} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={columns.length} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <Package className="h-8 w-8 text-[#CBD5E1]" />
                          <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">Hal. <b>{page}</b> / <b>{totalPages}</b></span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">«</button>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"><ChevronLeft className="h-3.5 w-3.5" /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p < 1 || p > totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold ${p === page ? 'bg-[#0878C8] text-white border border-[#0878C8]' : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]'}`}>{p}</button>
            )
          })}
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"><ChevronRight className="h-3.5 w-3.5" /></button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]">»</button>
        </div>
      </div>
    </div>
  )
}
