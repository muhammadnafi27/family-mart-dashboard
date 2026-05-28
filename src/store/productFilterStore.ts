import { create } from 'zustand'
import type { ProductFilters } from '@/types/product'

type State = {
  from: Date | undefined
  to: Date | undefined
  categoryId: number | undefined
  brandId: number | undefined
  search: string
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  status: 'active' | 'inactive' | ''
}

type Actions = {
  setDateRange: (from: Date | undefined, to: Date | undefined) => void
  setCategoryId: (id: number | undefined) => void
  setBrandId: (id: number | undefined) => void
  setSearch: (s: string) => void
  setPage: (p: number) => void
  setSort: (by: string, dir: 'asc' | 'desc') => void
  setStatus: (s: State['status']) => void
  reset: () => void
  getFilters: () => ProductFilters
}

const now = new Date()
const initial: State = {
  from: new Date(now.getFullYear(), now.getMonth(), 1),
  to: now,
  categoryId: undefined,
  brandId: undefined,
  search: '',
  page: 1,
  pageSize: 25,
  sortBy: 'revenue',
  sortDir: 'desc',
  status: '',
}

export const useProductFilterStore = create<State & Actions>((set, get) => ({
  ...initial,
  setDateRange: (from, to) => set({ from, to, page: 1 }),
  setCategoryId: (categoryId) => set({ categoryId, page: 1 }),
  setBrandId: (brandId) => set({ brandId, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
  setStatus: (status) => set({ status, page: 1 }),
  reset: () => set(initial),
  getFilters: () => {
    const s = get()
    return {
      from: s.from, to: s.to, categoryId: s.categoryId,
      brandId: s.brandId, search: s.search, page: s.page,
      pageSize: s.pageSize, sortBy: s.sortBy, sortDir: s.sortDir, status: s.status,
    }
  },
}))
