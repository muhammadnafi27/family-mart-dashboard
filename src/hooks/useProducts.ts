'use client'

import { useQuery } from '@tanstack/react-query'
import { useProductFilterStore } from '@/store/productFilterStore'
import type { ProductFilters } from '@/types/product'

function buildQS(f: ProductFilters & { type: string }): string {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.categoryId) sp.set('categoryId', String(f.categoryId))
  if (f.brandId) sp.set('brandId', String(f.brandId))
  if (f.search) sp.set('search', f.search)
  if (f.page) sp.set('page', String(f.page))
  if (f.pageSize) sp.set('pageSize', String(f.pageSize))
  if (f.sortBy) sp.set('sortBy', f.sortBy)
  if (f.sortDir) sp.set('sortDir', f.sortDir)
  if (f.status) sp.set('status', f.status)
  return sp.toString()
}

function useF() {
  return useProductFilterStore((s) => s.getFilters())
}

export function useProductKPIs() {
  const f = useF()
  return useQuery({
    queryKey: ['product-kpis', f],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQS({ ...f, type: 'kpis' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useTopProducts() {
  const f = useF()
  return useQuery({
    queryKey: ['product-top', f],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQS({ ...f, type: 'top' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useProductCategorySales() {
  const f = useF()
  return useQuery({
    queryKey: ['product-category-sales', f],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQS({ ...f, type: 'category' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useBrandPerformance() {
  const f = useF()
  return useQuery({
    queryKey: ['product-brand', f],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQS({ ...f, type: 'brand' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useProductTable() {
  const f = useF()
  return useQuery({
    queryKey: ['product-table', f],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQS({ ...f, type: '' })}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}

export function useProductFilterOptions() {
  return useQuery({
    queryKey: ['product-filter-options'],
    queryFn: async () => {
      const res = await fetch('/api/products?type=filters')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    staleTime: Infinity,
  })
}
