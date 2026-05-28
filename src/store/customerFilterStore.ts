import { create } from 'zustand'
import type { CustomerFilters } from '@/types/customer'

type S = {
  from: Date | undefined; to: Date | undefined; storeId: number | undefined
  cityId: number | undefined; tierId: number | undefined; search: string
  page: number; pageSize: number; sortBy: string; sortDir: 'asc' | 'desc'
}
type A = {
  setDateRange: (f: Date | undefined, t: Date | undefined) => void
  setStoreId: (id: number | undefined) => void
  setCityId: (id: number | undefined) => void
  setTierId: (id: number | undefined) => void
  setSearch: (s: string) => void
  setPage: (p: number) => void
  setSort: (by: string, dir: 'asc' | 'desc') => void
  reset: () => void
  getFilters: () => CustomerFilters
}

const now = new Date()
const init: S = {
  from: new Date(now.getFullYear(), now.getMonth(), 1), to: now,
  storeId: undefined, cityId: undefined, tierId: undefined,
  search: '', page: 1, pageSize: 20, sortBy: 'total_spent', sortDir: 'desc',
}

export const useCustomerFilterStore = create<S & A>((set, get) => ({
  ...init,
  setDateRange: (from, to) => set({ from, to, page: 1 }),
  setStoreId: (storeId) => set({ storeId }),
  setCityId: (cityId) => set({ cityId, page: 1 }),
  setTierId: (tierId) => set({ tierId, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
  reset: () => set(init),
  getFilters: () => {
    const s = get()
    return { from: s.from, to: s.to, storeId: s.storeId, cityId: s.cityId, tierId: s.tierId,
      search: s.search, page: s.page, pageSize: s.pageSize, sortBy: s.sortBy, sortDir: s.sortDir }
  },
}))
