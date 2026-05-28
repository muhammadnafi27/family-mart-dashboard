/* ─────────────── KPIs ─────────────── */
export type CustomerKPIs = {
  totalCustomers: number
  totalMembers: number
  totalNonMembers: number
  newThisMonth: number
  avgPurchasePerCustomer: number
  topCustomer: { name: string; total_spent: number; order_count: number } | null
}

/* ─────────────── Charts ─────────────── */
export type CustomerGrowthPoint = {
  month: string
  new_customers: number
  cumulative: number
}

export type MembershipTierStat = {
  tier_name: string
  count: number
  total_revenue: number
  avg_order: number
  avg_points: number
}

export type MemberVsNonMember = {
  segment: string
  customer_count: number
  total_revenue: number
  avg_order: number
  order_count: number
}

export type CustomerByCityPoint = {
  city_name: string
  customer_count: number
  total_revenue: number
  avg_spent: number
}

/* ─────────────── Table ─────────────── */
export type TopCustomerRow = {
  customer_id: number
  full_name: string
  gender: string | null
  city_name: string | null
  tier_name: string
  total_spent: number
  order_count: number
  avg_order: number
  last_purchase: string | null
  member_no: string | null
  points: number
}

/* ─────────────── Filters ─────────────── */
export type CustomerFilters = {
  from?: Date
  to?: Date
  storeId?: number
  cityId?: number
  tierId?: number
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
