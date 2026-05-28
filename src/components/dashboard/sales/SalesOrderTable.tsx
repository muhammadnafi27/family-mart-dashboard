'use client'

import * as React from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  createColumnHelper, type SortingState,
} from '@tanstack/react-table'
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSalesOrders } from '@/hooks/useSales'
import { useSalesFilterStore } from '@/store/salesFilterStore'
import { formatCurrency } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import type { SalesOrderRow, SalesStatus } from '@/types/sales'

/* ─── Status badge ─── */
const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  completed: { label: 'Selesai',    bg: '#DCFCE7', color: '#15803D' },
  cancelled: { label: 'Dibatalkan', bg: '#FEE2E2', color: '#DC2626' },
  pending:   { label: 'Pending',    bg: '#FEF9C3', color: '#A16207' },
}
function StatusBadge({ status }: { status: SalesStatus }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

/* ─── Sort icon ─── */
function SortIcon({ col }: { col: { getIsSorted: () => false | 'asc' | 'desc' } }) {
  const s = col.getIsSorted()
  if (s === 'asc') return <ChevronUp className="h-3 w-3 text-[#0878C8]" />
  if (s === 'desc') return <ChevronDown className="h-3 w-3 text-[#0878C8]" />
  return <ChevronsUpDown className="h-3 w-3 text-[#CBD5E1]" />
}

/* ─── Row skeleton ─── */
function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: i === 0 ? 88 : 64 }} />
        </td>
      ))}
    </tr>
  )
}

/* ─── Column helper ─── */
const col = createColumnHelper<SalesOrderRow>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: any[] = [
  col.accessor('invoice_number', {
    header: 'Invoice',
    cell: (i) => (
      <span className="font-mono text-[11px] font-bold text-[#0878C8]">{i.getValue() as string}</span>
    ),
  }),
  col.accessor('store_name', {
    header: 'Toko',
    cell: (i) => <span className="text-xs text-[#64748B]">{i.getValue() as string}</span>,
  }),
  col.accessor('cashier_name', {
    header: 'Kasir',
    cell: (i) => (
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-[#0878C8]">
            {(i.getValue() as string).charAt(0)}
          </span>
        </div>
        <span className="text-xs text-[#0F172A] truncate max-w-[80px]">{i.getValue() as string}</span>
      </div>
    ),
  }),
  col.accessor('customer_name', {
    header: 'Pelanggan',
    cell: (i) =>
      i.getValue()
        ? <span className="text-xs text-[#0F172A]">{i.getValue() as string}</span>
        : <span className="text-xs italic text-[#94A3B8]">Umum</span>,
  }),
  col.accessor('payment_method', {
    header: 'Pembayaran',
    cell: (i) => (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
        {i.getValue() as string}
      </span>
    ),
  }),
  col.accessor('subtotal', {
    header: 'Subtotal',
    cell: (i) => <span className="text-xs text-[#64748B]">{formatCurrency(Number(i.getValue()))}</span>,
  }),
  col.accessor('discount_total', {
    header: 'Diskon',
    cell: (i) => (
      <span className={`text-xs font-medium ${Number(i.getValue()) > 0 ? 'text-[#F97316]' : 'text-[#CBD5E1]'}`}>
        {Number(i.getValue()) > 0 ? `- ${formatCurrency(Number(i.getValue()))}` : '—'}
      </span>
    ),
  }),
  col.accessor('grand_total', {
    header: 'Grand Total',
    cell: (i) => <span className="text-sm font-bold text-[#0F172A]">{formatCurrency(Number(i.getValue()))}</span>,
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (i) => <StatusBadge status={i.getValue() as SalesStatus} />,
    enableSorting: false,
  }),
  col.accessor('sale_datetime', {
    header: 'Waktu',
    cell: (i) => <span className="text-[11px] text-[#64748B] whitespace-nowrap">{formatDateTime(i.getValue() as string)}</span>,
  }),
]

/* ─── Table ─── */
export function SalesOrderTable() {
  const { data, isLoading, isError } = useSalesOrders()
  const { search, page, sortBy, sortDir, pageSize, setSearch, setPage, setSort } = useSalesFilterStore()
  const [localSearch, setLocalSearch] = React.useState(search)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: sortBy, desc: sortDir === 'desc' },
  ])

  // debounce search → store
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(localSearch), 350)
    return () => clearTimeout(t)
  }, [localSearch, setSearch])

  // sync sorting → store
  React.useEffect(() => {
    if (sorting[0]) setSort(sorting[0].id, sorting[0].desc ? 'desc' : 'asc')
  }, [sorting, setSort])

  const rows: SalesOrderRow[] = data?.data ?? []
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

  const from = (page - 1) * pageSize + 1
  const toRow = Math.min(page * pageSize, total)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Daftar Transaksi</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {!isLoading && total > 0 ? `${from}–${toRow} dari ${total.toLocaleString('id-ID')} transaksi` : '—'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari invoice, kasir, pelanggan..."
            className="h-8 w-64 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0878C8] focus:ring-2 focus:ring-[#0878C8]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap ${
                      h.column.getCanSort() ? 'cursor-pointer hover:text-[#0878C8] select-none' : ''
                    }`}
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
              ? Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} cols={columns.length} />)
              : isError
                ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#64748B]">
                      Gagal memuat data transaksi
                    </td>
                  </tr>
                )
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <span className="text-2xl">🛒</span>
                          <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
                          <p className="text-xs">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">
          Halaman <b>{page}</b> dari <b>{totalPages}</b>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8] transition-colors text-xs font-bold"
          >
            «
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8] transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p < 1 || p > totalPages) return null
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                  p === page
                    ? 'bg-[#0878C8] text-white border border-[#0878C8]'
                    : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8] hover:text-[#0878C8]'
                }`}
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8] transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8] transition-colors text-xs font-bold"
          >
            »
          </button>
        </div>
      </div>
    </div>
  )
}
