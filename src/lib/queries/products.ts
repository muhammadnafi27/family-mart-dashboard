import { prisma } from '@/lib/prisma'
import type {
  ProductKPIs, TopProductPoint, CategorySalesPoint,
  BrandPerformancePoint, ProductTableRow, ProductFilters,
  ProductFilterOptions, PaginatedProducts,
} from '@/types/product'

function d(date: Date) { return date.toISOString().slice(0, 10) }

function salesWhere(from?: Date, to?: Date, categoryId?: number, brandId?: number, alias = 'so') {
  const parts: string[] = []
  if (from) parts.push(`${alias}.sale_datetime >= '${d(from)}'`)
  if (to)   parts.push(`${alias}.sale_datetime <= '${d(to)} 23:59:59'`)
  return parts.join(' AND ')
}

function productWhere(categoryId?: number, brandId?: number, alias = 'p') {
  const parts: string[] = []
  if (categoryId) parts.push(`${alias}.category_id = ${categoryId}`)
  if (brandId)    parts.push(`${alias}.brand_id = ${brandId}`)
  return parts.length ? `AND ${parts.join(' AND ')}` : ''
}

/* ─────────────── KPIs ─────────────── */
export async function getProductKPIs(f: ProductFilters = {}): Promise<ProductKPIs> {
  const { from, to, categoryId, brandId } = f
  const swc = salesWhere(from, to)
  const pwc = productWhere(categoryId, brandId)

  const [totals, salesRow, bestRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      total: bigint; active: bigint; categories: bigint; brands: bigint
    }[]>(`
      SELECT
        COUNT(*)                                     AS total,
        SUM(is_active = 1)                           AS active,
        COUNT(DISTINCT category_id)                  AS categories,
        COUNT(DISTINCT brand_id)                     AS brands
      FROM products p WHERE 1=1 ${pwc}`),

    prisma.$queryRawUnsafe<{
      total_qty: number; revenue: number; gross_profit: number
    }[]>(`
      SELECT
        SUM(soi.quantity)                                   AS total_qty,
        SUM(soi.line_total)                                 AS revenue,
        SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      JOIN products p ON p.product_id = soi.product_id
      WHERE so.status = 'completed'
        ${swc ? `AND ${swc}` : ''} ${pwc}`),

    prisma.$queryRawUnsafe<{
      product_name: string; qty_sold: number; revenue: number
    }[]>(`
      SELECT p.product_name, SUM(soi.quantity) AS qty_sold, SUM(soi.line_total) AS revenue
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      JOIN products p ON p.product_id = soi.product_id
      WHERE so.status = 'completed'
        ${swc ? `AND ${swc}` : ''} ${pwc}
      GROUP BY p.product_id, p.product_name
      ORDER BY qty_sold DESC LIMIT 1`),
  ])

  const t = totals[0]
  const s = salesRow[0]
  const revenue = Number(s?.revenue ?? 0)
  const grossProfit = Number(s?.gross_profit ?? 0)

  return {
    totalProducts: Number(t?.total ?? 0),
    activeProducts: Number(t?.active ?? 0),
    totalCategories: Number(t?.categories ?? 0),
    totalBrands: Number(t?.brands ?? 0),
    totalUnitsSold: Number(s?.total_qty ?? 0),
    productRevenue: revenue,
    grossProfit,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    bestSellingProduct: bestRow[0]
      ? { name: bestRow[0].product_name, qty_sold: Number(bestRow[0].qty_sold), revenue: Number(bestRow[0].revenue) }
      : null,
  }
}

/* ─────────────── Top Products ─────────────── */
export async function getTopProducts(f: ProductFilters = {}, limit = 10): Promise<TopProductPoint[]> {
  const { from, to, categoryId, brandId } = f
  const swc = salesWhere(from, to)
  const pwc = productWhere(categoryId, brandId)

  const rows = await prisma.$queryRawUnsafe<{
    product_name: string; sku: string; category_name: string;
    qty_sold: number; revenue: number; gross_profit: number
  }[]>(`
    SELECT
      p.product_name,
      p.sku,
      pc.category_name,
      SUM(soi.quantity)                                   AS qty_sold,
      SUM(soi.line_total)                                 AS revenue,
      SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    JOIN products p ON p.product_id = soi.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE so.status = 'completed'
      ${swc ? `AND ${swc}` : ''} ${pwc}
    GROUP BY p.product_id, p.product_name, p.sku, pc.category_name
    ORDER BY qty_sold DESC
    LIMIT ${limit}`)

  return rows.map((r) => ({
    product_name: String(r.product_name),
    sku: String(r.sku),
    category_name: String(r.category_name),
    qty_sold: Number(r.qty_sold),
    revenue: Number(r.revenue),
    gross_profit: Number(r.gross_profit),
  }))
}

/* ─────────────── Category Sales ─────────────── */
export async function getCategorySales(f: ProductFilters = {}): Promise<CategorySalesPoint[]> {
  const { from, to } = f
  const swc = salesWhere(from, to)

  const rows = await prisma.$queryRawUnsafe<{
    category_name: string; revenue: number; qty_sold: number;
    gross_profit: number; product_count: bigint
  }[]>(`
    SELECT
      pc.category_name,
      SUM(soi.line_total)                                 AS revenue,
      SUM(soi.quantity)                                   AS qty_sold,
      SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit,
      COUNT(DISTINCT p.product_id)                        AS product_count
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    JOIN products p ON p.product_id = soi.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE so.status = 'completed' ${swc ? `AND ${swc}` : ''}
    GROUP BY pc.category_id, pc.category_name
    ORDER BY revenue DESC`)

  return rows.map((r) => ({
    category_name: String(r.category_name),
    revenue: Number(r.revenue),
    qty_sold: Number(r.qty_sold),
    gross_profit: Number(r.gross_profit),
    product_count: Number(r.product_count),
  }))
}

/* ─────────────── Brand Performance ─────────────── */
export async function getBrandPerformance(f: ProductFilters = {}): Promise<BrandPerformancePoint[]> {
  const { from, to, categoryId } = f
  const swc = salesWhere(from, to)
  const catFilter = categoryId ? `AND p.category_id = ${categoryId}` : ''

  const rows = await prisma.$queryRawUnsafe<{
    brand_name: string; revenue: number; qty_sold: number;
    gross_profit: number; product_count: bigint
  }[]>(`
    SELECT
      b.brand_name,
      SUM(soi.line_total)                                 AS revenue,
      SUM(soi.quantity)                                   AS qty_sold,
      SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit,
      COUNT(DISTINCT p.product_id)                        AS product_count
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    JOIN products p ON p.product_id = soi.product_id
    JOIN brands b ON b.brand_id = p.brand_id
    WHERE so.status = 'completed' ${swc ? `AND ${swc}` : ''} ${catFilter}
    GROUP BY b.brand_id, b.brand_name
    ORDER BY revenue DESC
    LIMIT 20`)

  return rows.map((r) => ({
    brand_name: String(r.brand_name),
    revenue: Number(r.revenue),
    qty_sold: Number(r.qty_sold),
    gross_profit: Number(r.gross_profit),
    product_count: Number(r.product_count),
  }))
}

/* ─────────────── Product Table ─────────────── */
export async function getProductTable(f: ProductFilters = {}): Promise<PaginatedProducts> {
  const { from, to, categoryId, brandId, search = '', page = 1, pageSize = 25,
    sortBy = 'revenue', sortDir = 'desc', status } = f
  const offset = (page - 1) * pageSize
  const swc = salesWhere(from, to)

  const safe = ['revenue', 'qty_sold', 'gross_profit', 'margin_pct', 'cost_price', 'retail_price', 'product_name', 'stock_total'].includes(sortBy || '')
    ? sortBy! : 'revenue'
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC'

  const filters: string[] = []
  if (categoryId) filters.push(`p.category_id = ${categoryId}`)
  if (brandId)    filters.push(`p.brand_id = ${brandId}`)
  if (status === 'active')   filters.push('p.is_active = 1')
  if (status === 'inactive') filters.push('p.is_active = 0')
  if (search) filters.push(`(p.product_name LIKE '%${search.replace(/'/g, '')}%' OR p.sku LIKE '%${search.replace(/'/g, '')}%')`)
  const filterClause = filters.length ? `AND ${filters.join(' AND ')}` : ''

  const base = `
    FROM products p
    JOIN product_categories pc ON pc.category_id = p.category_id
    JOIN product_subcategories psc ON psc.subcategory_id = p.subcategory_id
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN units u ON u.unit_id = p.unit_id
    LEFT JOIN (
      SELECT soi.product_id,
        SUM(soi.quantity) AS qty_sold,
        SUM(soi.line_total) AS revenue,
        SUM((soi.unit_price - p2.cost_price) * soi.quantity) AS gross_profit
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      JOIN products p2 ON p2.product_id = soi.product_id
      WHERE so.status = 'completed' ${swc ? `AND ${swc}` : ''}
      GROUP BY soi.product_id
    ) sales ON sales.product_id = p.product_id
    LEFT JOIN (
      SELECT product_id, SUM(qty_on_hand) AS total_stock
      FROM product_stock GROUP BY product_id
    ) stk ON stk.product_id = p.product_id
    LEFT JOIN (
      SELECT DISTINCT product_id FROM promotion_products
    ) promo ON promo.product_id = p.product_id
    WHERE 1=1 ${filterClause}`

  const [rows, countRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      product_id: number; sku: string; product_name: string; category_name: string;
      subcategory_name: string; brand_name: string; unit_abbr: string;
      cost_price: number; retail_price: number; qty_sold: number; revenue: number;
      gross_profit: number; is_active: number; stock_total: number; has_promotion: number
    }[]>(`
      SELECT
        p.product_id, p.sku, p.product_name,
        pc.category_name, psc.subcategory_name,
        b.brand_name, u.abbreviation AS unit_abbr,
        p.cost_price, p.retail_price,
        COALESCE(sales.qty_sold, 0)     AS qty_sold,
        COALESCE(sales.revenue, 0)      AS revenue,
        COALESCE(sales.gross_profit, 0) AS gross_profit,
        p.is_active,
        COALESCE(stk.total_stock, 0)    AS stock_total,
        IF(promo.product_id IS NOT NULL, 1, 0) AS has_promotion
      ${base}
      ORDER BY ${safe} ${dir}
      LIMIT ${pageSize} OFFSET ${offset}`),

    prisma.$queryRawUnsafe<[{ cnt: bigint }]>(
      `SELECT COUNT(*) AS cnt ${base}`
    ),
  ])

  const total = Number(countRow[0]?.cnt ?? 0)
  const data: ProductTableRow[] = rows.map((r) => {
    const cost = Number(r.cost_price)
    const retail = Number(r.retail_price)
    const margin = retail - cost
    const marginPct = retail > 0 ? (margin / retail) * 100 : 0
    return {
      product_id: Number(r.product_id),
      sku: String(r.sku),
      product_name: String(r.product_name),
      category_name: String(r.category_name),
      subcategory_name: String(r.subcategory_name),
      brand_name: String(r.brand_name),
      unit_abbr: String(r.unit_abbr),
      cost_price: cost,
      retail_price: retail,
      margin,
      margin_pct: marginPct,
      total_sold: Number(r.qty_sold),
      revenue: Number(r.revenue),
      gross_profit: Number(r.gross_profit),
      is_active: Number(r.is_active) === 1,
      stock_total: Number(r.stock_total),
      has_promotion: Number(r.has_promotion) === 1,
    }
  })

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/* ─────────────── Filter options ─────────────── */
export async function getProductFilterOptions(): Promise<ProductFilterOptions> {
  const [categories, brands] = await Promise.all([
    prisma.productCategory.findMany({
      select: { category_id: true, category_name: true },
      orderBy: { category_name: 'asc' },
    }),
    prisma.brand.findMany({
      select: { brand_id: true, brand_name: true },
      orderBy: { brand_name: 'asc' },
    }),
  ])
  return { categories, brands }
}
