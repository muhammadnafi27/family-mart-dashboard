'use client'
import { useQuery } from '@tanstack/react-query'
import { useCustomerFilterStore } from '@/store/customerFilterStore'
import type { CustomerFilters } from '@/types/customer'

function qs(f: CustomerFilters & { type: string }) {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.storeId) sp.set('storeId', String(f.storeId))
  if (f.cityId) sp.set('cityId', String(f.cityId))
  if (f.tierId) sp.set('tierId', String(f.tierId))
  if (f.search) sp.set('search', f.search)
  if (f.page) sp.set('page', String(f.page))
  if (f.pageSize) sp.set('pageSize', String(f.pageSize))
  if (f.sortBy) sp.set('sortBy', f.sortBy)
  if (f.sortDir) sp.set('sortDir', f.sortDir)
  return sp.toString()
}

function useF() { return useCustomerFilterStore((s) => s.getFilters()) }

export const useCustomerKPIs   = () => { const f = useF(); return useQuery({ queryKey: ['cust-kpis', f], queryFn: async () => { const r = await fetch(`/api/customers?${qs({ ...f, type: 'kpis' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const useCustomerGrowth = () => useQuery({ queryKey: ['cust-growth'], queryFn: async () => { const r = await fetch('/api/customers?type=growth'); if (!r.ok) throw new Error(await r.text()); return r.json() }, staleTime: 5*60*1000 })
export const useMembershipTiers = () => { const f = useF(); return useQuery({ queryKey: ['cust-tiers', f], queryFn: async () => { const r = await fetch(`/api/customers?${qs({ ...f, type: 'tiers' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const useMemberSegments  = () => { const f = useF(); return useQuery({ queryKey: ['cust-segments', f], queryFn: async () => { const r = await fetch(`/api/customers?${qs({ ...f, type: 'segments' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const useCustomersByCity = () => { const f = useF(); return useQuery({ queryKey: ['cust-cities', f], queryFn: async () => { const r = await fetch(`/api/customers?${qs({ ...f, type: 'cities' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const useTopCustomers    = () => { const f = useF(); return useQuery({ queryKey: ['cust-top', f], queryFn: async () => { const r = await fetch(`/api/customers?${qs({ ...f, type: '' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
