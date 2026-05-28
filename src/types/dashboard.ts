export type OverviewKPIs = {
  totalRevenue: number
  netSales: number
  totalTransactions: number
  avgOrderValue: number
  totalDiscount: number
  totalTax: number
  totalRefund: number
  totalExpense: number
  lowStockCount: number
  totalCustomers: number
}

export type RevenueTrendPoint = {
  date: string
  revenue: number
  transactions: number
}

export type StorePerformance = {
  store_id: number
  store_name: string
  revenue: number
  transactions: number
}

export type TopProduct = {
  product_id: number
  product_name: string
  qty_sold: number
  revenue: number
}

export type PaymentMethodStat = {
  method_name: string
  total: number
  count: number
}

export type FilterState = {
  from: Date | undefined
  to: Date | undefined
  storeId: number | undefined
  cityId: number | undefined
  categoryId: number | undefined
  paymentMethodId: number | undefined
  membershipTierId: number | undefined
}

export type FilterOption = {
  value: string
  label: string
}
