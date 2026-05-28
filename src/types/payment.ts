/* ─────────────── KPIs ─────────────── */
export type PaymentKPIs = {
  totalAmount: number
  cashAmount: number
  nonCashAmount: number
  transactionCount: number
  failedCount: number
  avgPaymentAmount: number
  mostUsedMethod: { name: string; count: number; total: number } | null
  successRate: number
}

/* ─────────────── Charts ─────────────── */
export type PaymentMethodStat = {
  method_name: string
  total_amount: number
  transaction_count: number
  percent: number
  is_cash: boolean
}

export type PaymentTrendPoint = {
  date: string
  total_amount: number
  transaction_count: number
  cash_amount: number
  non_cash_amount: number
}

export type PaymentStatusStat = {
  status: string
  count: number
  total_amount: number
  percent: number
}

/* ─────────────── Table ─────────────── */
export type PaymentTransactionRow = {
  payment_id: number
  invoice_number: string
  store_name: string
  method_name: string
  paid_amount: number
  payment_time: string
  reference_no: string | null
  status: string
  customer_name: string | null
}

/* ─────────────── Filters ─────────────── */
export type PaymentFilters = {
  from?: Date
  to?: Date
  storeId?: number
  methodId?: number
  status?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
