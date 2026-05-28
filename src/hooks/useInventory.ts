'use client'

import { useQuery } from '@tanstack/react-query'
import { useInventoryFilterStore } from '@/store/inventoryFilterStore'
import type { InventoryFilters } from '@/types/inventory'

function buildQS(f: InventoryFilters & { type: string }): string {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.storeId) sp.set('storeId', String(f.storeId))
  if (f.categoryId) sp.set('categoryId', String(f.categoryId))
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.page) sp.set('page', String(f.page))
  return sp.toString()
}

function useF() {
  return useInventoryFilterStore((s) => s.getFilters())
}

export function useInventoryKPIs() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-kpis', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'kpis' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useStockByStore() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-by-store', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'by-store' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useStockByCategory() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-by-cat', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'by-cat' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useAdjustmentTrend() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-trend', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'trend' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useLowStockTable() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-low-stock', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'low-stock' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useReorderAlerts() {
  return useQuery({
    queryKey: ['inventory-reorder'],
    queryFn: async () => {
      const res = await fetch('/api/inventory?type=reorder')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useStockMovement() {
  const f = useF()
  return useQuery({
    queryKey: ['inventory-movement', f],
    queryFn: async () => {
      const res = await fetch(`/api/inventory?${buildQS({ ...f, type: 'movement' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}
