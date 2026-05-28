import { create } from 'zustand'
import type { SalesFilters, SalesGroupBy, SalesStatus } from '@/types/sales'

type State = {
  from: Date | undefined
  to: Date | undefined
  storeId: number | undefined
  cityId: number | undefined
  cashierId: number | undefined
  paymentMethodId: number | undefined
  status: SalesStatus
  groupBy: SalesGroupBy
  search: string
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
}

type Actions = {
  setDateRange: (from: Date | undefined, to: Date | undefined) => void
  setStoreId: (id: number | undefined) => void
  setCityId: (id: number | undefined) => void
  setCashierId: (id: number | undefined) => void
  setPaymentMethodId: (id: number | undefined) => void
  setStatus: (s: SalesStatus) => void
  setGroupBy: (g: SalesGroupBy) => void
  setSearch: (s: string) => void
  setPage: (p: number) => void
  setSort: (by: string, dir: 'asc' | 'desc') => void
  reset: () => void
}

const now = new Date()
const initial: State = {
  from: new Date(now.getFullYear(), now.getMonth(), 1),
  to: now,
  storeId: undefined,
  cityId: undefined,
  cashierId: undefined,
  paymentMethodId: undefined,
  status: '',
  groupBy: 'day',
  search: '',
  page: 1,
  pageSize: 20,
  sortBy: 'sale_datetime',
  sortDir: 'desc',
}

export const useSalesFilterStore = create<State & Actions>((set) => ({
  ...initial,
  setDateRange: (from, to) => set({ from, to, page: 1 }),
  setStoreId: (storeId) => set({ storeId, page: 1 }),
  setCityId: (cityId) => set({ cityId, page: 1 }),
  setCashierId: (cashierId) => set({ cashierId, page: 1 }),
  setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setSort: (sortBy, sortDir) => set({ sortBy, sortDir }),
  reset: () => set(initial),
}))
