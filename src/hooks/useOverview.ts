'use client'

import { useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@/store/filterStore'

function buildQS(params: Record<string, Date | number | string | undefined>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, v instanceof Date ? v.toISOString() : String(v))
    }
  })
  return sp.toString()
}

export function useOverviewKPIs() {
  const { from, to, storeId, cityId } = useFilterStore()
  return useQuery({
    queryKey: ['overview-kpis', from?.toISOString(), to?.toISOString(), storeId, cityId],
    queryFn: async () => {
      const qs = buildQS({ from, to, storeId, cityId })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useRevenueTrend() {
  const { from, to, storeId } = useFilterStore()
  return useQuery({
    queryKey: ['revenue-trend', from?.toISOString(), to?.toISOString(), storeId],
    queryFn: async () => {
      const qs = buildQS({ from, to, storeId, type: 'trend' })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useStorePerformance() {
  const { from, to } = useFilterStore()
  return useQuery({
    queryKey: ['store-performance', from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const qs = buildQS({ from, to, type: 'stores' })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useTopProducts() {
  const { from, to, storeId } = useFilterStore()
  return useQuery({
    queryKey: ['top-products', from?.toISOString(), to?.toISOString(), storeId],
    queryFn: async () => {
      const qs = buildQS({ from, to, storeId, type: 'products' })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function usePaymentDistribution() {
  const { from, to } = useFilterStore()
  return useQuery({
    queryKey: ['payment-distribution', from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const qs = buildQS({ from, to, type: 'payments' })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useRecentTransactions() {
  const { from, to, storeId } = useFilterStore()
  return useQuery({
    queryKey: ['recent-transactions', from?.toISOString(), to?.toISOString(), storeId],
    queryFn: async () => {
      const qs = buildQS({ from, to, storeId, type: 'transactions' })
      const res = await fetch(`/api/overview?${qs}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    refetchInterval: 60_000,
  })
}

export function useLowStock() {
  return useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await fetch('/api/overview?type=lowstock')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const res = await fetch('/api/overview?type=filters')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    staleTime: Infinity,
  })
}
