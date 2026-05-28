/* ─────────────── KPIs ─────────────── */
export type InventoryKPIs = {
  totalStockQty: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
  belowReorderCount: number
  totalAdjustments: number
  positiveAdjustments: number
  negativeAdjustments: number
  totalProductsTracked: number
}

/* ─────────────── Charts ─────────────── */
export type StockByStorePoint = {
  store_id: number
  store_name: string
  total_qty: number
  total_value: number
  low_stock_count: number
  out_of_stock_count: number
}

export type StockByCategoryPoint = {
  category_name: string
  total_qty: number
  total_value: number
  product_count: number
  low_stock_count: number
}

export type AdjustmentTrendPoint = {
  date: string
  positive_qty: number
  negative_qty: number
  net_qty: number
  count: number
}

/* ─────────────── Tables ─────────────── */
export type LowStockRow = {
  store_name: string
  product_name: string
  sku: string
  category_name: string
  supplier_name: string
  qty_on_hand: number
  reorder_level: number
  stock_pct: number
  cost_price: number
  stock_value: number
  urgency: 'out' | 'critical' | 'low'
}

export type ReorderAlertRow = {
  product_id: number
  product_name: string
  sku: string
  category_name: string
  stores_affected: number
  total_qty: number
  avg_reorder_level: number
  needs_restock: boolean
}

export type StockMovementRow = {
  adjustment_id: number
  adjustment_date: string
  store_name: string
  product_name: string
  sku: string
  qty_change: number
  reason: string
  note: string | null
  employee_name: string
}

/* ─────────────── Filters ─────────────── */
export type InventoryFilters = {
  storeId?: number
  categoryId?: number
  from?: Date
  to?: Date
  page?: number
  pageSize?: number
}
