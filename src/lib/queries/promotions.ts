import { prisma } from '@/lib/prisma'
import type {
  PromotionKPIs, PromoUsageStat, PromoRevenueTrendPoint,
  CouponStat, PromoProductRow, PromotionFilters,
} from '@/types/promotion'

function d(date: Date) { return date.toISOString().slice(0, 10) }
const today = () => new Date().toISOString().slice(0, 10)

function promoStatus(start: string, end: string): 'active' | 'expired' | 'upcoming' {
  const t = today()
  if (end < t) return 'expired'
  if (start > t) return 'upcoming'
  return 'active'
}

/* ─── KPIs ─── */
export async function getPromotionKPIs(f: PromotionFilters = {}): Promise<PromotionKPIs> {
  const t = today()

  const [statusCounts, usageRow, couponRow, mostUsedRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      active: bigint; upcoming: bigint; expired: bigint
    }[]>(`
      SELECT
        SUM(start_date <= '${t}' AND end_date >= '${t}') AS active,
        SUM(start_date > '${t}')                          AS upcoming,
        SUM(end_date < '${t}')                            AS expired
      FROM promotions`),

    prisma.$queryRawUnsafe<{ total_usage: bigint; total_discount: number; revenue: number }[]>(`
      SELECT
        COUNT(soi.sale_item_id)      AS total_usage,
        SUM(soi.discount_amount)     AS total_discount,
        SUM(soi.line_total)          AS revenue
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      JOIN promotions pr ON pr.promotion_id = soi.promo_id
      WHERE so.status = 'Paid'
        ${f.from ? `AND so.sale_datetime >= '${d(f.from)}'` : ''}
        ${f.to   ? `AND so.sale_datetime <= '${d(f.to)} 23:59:59'` : ''}`),

    prisma.$queryRawUnsafe<{ total_issued: bigint; total_used: bigint }[]>(`
      SELECT COUNT(*) AS total_issued, SUM(is_used) AS total_used FROM coupons`),

    prisma.$queryRawUnsafe<{ promo_name: string; usage_count: bigint }[]>(`
      SELECT pr.promo_name, COUNT(soi.sale_item_id) AS usage_count
      FROM sales_order_items soi
      JOIN promotions pr ON pr.promotion_id = soi.promo_id
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      WHERE so.status = 'Paid'
      GROUP BY pr.promotion_id, pr.promo_name
      ORDER BY usage_count DESC LIMIT 1`),
  ])

  const s = statusCounts[0]
  const u = usageRow[0]
  const cp = couponRow[0]
  const totalIssued = Number(cp?.total_issued ?? 0)
  const totalUsed = Number(cp?.total_used ?? 0)

  return {
    activeCount: Number(s?.active ?? 0),
    upcomingCount: Number(s?.upcoming ?? 0),
    expiredCount: Number(s?.expired ?? 0),
    totalUsage: Number(u?.total_usage ?? 0),
    totalDiscountGiven: Number(u?.total_discount ?? 0),
    revenueFromPromo: Number(u?.revenue ?? 0),
    mostUsedPromo: mostUsedRow[0]
      ? { name: mostUsedRow[0].promo_name, usage_count: Number(mostUsedRow[0].usage_count) }
      : null,
    couponUsageRate: totalIssued > 0 ? (totalUsed / totalIssued) * 100 : 0,
    totalCoupons: totalIssued,
    usedCoupons: totalUsed,
  }
}

/* ─── Promo Usage Stats ─── */
export async function getPromoUsageStats(f: PromotionFilters = {}): Promise<PromoUsageStat[]> {
  const t = today()
  const rows = await prisma.$queryRawUnsafe<{
    promotion_id: number; promo_name: string; promo_code: string;
    discount_type: string; discount_value: number;
    start_date: string; end_date: string;
    usage_count: bigint; total_discount: number; revenue: number
  }[]>(`
    SELECT
      pr.promotion_id, pr.promo_name, pr.promo_code,
      pr.discount_type, pr.discount_value,
      pr.start_date, pr.end_date,
      COUNT(soi.sale_item_id)  AS usage_count,
      SUM(soi.discount_amount) AS total_discount,
      SUM(soi.line_total)      AS revenue
    FROM promotions pr
    LEFT JOIN sales_order_items soi ON soi.promo_id = pr.promotion_id
    LEFT JOIN sales_orders so ON so.sale_id = soi.sale_id
      AND so.status = 'Paid'
      ${f.from ? `AND so.sale_datetime >= '${d(f.from)}'` : ''}
      ${f.to   ? `AND so.sale_datetime <= '${d(f.to)} 23:59:59'` : ''}
    WHERE 1=1
      ${f.status === 'active'   ? `AND pr.start_date <= '${t}' AND pr.end_date >= '${t}'` : ''}
      ${f.status === 'expired'  ? `AND pr.end_date < '${t}'` : ''}
      ${f.status === 'upcoming' ? `AND pr.start_date > '${t}'` : ''}
    GROUP BY pr.promotion_id, pr.promo_name, pr.promo_code, pr.discount_type, pr.discount_value, pr.start_date, pr.end_date
    ORDER BY usage_count DESC`)

  return rows.map((r) => ({
    promotion_id: Number(r.promotion_id),
    promo_name: String(r.promo_name),
    promo_code: String(r.promo_code),
    discount_type: String(r.discount_type),
    discount_value: Number(r.discount_value),
    usage_count: Number(r.usage_count),
    total_discount: Number(r.total_discount),
    revenue: Number(r.revenue),
    status: promoStatus(String(r.start_date).slice(0, 10), String(r.end_date).slice(0, 10)),
  }))
}

/* ─── Promo Revenue Trend ─── */
export async function getPromoRevenueTrend(f: PromotionFilters = {}): Promise<PromoRevenueTrendPoint[]> {
  const rows = await prisma.$queryRawUnsafe<{
    month: string; revenue: number; discount: number; transaction_count: bigint
  }[]>(`
    SELECT
      DATE_FORMAT(so.sale_datetime,'%Y-%m-01') AS month,
      SUM(soi.line_total)                       AS revenue,
      SUM(soi.discount_amount)                  AS discount,
      COUNT(DISTINCT so.sale_id)                AS transaction_count
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    WHERE soi.promo_id IS NOT NULL AND so.status = 'Paid'
      ${f.from ? `AND so.sale_datetime >= '${d(f.from)}'` : ''}
      ${f.to   ? `AND so.sale_datetime <= '${d(f.to)} 23:59:59'` : ''}
    GROUP BY month ORDER BY month ASC`)

  return rows.map((r) => ({
    month: String(r.month),
    revenue: Number(r.revenue),
    discount: Number(r.discount),
    transaction_count: Number(r.transaction_count),
  }))
}

/* ─── Coupon Stats ─── */
export async function getCouponStats(): Promise<CouponStat[]> {
  const rows = await prisma.$queryRawUnsafe<{
    promotion_id: number; promo_name: string;
    total_issued: bigint; total_used: bigint
  }[]>(`
    SELECT
      pr.promotion_id, pr.promo_name,
      COUNT(co.coupon_id) AS total_issued,
      SUM(co.is_used)     AS total_used
    FROM promotions pr
    LEFT JOIN coupons co ON co.promotion_id = pr.promotion_id
    GROUP BY pr.promotion_id, pr.promo_name
    HAVING total_issued > 0
    ORDER BY total_issued DESC`)

  return rows.map((r) => {
    const issued = Number(r.total_issued)
    const used = Number(r.total_used)
    return {
      promotion_id: Number(r.promotion_id),
      promo_name: String(r.promo_name),
      total_issued: issued,
      total_used: used,
      usage_rate: issued > 0 ? (used / issued) * 100 : 0,
    }
  })
}

/* ─── Promo Product Table ─── */
export async function getPromoProductTable(f: PromotionFilters = {}): Promise<{
  data: PromoProductRow[]; total: number; page: number; pageSize: number; totalPages: number
}> {
  const { page = 1, pageSize = 25 } = f
  const offset = (page - 1) * pageSize
  const t = today()

  const statusCond = f.status === 'active'   ? `AND pr.start_date <= '${t}' AND pr.end_date >= '${t}'`
    : f.status === 'expired'  ? `AND pr.end_date < '${t}'`
    : f.status === 'upcoming' ? `AND pr.start_date > '${t}'`
    : ''

  const base = `
    FROM promotion_products pp
    JOIN promotions pr ON pr.promotion_id = pp.promotion_id
    JOIN products p ON p.product_id = pp.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    LEFT JOIN (
      SELECT soi.product_id, soi.promo_id,
        COUNT(*) AS usage_count,
        SUM(soi.discount_amount) AS total_discount,
        SUM(soi.line_total) AS revenue
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      WHERE so.status = 'Paid'
        ${f.from ? `AND so.sale_datetime >= '${d(f.from)}'` : ''}
        ${f.to   ? `AND so.sale_datetime <= '${d(f.to)} 23:59:59'` : ''}
      GROUP BY soi.product_id, soi.promo_id
    ) stats ON stats.product_id = p.product_id AND stats.promo_id = pr.promotion_id
    WHERE 1=1 ${statusCond}`

  const [rows, countRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      promotion_id: number; promo_name: string; promo_code: string;
      product_name: string; category_name: string; discount_type: string;
      discount_value: number; usage_count: bigint; total_discount: number;
      revenue: number; start_date: string; end_date: string
    }[]>(`
      SELECT
        pr.promotion_id, pr.promo_name, pr.promo_code,
        p.product_name, pc.category_name,
        pr.discount_type, pr.discount_value,
        COALESCE(stats.usage_count,0)   AS usage_count,
        COALESCE(stats.total_discount,0) AS total_discount,
        COALESCE(stats.revenue,0)       AS revenue,
        pr.start_date, pr.end_date
      ${base}
      ORDER BY usage_count DESC
      LIMIT ${pageSize} OFFSET ${offset}`),
    prisma.$queryRawUnsafe<[{ cnt: bigint }]>(`SELECT COUNT(*) AS cnt ${base}`),
  ])

  const total = Number(countRow[0]?.cnt ?? 0)
  const data: PromoProductRow[] = rows.map((r) => ({
    promotion_id: Number(r.promotion_id),
    promo_name: String(r.promo_name),
    promo_code: String(r.promo_code),
    product_name: String(r.product_name),
    category_name: String(r.category_name),
    discount_type: String(r.discount_type),
    discount_value: Number(r.discount_value),
    usage_count: Number(r.usage_count),
    total_discount: Number(r.total_discount),
    revenue: Number(r.revenue),
    status: promoStatus(String(r.start_date).slice(0, 10), String(r.end_date).slice(0, 10)),
  }))

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
