'use client'

import { useCashierStats } from '@/hooks/useSales'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { CashierStat } from '@/types/sales'

const RANK_COLORS = ['#F59E0B', '#94A3B8', '#CD7F32', '#64748B', '#64748B']
const RANK_LABELS = ['🥇', '🥈', '🥉', '4', '5', '6', '7', '8', '9', '10']

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F1F5F9]">
      <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 rounded-md bg-slate-100 animate-pulse" />
        <div className="h-3 w-20 rounded-md bg-slate-100 animate-pulse" />
      </div>
      <div className="h-4 w-20 rounded-md bg-slate-100 animate-pulse" />
    </div>
  )
}

export function CashierLeaderboard() {
  const { data, isLoading, isError } = useCashierStats()
  const cashiers: CashierStat[] = Array.isArray(data) ? data : []

  const maxRevenue = cashiers[0]?.revenue ?? 1

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Leaderboard Kasir</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Top 10 kasir berdasarkan revenue</p>
        </div>
        <span className="text-xs font-semibold text-[#0878C8] bg-[#EFF6FF] px-2.5 py-1 rounded-full">
          {cashiers.length} kasir
        </span>
      </div>

      {/* List */}
      <div className="px-5 pb-2 overflow-y-auto max-h-[440px]">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
          : isError
            ? <div className="py-12 text-center text-sm text-[#64748B]">Gagal memuat data</div>
            : cashiers.length === 0
              ? <div className="py-12 text-center text-sm text-[#64748B]">Tidak ada data</div>
              : cashiers.map((c, i) => {
                const barPct = (c.revenue / maxRevenue) * 100
                const rankColor = RANK_COLORS[i] ?? '#64748B'
                const isTop3 = i < 3

                return (
                  <div key={c.cashier_id} className="py-3 border-b border-[#F1F5F9] last:border-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      {/* Rank badge */}
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full text-sm shrink-0 font-bold ${
                          isTop3 ? 'text-white' : 'bg-[#F8FAFC] text-[#64748B] text-xs'
                        }`}
                        style={isTop3 ? { background: rankColor } : undefined}
                      >
                        {isTop3 ? RANK_LABELS[i] : String(i + 1)}
                      </div>

                      {/* Name + store */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{c.cashier_name}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{c.store_name}</p>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#0878C8]">{formatCurrency(c.revenue)}</p>
                        <p className="text-[11px] text-[#64748B]">{formatNumber(c.transactions)} trx</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 pl-11">
                      <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barPct}%`,
                            background: `linear-gradient(to right, ${rankColor}80, ${rankColor})`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#94A3B8] w-10 text-right">
                        {formatCurrency(c.avg_order).replace('Rp', '').trim()}
                      </span>
                    </div>
                  </div>
                )
              })}
      </div>
    </div>
  )
}
