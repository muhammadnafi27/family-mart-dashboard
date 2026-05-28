import { create } from 'zustand'
import type { PromotionFilters } from '@/types/promotion'

type S = {
  from: Date | undefined; to: Date | undefined
  status: 'active' | 'expired' | 'upcoming' | ''
  page: number; pageSize: number
}
type A = {
  setDateRange: (f: Date | undefined, t: Date | undefined) => void
  setStatus: (s: S['status']) => void
  setPage: (p: number) => void
  reset: () => void
  getFilters: () => PromotionFilters
}

const now = new Date()
const init: S = {
  from: new Date(now.getFullYear(), now.getMonth(), 1), to: now,
  status: '', page: 1, pageSize: 25,
}

export const usePromotionFilterStore = create<S & A>((set, get) => ({
  ...init,
  setDateRange: (from, to) => set({ from, to, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set(init),
  getFilters: () => {
    const s = get()
    return { from: s.from, to: s.to, status: s.status, page: s.page, pageSize: s.pageSize }
  },
}))
