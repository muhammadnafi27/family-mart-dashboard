'use client'
import { useQuery } from '@tanstack/react-query'
import { usePaymentFilterStore } from '@/store/paymentFilterStore'
import type { PaymentFilters } from '@/types/payment'

function qs(f: PaymentFilters & { type: string }) {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.storeId) sp.set('storeId', String(f.storeId))
  if (f.methodId) sp.set('methodId', String(f.methodId))
  if (f.status) sp.set('status', f.status)
  if (f.search) sp.set('search', f.search)
  if (f.page) sp.set('page', String(f.page))
  if (f.pageSize) sp.set('pageSize', String(f.pageSize))
  if (f.sortBy) sp.set('sortBy', f.sortBy)
  if (f.sortDir) sp.set('sortDir', f.sortDir)
  return sp.toString()
}

function useF() { return usePaymentFilterStore((s) => s.getFilters()) }

export const usePaymentKPIs     = () => { const f = useF(); return useQuery({ queryKey: ['pay-kpis', f], queryFn: async () => { const r = await fetch(`/api/payments?${qs({ ...f, type: 'kpis' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePaymentMethods  = () => { const f = useF(); return useQuery({ queryKey: ['pay-methods', f], queryFn: async () => { const r = await fetch(`/api/payments?${qs({ ...f, type: 'methods' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePaymentTrend    = () => { const f = useF(); return useQuery({ queryKey: ['pay-trend', f], queryFn: async () => { const r = await fetch(`/api/payments?${qs({ ...f, type: 'trend' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePaymentStatus   = () => { const f = useF(); return useQuery({ queryKey: ['pay-status', f], queryFn: async () => { const r = await fetch(`/api/payments?${qs({ ...f, type: 'status' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePaymentTransactions = () => { const f = useF(); return useQuery({ queryKey: ['pay-txn', f], queryFn: async () => { const r = await fetch(`/api/payments?${qs({ ...f, type: '' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
