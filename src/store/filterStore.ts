import { create } from 'zustand'
import { DEFAULT_DATE_RANGE } from '@/lib/constants'

type FilterState = {
  from: Date | undefined
  to: Date | undefined
  storeId: number | undefined
  cityId: number | undefined
  categoryId: number | undefined
  paymentMethodId: number | undefined
  membershipTierId: number | undefined
}

type FilterActions = {
  setDateRange: (from: Date | undefined, to: Date | undefined) => void
  setStoreId: (id: number | undefined) => void
  setCityId: (id: number | undefined) => void
  setCategoryId: (id: number | undefined) => void
  setPaymentMethodId: (id: number | undefined) => void
  setMembershipTierId: (id: number | undefined) => void
  resetFilters: () => void
}

const initialState: FilterState = {
  from: DEFAULT_DATE_RANGE.from,
  to: DEFAULT_DATE_RANGE.to,
  storeId: undefined,
  cityId: undefined,
  categoryId: undefined,
  paymentMethodId: undefined,
  membershipTierId: undefined,
}

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...initialState,

  setDateRange: (from, to) => set({ from, to }),
  setStoreId: (storeId) => set({ storeId }),
  setCityId: (cityId) => set({ cityId }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
  setMembershipTierId: (membershipTierId) => set({ membershipTierId }),
  resetFilters: () => set(initialState),
}))
