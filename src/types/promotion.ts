/* ─────────────── KPIs ─────────────── */
export type PromotionKPIs = {
  activeCount: number
  upcomingCount: number
  expiredCount: number
  totalUsage: number
  totalDiscountGiven: number
  revenueFromPromo: number
  mostUsedPromo: { name: string; usage_count: number } | null
  couponUsageRate: number
  totalCoupons: number
  usedCoupons: number
}

/* ─────────────── Charts ─────────────── */
export type PromoUsageStat = {
  promotion_id: number
  promo_name: string
  promo_code: string
  discount_type: string
  discount_value: number
  usage_count: number
  total_discount: number
  revenue: number
  status: 'active' | 'expired' | 'upcoming'
}

export type PromoRevenueTrendPoint = {
  month: string
  revenue: number
  discount: number
  transaction_count: number
}

export type CouponStat = {
  promotion_id: number
  promo_name: string
  total_issued: number
  total_used: number
  usage_rate: number
}

/* ─────────────── Table ─────────────── */
export type PromoProductRow = {
  promotion_id: number
  promo_name: string
  promo_code: string
  product_name: string
  category_name: string
  discount_type: string
  discount_value: number
  usage_count: number
  total_discount: number
  revenue: number
  status: string
}

/* ─────────────── Filters ─────────────── */
export type PromotionFilters = {
  from?: Date
  to?: Date
  status?: 'active' | 'expired' | 'upcoming' | ''
  page?: number
  pageSize?: number
}
