import { create } from 'zustand'
import type { InventoryFilters } from '@/types/inventory'

type State = {
  storeId: number | undefined
  categoryId: number | undefined
  from: Date | undefined
  to: Date | undefined
  page: number
}

type Actions = {
  setStoreId: (id: number | undefined) => void
  setCategoryId: (id: number | undefined) => void
  setDateRange: (from: Date | undefined, to: Date | undefined) => void
  setPage: (p: number) => void
  reset: () => void
  getFilters: () => InventoryFilters
}

const now = new Date()
const initial: State = {
  storeId: undefined,
  categoryId: undefined,
  from: new Date(now.getFullYear(), now.getMonth(), 1),
  to: now,
  page: 1,
}

export const useInventoryFilterStore = create<State & Actions>((set, get) => ({
  ...initial,
  setStoreId: (storeId) => set({ storeId }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setDateRange: (from, to) => set({ from, to }),
  setPage: (page) => set({ page }),
  reset: () => set(initial),
  getFilters: () => {
    const s = get()
    return { storeId: s.storeId, categoryId: s.categoryId, from: s.from, to: s.to, page: s.page }
  },
}))
