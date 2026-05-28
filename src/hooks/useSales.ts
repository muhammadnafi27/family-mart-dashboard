'use client'

import { useQuery } from '@tanstack/react-query'
import { useSalesFilterStore } from '@/store/salesFilterStore'
import type { SalesFilters } from '@/types/sales'

function buildQS(f: SalesFilters & { type: string }): string {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.storeId) sp.set('storeId', String(f.storeId))
  if (f.cityId) sp.set('cityId', String(f.cityId))
  if (f.cashierId) sp.set('cashierId', String(f.cashierId))
  if (f.paymentMethodId) sp.set('paymentMethodId', String(f.paymentMethodId))
  if (f.status) sp.set('status', f.status)
  if (f.groupBy) sp.set('groupBy', f.groupBy)
  if (f.search) sp.set('search', f.search)
  if (f.page) sp.set('page', String(f.page))
  if (f.pageSize) sp.set('pageSize', String(f.pageSize))
  if (f.sortBy) sp.set('sortBy', f.sortBy)
  if (f.sortDir) sp.set('sortDir', f.sortDir)
  return sp.toString()
}

function useFilters() {
  return useSalesFilterStore((s) => ({
    from: s.from, to: s.to, storeId: s.storeId, cityId: s.cityId,
    cashierId: s.cashierId, paymentMethodId: s.paymentMethodId,
    status: s.status, groupBy: s.groupBy, search: s.search,
    page: s.page, pageSize: s.pageSize, sortBy: s.sortBy, sortDir: s.sortDir,
  }))
}

/* ─── KPIs ─── */
export function useSalesKPIs() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-kpis', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'kpis' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Trend ─── */
export function useSalesTrend() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-trend', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'trend' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Heatmap ─── */
export function useHourlyHeatmap() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-heatmap', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'heatmap' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Store sales ─── */
export function useStoreSales() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-stores', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'stores' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Cashier stats ─── */
export function useCashierStats() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-cashiers', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'cashiers' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Category ─── */
export function useCategorySales() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-category', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: 'category' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Orders table ─── */
export function useSalesOrders() {
  const f = useFilters()
  return useQuery({
    queryKey: ['sales-orders', f],
    queryFn: async () => {
      const res = await fetch(`/api/sales?${buildQS({ ...f, type: '' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

/* ─── Filter options (cached forever) ─── */
export function useSalesFilterOptions() {
  return useQuery({
    queryKey: ['sales-filter-options'],
    queryFn: async () => {
      const res = await fetch('/api/sales?type=filters')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    staleTime: Infinity,
  })
}
