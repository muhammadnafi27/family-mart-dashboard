'use client'

import { useRecentTransactions } from '@/hooks/useOverview'
import { formatCurrency } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const METHOD_COLORS: Record<string, string> = {
  Cash: '#37B220',
  'Kartu Debit': '#0878C8',
  'Kartu Kredit': '#8B5CF6',
  QRIS: '#F97316',
  Transfer: '#0EA5E9',
  OVO: '#7C3AED',
  GoPay: '#22C55E',
}

function RowSkeleton() {
  return (
    <tr className="border-b border-[#F1F5F9]">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 rounded-md bg-slate-100 animate-pulse" style={{ width: i === 0 ? '90px' : i === 4 ? '70px' : '60px' }} />
        </td>
      ))}
    </tr>
  )
}

export function RecentTransactionsTable() {
  const { data, isLoading, isError } = useRecentTransactions()
  const transactions: {
    sale_id: number
    invoice_number: string
    store: { store_name: string }
    customer: { full_name: string } | null
    sale_datetime: string
    grand_total: number
    discount_total: number
    payments: { method: { method_name: string } }[]
    items: { quantity: number }[]
  }[] = data?.transactions ?? []

  const totalItems = (items: { quantity: number }[]) =>
    items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Transaksi Terkini</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {!isLoading && transactions.length > 0 && `${transactions.length} transaksi terakhir`}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" title="Live" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Invoice</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Toko</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Pelanggan</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Waktu</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Total</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Bayar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              : isError
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#64748B]">
                      Gagal memuat data transaksi
                    </td>
                  </tr>
                )
                : transactions.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <span className="text-2xl">🛒</span>
                          <p className="text-sm font-medium">Tidak ada transaksi</p>
                          <p className="text-xs">Coba ubah rentang tanggal filter</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : transactions.map((t) => {
                    const method = t.payments[0]?.method?.method_name ?? '-'
                    const methodColor = METHOD_COLORS[method] ?? '#64748B'
                    const items = totalItems(t.items)

                    return (
                      <tr
                        key={t.sale_id}
                        className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                      >
                        {/* Invoice */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-[#0878C8]">
                            {t.invoice_number}
                          </span>
                        </td>

                        {/* Store */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#64748B] max-w-[120px] truncate block">
                            {t.store.store_name}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          {t.customer ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-[#0878C8]">
                                  {t.customer.full_name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-xs text-[#0F172A] max-w-[100px] truncate">
                                {t.customer.full_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs italic text-[#94A3B8]">Umum</span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#64748B] whitespace-nowrap">
                            {formatDateTime(t.sale_datetime)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right">
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">
                              {formatCurrency(Number(t.grand_total))}
                            </p>
                            <p className="text-[10px] text-[#94A3B8]">{items} item</p>
                          </div>
                        </td>

                        {/* Payment method */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: `${methodColor}15`,
                              color: methodColor,
                            }}
                          >
                            {method}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
