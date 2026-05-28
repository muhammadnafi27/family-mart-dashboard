'use client'
import { useQuery } from '@tanstack/react-query'
import { usePromotionFilterStore } from '@/store/promotionFilterStore'
import type { PromotionFilters } from '@/types/promotion'

function qs(f: PromotionFilters & { type: string }) {
  const sp = new URLSearchParams()
  sp.set('type', f.type)
  if (f.from) sp.set('from', f.from.toISOString())
  if (f.to) sp.set('to', f.to.toISOString())
  if (f.status) sp.set('status', f.status)
  if (f.page) sp.set('page', String(f.page))
  if (f.pageSize) sp.set('pageSize', String(f.pageSize))
  return sp.toString()
}

function useF() { return usePromotionFilterStore((s) => s.getFilters()) }

export const usePromotionKPIs   = () => { const f = useF(); return useQuery({ queryKey: ['promo-kpis', f], queryFn: async () => { const r = await fetch(`/api/promotions?${qs({ ...f, type: 'kpis' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePromoUsageStats = () => { const f = useF(); return useQuery({ queryKey: ['promo-usage', f], queryFn: async () => { const r = await fetch(`/api/promotions?${qs({ ...f, type: 'usage' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const usePromoTrend      = () => { const f = useF(); return useQuery({ queryKey: ['promo-trend', f], queryFn: async () => { const r = await fetch(`/api/promotions?${qs({ ...f, type: 'trend' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
export const useCouponStats     = () => useQuery({ queryKey: ['promo-coupons'], queryFn: async () => { const r = await fetch('/api/promotions?type=coupons'); if (!r.ok) throw new Error(await r.text()); return r.json() }, staleTime: 5*60*1000 })
export const usePromoProductTable = () => { const f = useF(); return useQuery({ queryKey: ['promo-products', f], queryFn: async () => { const r = await fetch(`/api/promotions?${qs({ ...f, type: '' })}`); if (!r.ok) throw new Error(await r.text()); return r.json() } }) }
