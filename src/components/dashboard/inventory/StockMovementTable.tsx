'use client'

import { ArrowUp, ArrowDown, ClipboardList } from 'lucide-react'
import { useStockMovement } from '@/hooks/useInventory'
import { useInventoryFilterStore } from '@/store/inventoryFilterStore'
import { formatNumber } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import type { StockMovementRow } from '@/types/inventory'

function RowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {[100, 160, 64, 80, 64, 80, 80].map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export function StockMovementTable() {
  const { data, isLoading, isError } = useStockMovement()
  const { page, setPage } = useInventoryFilterStore()
  const rows: StockMovementRow[] = Array.isArray(data) ? data : []

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Riwayat Penyesuaian Stok</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Histori perubahan inventori terbaru</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5 bg-[#DCFCE7] text-[#15803D]">
            <ArrowUp className="h-3 w-3" /> Masuk
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-0.5 bg-[#FEE2E2] text-[#DC2626]">
            <ArrowDown className="h-3 w-3" /> Keluar
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {['Waktu','Produk','SKU','Toko','Perubahan','Alasan','Petugas'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? <tr><td colSpan={7} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <ClipboardList className="h-8 w-8 text-[#CBD5E1]" />
                          <p className="text-sm font-medium">Tidak ada penyesuaian stok</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : rows.map((r) => (
                    <tr key={r.adjustment_id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-[11px] text-[#64748B]">{formatDateTime(r.adjustment_date)}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-[#0F172A] max-w-[160px] truncate">{r.product_name}</p>
                        {r.note && <p className="text-[10px] text-[#94A3B8] mt-0.5 max-w-[160px] truncate">{r.note}</p>}
                      </td>
                      <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-[#64748B]">{r.sku}</span></td>
                      <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B] max-w-[100px] truncate block">{r.store_name}</span></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {r.qty_change > 0
                            ? <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#DCFCE7]"><ArrowUp className="h-3 w-3 text-[#15803D]" /></span>
                            : <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#FEE2E2]"><ArrowDown className="h-3 w-3 text-[#DC2626]" /></span>
                          }
                          <span className={`text-sm font-bold ${r.qty_change > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                            {r.qty_change > 0 ? '+' : ''}{formatNumber(r.qty_change)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B]">{r.reason}</span></td>
                      <td className="px-3 py-2.5"><span className="text-[11px] text-[#0F172A]">{r.employee_name}</span></td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {/* Simple pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <span className="text-xs text-[#64748B]">Halaman {page}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="h-7 px-3 rounded-md border border-[#E2E8F0] bg-white text-xs font-medium text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"
          >← Prev</button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={rows.length < 30}
            className="h-7 px-3 rounded-md border border-[#E2E8F0] bg-white text-xs font-medium text-[#64748B] disabled:opacity-40 hover:border-[#0878C8] hover:text-[#0878C8]"
          >Next →</button>
        </div>
      </div>
    </div>
  )
}
