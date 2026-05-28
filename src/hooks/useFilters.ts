'use client'

import { useFilterStore } from '@/store/filterStore'
import { useFilterOptions } from './useOverview'

export function useFilters() {
  const filters = useFilterStore()
  const { data: options, isLoading } = useFilterOptions()

  return { filters, options, isLoading }
}
