/* ─────────────────── Filter ─────────────────── */
export type SalesGroupBy = 'day' | 'month'
export type SalesStatus = 'completed' | 'cancelled' | 'pending' | ''

export type SalesFilters = {
  from?: Date
  to?: Date
  storeId?: number
  cityId?: number
  cashierId?: number
  paymentMethodId?: number
  status?: SalesStatus
  search?: string
  groupBy?: SalesGroupBy
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

/* ─────────────────── KPIs ─────────────────── */
export type SalesKPIs = {
  totalRevenue: number
  totalTransactions: number
  avgOrderValue: number
  totalItemsSold: number
  totalDiscount: number
  completedCount: number
  cancelledCount: number
  pendingCount: number
  bestStore: BestEntry | null
  bestCashier: BestEntry | null
}

export type BestEntry = {
  name: string
  revenue: number
  transactions: number
}

/* ─────────────────── Chart data ─────────────────── */
export type SalesTrendPoint = {
  date: string
  revenue: number
  transactions: number
  avg_order: number
  discount: number
}

export type HourlyHeatmapPoint = {
  hour: number
  day_of_week: number
  transaction_count: number
  revenue: number
}

export type StoreSalePoint = {
  store_name: string
  revenue: number
  transactions: number
  items_sold: number
  avg_order: number
}

export type CashierStat = {
  cashier_id: number
  cashier_name: string
  store_name: string
  revenue: number
  transactions: number
  avg_order: number
}

export type CategorySalePoint = {
  category_name: string
  revenue: number
  qty_sold: number
}

/* ─────────────────── Table row ─────────────────── */
export type SalesOrderRow = {
  sale_id: number
  invoice_number: string
  store_name: string
  cashier_name: string
  customer_name: string | null
  payment_method: string
  subtotal: number
  discount_total: number
  tax_total: number
  grand_total: number
  status: SalesStatus
  sale_datetime: string
  item_count: number
}

/* ─────────────────── Paginated result ─────────────────── */
export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/* ─────────────────── Filter options ─────────────────── */
export type SalesFilterOptions = {
  stores: { store_id: number; store_name: string }[]
  cities: { city_id: number; city_name: string }[]
  cashiers: { employee_id: number; full_name: string; store_name: string }[]
  paymentMethods: { method_id: number; method_name: string }[]
}
