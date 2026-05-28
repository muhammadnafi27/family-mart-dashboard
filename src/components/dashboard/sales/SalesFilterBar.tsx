'use client'

import * as React from 'react'
import { SlidersHorizontal, X, ChevronDown, Check, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { cn } from '@/lib/utils'
import { useSalesFilterStore } from '@/store/salesFilterStore'
import { useSalesFilterOptions } from '@/hooks/useSales'
import type { SalesStatus } from '@/types/sales'

/* ──────────────── tiny primitives ──────────────── */
function Popover({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

type SelectOption = { value: string; label: string }
function FilterChip({
  value, placeholder, options, onChange,
}: {
  value: string; placeholder: string; options: SelectOption[]; onChange: (v: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all whitespace-nowrap',
          value !== 'all'
            ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]'
            : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]/50'
        )}
      >
        <span className="truncate max-w-[110px]">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[170px] max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1">
          {[{ value: 'all', label: placeholder }, ...options].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-[#F8FAFC] transition-colors',
                opt.value === value ? 'text-[#0878C8] font-semibold' : 'text-[#0F172A]'
              )}
            >
              <Check className={cn('h-3.5 w-3.5 shrink-0', opt.value === value ? 'opacity-100 text-[#0878C8]' : 'opacity-0')} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ──────────────── SalesFilterBar ──────────────── */
export function SalesFilterBar() {
  const {
    from, to, storeId, cityId, cashierId, paymentMethodId, status,
    setDateRange, setStoreId, setCityId, setCashierId, setPaymentMethodId,
    setStatus, reset,
  } = useSalesFilterStore()

  const { data: options } = useSalesFilterOptions()

  const dateLabel = React.useMemo(() => {
    if (from && to)
      return `${format(from, 'd MMM', { locale: idLocale })} – ${format(to, 'd MMM yyyy', { locale: idLocale })}`
    if (from) return format(from, 'd MMM yyyy', { locale: idLocale })
    return 'Pilih periode'
  }, [from, to])

  const activeCount = [storeId, cityId, cashierId, paymentMethodId, status].filter(Boolean).length

  const storeOpts: SelectOption[] = (options?.stores ?? []).map(
    (s: { store_id: number; store_name: string }) => ({ value: String(s.store_id), label: s.store_name })
  )
  const cityOpts: SelectOption[] = (options?.cities ?? []).map(
    (c: { city_id: number; city_name: string }) => ({ value: String(c.city_id), label: c.city_name })
  )
  const cashierOpts: SelectOption[] = (options?.cashiers ?? []).map(
    (c: { employee_id: number; full_name: string }) => ({ value: String(c.employee_id), label: c.full_name })
  )
  const payOpts: SelectOption[] = (options?.paymentMethods ?? []).map(
    (m: { method_id: number; method_name: string }) => ({ value: String(m.method_id), label: m.method_name })
  )
  const statusOpts: SelectOption[] = [
    { value: 'completed', label: 'Selesai' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {/* Label */}
      <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B]">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0878C8] text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </div>

      {/* Date picker */}
      <Popover
        trigger={
          <button className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all',
            (from || to)
              ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8]/50'
          )}>
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {dateLabel}
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>
        }
      >
        <div className="p-3">
          <DayPicker
            mode="range"
            selected={{ from, to } as DateRange}
            onSelect={(r) => setDateRange(r?.from, r?.to)}
            locale={idLocale}
            numberOfMonths={2}
            className="text-sm"
          />
        </div>
      </Popover>

      {/* Other filters */}
      <FilterChip
        value={storeId ? String(storeId) : 'all'}
        placeholder="Semua Toko"
        options={storeOpts}
        onChange={(v) => setStoreId(v === 'all' ? undefined : Number(v))}
      />
      <FilterChip
        value={cityId ? String(cityId) : 'all'}
        placeholder="Semua Kota"
        options={cityOpts}
        onChange={(v) => setCityId(v === 'all' ? undefined : Number(v))}
      />
      <FilterChip
        value={cashierId ? String(cashierId) : 'all'}
        placeholder="Semua Kasir"
        options={cashierOpts}
        onChange={(v) => setCashierId(v === 'all' ? undefined : Number(v))}
      />
      <FilterChip
        value={paymentMethodId ? String(paymentMethodId) : 'all'}
        placeholder="Metode Bayar"
        options={payOpts}
        onChange={(v) => setPaymentMethodId(v === 'all' ? undefined : Number(v))}
      />
      <FilterChip
        value={status || 'all'}
        placeholder="Semua Status"
        options={statusOpts}
        onChange={(v) => setStatus(v === 'all' ? '' : v as SalesStatus)}
      />

      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={reset}
          className="flex items-center gap-1 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-[#EF4444] hover:bg-red-100 transition-colors"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  )
}
