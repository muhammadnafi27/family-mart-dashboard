import { create } from 'zustand'
import type { PaymentFilters } from '@/types/payment'

type S = {
  from: Date | undefined; to: Date | undefined; storeId: number | undefined
  methodId: number | undefined; status: string; search: string
  page: number; pageSize: number; sortBy: string; sortDir: 'asc' | 'desc'
}
type A = {
  setDateRange: (f: Date | undefined, t: Date | undefined) => void
  setStoreId: (id: number | undefined) => void
  setMethodId: (id: number | undefined) => void
  setStatus: (s: string) => void
  setSearch: (s: string) => void
  setPage: (p: number) => void
  setSort: (by: string, dir: 'asc' | 'desc') => void
  reset: () => void
  getFilters: () => PaymentFilters
}

const now = new Date()
const init: S = {
  from: new Date(now.getFullYear(), now.getMonth(), 1), to: now,
  storeId: undefined, methodId: undefined, status: '', search: '',
  page: 1, pageSize: 20, sortBy: 'payment_time', sortDir: 'desc',
}

export const usePaymentFilterStore = create<S & A>((set, get) => ({
  ...init,
  setDateRange: (from, to) => set({ from, to, page: 1 }),
  setStoreId: (storeId) => set({ storeId }),
  setMethodId: (methodId) => set({ methodId, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
  reset: () => set(init),
  getFilters: () => {
    const s = get()
    return { from: s.from, to: s.to, storeId: s.storeId, methodId: s.methodId,
      status: s.status, search: s.search, page: s.page, pageSize: s.pageSize,
      sortBy: s.sortBy, sortDir: s.sortDir }
  },
}))
