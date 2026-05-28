'use client'

import { useLowStock } from '@/hooks/useOverview'

type LowStockItem = {
  store_name: string
  product_name: string
  sku: string
  category_name: string
  qty_on_hand: number
  reorder_level: number
}

function StockBar({ qty, reorder }: { qty: number; reorder: number }) {
  const pct = reorder > 0 ? Math.min((qty / reorder) * 100, 100) : 0
  const color = pct === 0 ? '#EF4444' : pct <= 40 ? '#F97316' : '#F59E0B'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-[10px] font-bold tabular-nums min-w-[28px] text-right"
        style={{ color }}
      >
        {qty}
      </span>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F1F5F9]">
      <div className="flex-1 space-y-1.5">
        <div className="h-3 rounded-md bg-slate-100 animate-pulse w-40" />
        <div className="h-2.5 rounded-md bg-slate-100 animate-pulse w-24" />
      </div>
      <div className="h-3 rounded-md bg-slate-100 animate-pulse w-16" />
    </div>
  )
}

export function LowStockTable() {
  const { data, isLoading, isError } = useLowStock()
  const items: LowStockItem[] = data?.lowStock ?? []

  const critical = items.filter((i) => i.qty_on_hand / i.reorder_level <= 0.4)
  const outOfStock = items.filter((i) => i.qty_on_hand === 0)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Stok Rendah</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Perlu restock segera</p>
        </div>
        <div className="flex gap-2">
          {outOfStock.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-[#EF4444]">
              {outOfStock.length} habis
            </span>
          )}
          {critical.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#F97316]">
              {critical.length} kritis
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <div className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</div>
        ) : items.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-[#64748B]">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm font-semibold text-[#22C55E]">Semua stok aman</p>
            <p className="text-xs">Tidak ada produk di bawah batas reorder</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-[#F1F5F9] last:border-0"
            >
              {/* Rank */}
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#F8FAFC] text-[10px] font-bold text-[#64748B] shrink-0">
                {i + 1}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">{item.product_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-[#94A3B8]">{item.sku}</span>
                  <span className="text-[#E2E8F0]">·</span>
                  <span className="text-[10px] text-[#64748B]">{item.store_name}</span>
                </div>
                <div className="mt-1.5">
                  <StockBar qty={item.qty_on_hand} reorder={item.reorder_level} />
                </div>
              </div>

              {/* Reorder level */}
              <div className="text-right shrink-0">
                <p className="text-[10px] text-[#94A3B8]">min.</p>
                <p className="text-xs font-semibold text-[#64748B]">{item.reorder_level}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && !isLoading && (
        <div className="px-5 py-3 border-t border-[#F1F5F9]">
          <p className="text-xs text-[#64748B] text-center">
            Menampilkan {items.length} produk dengan stok rendah
          </p>
        </div>
      )}
    </div>
  )
}
