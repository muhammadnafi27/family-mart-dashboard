'use client'

import * as React from 'react'
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/store/filterStore'
import { useFilterOptions } from '@/hooks/useOverview'
import { DateRangePicker } from '@/components/ui/date-range-picker'

/* ─────────────────── Mini select ─────────────────── */
type SelectOption = { value: string; label: string }

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: SelectOption[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
          value !== 'all'
            ? 'border-[#0878C8] bg-[#EFF6FF] text-[#0878C8]'
            : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0878C8] hover:text-[#0878C8]'
        )}
      >
        <span className="truncate max-w-[100px]">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1 max-h-56 overflow-y-auto">
          {[{ value: 'all', label: placeholder }, ...options].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-[#F8FAFC]',
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

/* ─────────────────── FilterBar ─────────────────── */
export function FilterBar() {
  const {
    from, to, storeId, cityId, categoryId, paymentMethodId,
    setDateRange, setStoreId, setCityId, setCategoryId, setPaymentMethodId,
    resetFilters,
  } = useFilterStore()

  const { data: options, isLoading } = useFilterOptions()

  const activeCount = [storeId, cityId, categoryId, paymentMethodId].filter(Boolean).length

  const storeOpts: SelectOption[] = (options?.stores ?? []).map(
    (s: { store_id: number; store_name: string }) => ({ value: String(s.store_id), label: s.store_name })
  )
  const cityOpts: SelectOption[] = (options?.cities ?? []).map(
    (c: { city_id: number; city_name: string }) => ({ value: String(c.city_id), label: c.city_name })
  )
  const catOpts: SelectOption[] = (options?.categories ?? []).map(
    (c: { category_id: number; category_name: string }) => ({ value: String(c.category_id), label: c.category_name })
  )
  const payOpts: SelectOption[] = (options?.paymentMethods ?? []).map(
    (m: { method_id: number; method_name: string }) => ({ value: String(m.method_id), label: m.method_name })
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter icon badge */}
      <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0878C8] text-white text-[10px] font-bold ml-0.5">
            {activeCount}
          </span>
        )}
      </div>

      {/* Date range – mobile */}
      <div className="sm:hidden w-full">
        <DateRangePicker from={from} to={to} onChange={setDateRange} className="w-full" />
      </div>

      {/* Selects */}
      {!isLoading && (
        <>
          <FilterSelect
            value={storeId ? String(storeId) : 'all'}
            placeholder="Semua Toko"
            options={storeOpts}
            onChange={(v) => setStoreId(v === 'all' ? undefined : Number(v))}
          />
          <FilterSelect
            value={cityId ? String(cityId) : 'all'}
            placeholder="Semua Kota"
            options={cityOpts}
            onChange={(v) => setCityId(v === 'all' ? undefined : Number(v))}
          />
          <FilterSelect
            value={categoryId ? String(categoryId) : 'all'}
            placeholder="Semua Kategori"
            options={catOpts}
            onChange={(v) => setCategoryId(v === 'all' ? undefined : Number(v))}
          />
          <FilterSelect
            value={paymentMethodId ? String(paymentMethodId) : 'all'}
            placeholder="Metode Bayar"
            options={payOpts}
            onChange={(v) => setPaymentMethodId(v === 'all' ? undefined : Number(v))}
          />
        </>
      )}

      {activeCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-[#EF4444] hover:bg-red-100 transition-colors"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  )
}
