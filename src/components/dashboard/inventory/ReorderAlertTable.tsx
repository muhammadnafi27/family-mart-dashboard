'use client'

import { RefreshCw } from 'lucide-react'
import { useReorderAlerts } from '@/hooks/useInventory'
import { formatNumber } from '@/lib/utils'
import type { ReorderAlertRow } from '@/types/inventory'

function RowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {[160, 64, 80, 48, 64, 64].map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export function ReorderAlertTable() {
  const { data, isLoading, isError } = useReorderAlerts()
  const alerts: ReorderAlertRow[] = Array.isArray(data) ? data : []

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-4 w-4 text-[#F97316]" />
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Perlu Reorder</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{alerts.length} produk perlu dipesan ulang</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="rounded-full bg-[#FFF7ED] text-[#C2410C] text-[11px] font-bold px-2.5 py-0.5">
            {alerts.filter((a) => a.needs_restock).length} mendesak
          </span>
        )}
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="sticky top-0">
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              {['Produk','SKU','Kategori','Toko Terdampak','Stok Total','Reorder Min.','Prioritas'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? <tr><td colSpan={7} className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</td></tr>
                : alerts.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <span className="text-2xl">✓</span>
                          <p className="text-sm font-medium text-[#22C55E]">Tidak ada produk yang perlu reorder</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : alerts.map((a) => (
                    <tr key={a.product_id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-[#0F172A] max-w-[160px] truncate">{a.product_name}</p>
                      </td>
                      <td className="px-3 py-2.5"><span className="font-mono text-[11px] text-[#64748B]">{a.sku}</span></td>
                      <td className="px-3 py-2.5"><span className="text-[11px] text-[#64748B]">{a.category_name}</span></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#0878C8]">{a.stores_affected}</span>
                          <span className="text-[11px] text-[#64748B]">toko</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-sm font-bold ${a.total_qty === 0 ? 'text-[#DC2626]' : a.total_qty < a.avg_reorder_level ? 'text-[#F97316]' : 'text-[#64748B]'}`}>
                          {formatNumber(a.total_qty)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5"><span className="text-xs text-[#64748B]">{formatNumber(a.avg_reorder_level)}</span></td>
                      <td className="px-3 py-2.5">
                        {a.needs_restock ? (
                          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309]">Segera</span>
                        ) : (
                          <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5 bg-[#FFF7ED] text-[#C2410C]">Rencanakan</span>
                        )}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
