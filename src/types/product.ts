/* ─────────────── KPIs ─────────────── */
export type ProductKPIs = {
  totalProducts: number
  activeProducts: number
  totalCategories: number
  totalBrands: number
  totalUnitsSold: number
  productRevenue: number
  grossProfit: number
  grossMargin: number
  bestSellingProduct: { name: string; qty_sold: number; revenue: number } | null
}

/* ─────────────── Charts ─────────────── */
export type TopProductPoint = {
  product_name: string
  sku: string
  category_name: string
  qty_sold: number
  revenue: number
  gross_profit: number
}

export type CategorySalesPoint = {
  category_name: string
  revenue: number
  qty_sold: number
  gross_profit: number
  product_count: number
}

export type BrandPerformancePoint = {
  brand_name: string
  revenue: number
  qty_sold: number
  gross_profit: number
  product_count: number
}

/* ─────────────── Table ─────────────── */
export type ProductTableRow = {
  product_id: number
  sku: string
  product_name: string
  category_name: string
  subcategory_name: string
  brand_name: string
  unit_abbr: string
  cost_price: number
  retail_price: number
  margin: number
  margin_pct: number
  total_sold: number
  revenue: number
  gross_profit: number
  is_active: boolean
  stock_total: number
  has_promotion: boolean
}

/* ─────────────── Filters ─────────────── */
export type ProductFilters = {
  from?: Date
  to?: Date
  categoryId?: number
  brandId?: number
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  status?: 'active' | 'inactive' | ''
}

export type ProductFilterOptions = {
  categories: { category_id: number; category_name: string }[]
  brands: { brand_id: number; brand_name: string }[]
}

export type PaginatedProducts = {
  data: ProductTableRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
