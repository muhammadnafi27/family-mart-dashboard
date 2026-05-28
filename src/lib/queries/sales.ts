import { prisma } from '@/lib/prisma'
import type {
  SalesFilters, SalesKPIs, SalesTrendPoint, HourlyHeatmapPoint,
  StoreSalePoint, CashierStat, CategorySalePoint, SalesOrderRow,
  PaginatedResult, SalesFilterOptions,
} from '@/types/sales'

/* ─────────────── helpers ─────────────── */
function d(date: Date) { return date.toISOString().slice(0, 10) }

function whereClause(f: SalesFilters, alias = 'so') {
  const parts: string[] = []
  if (f.from) parts.push(`${alias}.sale_datetime >= '${d(f.from)}'`)
  if (f.to)   parts.push(`${alias}.sale_datetime <= '${d(f.to)} 23:59:59'`)
  if (f.storeId) parts.push(`${alias}.store_id = ${f.storeId}`)
  if (f.cashierId) parts.push(`${alias}.cashier_id = ${f.cashierId}`)
  if (f.status) parts.push(`${alias}.status = '${f.status}'`)
  if (f.cityId) parts.push(`st.district_id IN (SELECT district_id FROM districts WHERE city_id = ${f.cityId})`)
  if (f.paymentMethodId) parts.push(
    `${alias}.sale_id IN (SELECT sale_id FROM payments WHERE method_id = ${f.paymentMethodId})`
  )
  return parts.length ? `AND ${parts.join(' AND ')}` : ''
}

/* ─────────────── KPIs ─────────────── */
export async function getSalesKPIs(f: SalesFilters = {}): Promise<SalesKPIs> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const [kRow, itemRow, bestStoreRow, bestCashierRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      total_revenue: number; tx_count: bigint; discount: number;
      completed: bigint; cancelled: bigint; pending: bigint;
    }[]>(`
      SELECT
        SUM(so.grand_total)      AS total_revenue,
        COUNT(*)                 AS tx_count,
        SUM(so.discount_total)   AS discount,
        SUM(so.status='completed') AS completed,
        SUM(so.status='cancelled') AS cancelled,
        SUM(so.status='pending')   AS pending
      FROM sales_orders so ${cityJoin}
      WHERE 1=1 ${wc}`),

    prisma.$queryRawUnsafe<{ total_items: number }[]>(`
      SELECT SUM(soi.quantity) AS total_items
      FROM sales_order_items soi
      JOIN sales_orders so ON so.sale_id = soi.sale_id
      ${cityJoin}
      WHERE 1=1 ${wc}`),

    prisma.$queryRawUnsafe<{ store_name: string; rev: number; tx: bigint }[]>(`
      SELECT s.store_name, SUM(so.grand_total) AS rev, COUNT(*) AS tx
      FROM sales_orders so
      JOIN stores s ON s.store_id = so.store_id
      ${cityJoin}
      WHERE 1=1 ${wc} AND so.status = 'completed'
      GROUP BY s.store_id, s.store_name
      ORDER BY rev DESC LIMIT 1`),

    prisma.$queryRawUnsafe<{ full_name: string; rev: number; tx: bigint }[]>(`
      SELECT e.full_name, SUM(so.grand_total) AS rev, COUNT(*) AS tx
      FROM sales_orders so
      JOIN employees e ON e.employee_id = so.cashier_id
      ${cityJoin}
      WHERE 1=1 ${wc} AND so.status = 'completed'
      GROUP BY e.employee_id, e.full_name
      ORDER BY rev DESC LIMIT 1`),
  ])

  const k = kRow[0]
  const totalRevenue = Number(k?.total_revenue ?? 0)
  const totalTransactions = Number(k?.tx_count ?? 0)

  return {
    totalRevenue,
    totalTransactions,
    avgOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
    totalItemsSold: Number(itemRow[0]?.total_items ?? 0),
    totalDiscount: Number(k?.discount ?? 0),
    completedCount: Number(k?.completed ?? 0),
    cancelledCount: Number(k?.cancelled ?? 0),
    pendingCount: Number(k?.pending ?? 0),
    bestStore: bestStoreRow[0]
      ? { name: bestStoreRow[0].store_name, revenue: Number(bestStoreRow[0].rev), transactions: Number(bestStoreRow[0].tx) }
      : null,
    bestCashier: bestCashierRow[0]
      ? { name: bestCashierRow[0].full_name, revenue: Number(bestCashierRow[0].rev), transactions: Number(bestCashierRow[0].tx) }
      : null,
  }
}

/* ─────────────── Trend ─────────────── */
export async function getSalesTrend(f: SalesFilters = {}): Promise<SalesTrendPoint[]> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''
  const dateExpr = f.groupBy === 'month' ? 'DATE_FORMAT(so.sale_datetime,"%Y-%m-01")' : 'DATE(so.sale_datetime)'

  const rows = await prisma.$queryRawUnsafe<{
    date: string; revenue: number; transactions: bigint; avg_order: number; discount: number
  }[]>(`
    SELECT
      ${dateExpr}            AS date,
      SUM(so.grand_total)   AS revenue,
      COUNT(*)              AS transactions,
      AVG(so.grand_total)   AS avg_order,
      SUM(so.discount_total) AS discount
    FROM sales_orders so ${cityJoin}
    WHERE 1=1 ${wc}
    GROUP BY date
    ORDER BY date ASC`)

  return rows.map((r) => ({
    date: String(r.date),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
    avg_order: Number(r.avg_order),
    discount: Number(r.discount),
  }))
}

/* ─────────────── Hourly heatmap ─────────────── */
export async function getHourlyHeatmap(f: SalesFilters = {}): Promise<HourlyHeatmapPoint[]> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const rows = await prisma.$queryRawUnsafe<{
    hour: number; day_of_week: number; transaction_count: bigint; revenue: number
  }[]>(`
    SELECT
      HOUR(so.sale_datetime)                AS hour,
      (DAYOFWEEK(so.sale_datetime) - 1)     AS day_of_week,
      COUNT(*)                              AS transaction_count,
      SUM(so.grand_total)                   AS revenue
    FROM sales_orders so ${cityJoin}
    WHERE so.status = 'completed' ${wc}
    GROUP BY hour, day_of_week
    ORDER BY day_of_week, hour`)

  return rows.map((r) => ({
    hour: Number(r.hour),
    day_of_week: Number(r.day_of_week),
    transaction_count: Number(r.transaction_count),
    revenue: Number(r.revenue),
  }))
}

/* ─────────────── Store sales ─────────────── */
export async function getStoreSales(f: SalesFilters = {}): Promise<StoreSalePoint[]> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const rows = await prisma.$queryRawUnsafe<{
    store_name: string; revenue: number; transactions: bigint; items_sold: number; avg_order: number
  }[]>(`
    SELECT
      s.store_name,
      SUM(so.grand_total)   AS revenue,
      COUNT(so.sale_id)     AS transactions,
      SUM(ia.item_count)    AS items_sold,
      AVG(so.grand_total)   AS avg_order
    FROM sales_orders so
    JOIN stores s ON s.store_id = so.store_id
    ${cityJoin}
    LEFT JOIN (
      SELECT sale_id, SUM(quantity) AS item_count
      FROM sales_order_items GROUP BY sale_id
    ) ia ON ia.sale_id = so.sale_id
    WHERE so.status = 'completed' ${wc}
    GROUP BY s.store_id, s.store_name
    ORDER BY revenue DESC`)

  return rows.map((r) => ({
    store_name: String(r.store_name),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
    items_sold: Number(r.items_sold),
    avg_order: Number(r.avg_order),
  }))
}

/* ─────────────── Cashier leaderboard ─────────────── */
export async function getCashierStats(f: SalesFilters = {}, limit = 10): Promise<CashierStat[]> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const rows = await prisma.$queryRawUnsafe<{
    cashier_id: number; cashier_name: string; store_name: string;
    revenue: number; transactions: bigint; avg_order: number
  }[]>(`
    SELECT
      e.employee_id      AS cashier_id,
      e.full_name        AS cashier_name,
      s.store_name,
      SUM(so.grand_total) AS revenue,
      COUNT(*)            AS transactions,
      AVG(so.grand_total) AS avg_order
    FROM sales_orders so
    JOIN employees e ON e.employee_id = so.cashier_id
    JOIN stores s ON s.store_id = so.store_id
    ${cityJoin}
    WHERE so.status = 'completed' ${wc}
    GROUP BY e.employee_id, e.full_name, s.store_name
    ORDER BY revenue DESC
    LIMIT ${limit}`)

  return rows.map((r) => ({
    cashier_id: Number(r.cashier_id),
    cashier_name: String(r.cashier_name),
    store_name: String(r.store_name),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
    avg_order: Number(r.avg_order),
  }))
}

/* ─────────────── Category sales ─────────────── */
export async function getCategorySales(f: SalesFilters = {}): Promise<CategorySalePoint[]> {
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const rows = await prisma.$queryRawUnsafe<{
    category_name: string; revenue: number; qty_sold: bigint
  }[]>(`
    SELECT pc.category_name, SUM(soi.line_total) AS revenue, SUM(soi.quantity) AS qty_sold
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    JOIN products p ON p.product_id = soi.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    ${cityJoin}
    WHERE so.status = 'completed' ${wc}
    GROUP BY pc.category_id, pc.category_name
    ORDER BY revenue DESC`)

  return rows.map((r) => ({
    category_name: String(r.category_name),
    revenue: Number(r.revenue),
    qty_sold: Number(r.qty_sold),
  }))
}

/* ─────────────── Orders table ─────────────── */
export async function getSalesOrdersTable(
  f: SalesFilters = {}
): Promise<PaginatedResult<SalesOrderRow>> {
  const { page = 1, pageSize = 20, search = '', sortBy = 'sale_datetime', sortDir = 'desc' } = f
  const offset = (page - 1) * pageSize
  const wc = whereClause(f)
  const cityJoin = f.cityId ? 'JOIN stores st ON st.store_id = so.store_id' : ''

  const safeSort = ['sale_datetime', 'grand_total', 'discount_total', 'subtotal'].includes(sortBy)
    ? sortBy
    : 'sale_datetime'
  const safeDir = sortDir === 'asc' ? 'ASC' : 'DESC'

  const searchClause = search
    ? `AND (so.invoice_number LIKE '%${search.replace(/'/g, '')}%'
        OR e.full_name LIKE '%${search.replace(/'/g, '')}%'
        OR c.full_name LIKE '%${search.replace(/'/g, '')}%')`
    : ''

  const base = `
    FROM sales_orders so
    JOIN stores s ON s.store_id = so.store_id
    JOIN employees e ON e.employee_id = so.cashier_id
    LEFT JOIN customers c ON c.customer_id = so.customer_id
    LEFT JOIN (
      SELECT sale_id, pm.method_name
      FROM payments p JOIN payment_methods pm ON pm.method_id = p.method_id
      WHERE p.status = 'success'
      ORDER BY payment_id LIMIT 1
    ) pay ON pay.sale_id = so.sale_id
    LEFT JOIN (SELECT sale_id, SUM(quantity) AS item_count FROM sales_order_items GROUP BY sale_id) ic
      ON ic.sale_id = so.sale_id
    ${cityJoin}
    WHERE 1=1 ${wc} ${searchClause}`

  const [rows, countRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      sale_id: number; invoice_number: string; store_name: string;
      cashier_name: string; customer_name: string | null; payment_method: string | null;
      subtotal: number; discount_total: number; tax_total: number; grand_total: number;
      status: string; sale_datetime: string; item_count: number;
    }[]>(`
      SELECT
        so.sale_id,
        so.invoice_number,
        s.store_name,
        e.full_name         AS cashier_name,
        c.full_name         AS customer_name,
        pay.method_name     AS payment_method,
        so.subtotal,
        so.discount_total,
        so.tax_total,
        so.grand_total,
        so.status,
        so.sale_datetime,
        COALESCE(ic.item_count, 0) AS item_count
      ${base}
      ORDER BY so.${safeSort} ${safeDir}
      LIMIT ${pageSize} OFFSET ${offset}`),

    prisma.$queryRawUnsafe<[{ cnt: bigint }]>(
      `SELECT COUNT(*) AS cnt ${base}`
    ),
  ])

  const total = Number(countRow[0]?.cnt ?? 0)

  const data: SalesOrderRow[] = rows.map((r) => ({
    sale_id: Number(r.sale_id),
    invoice_number: String(r.invoice_number),
    store_name: String(r.store_name),
    cashier_name: String(r.cashier_name),
    customer_name: r.customer_name ? String(r.customer_name) : null,
    payment_method: r.payment_method ? String(r.payment_method) : '-',
    subtotal: Number(r.subtotal),
    discount_total: Number(r.discount_total),
    tax_total: Number(r.tax_total),
    grand_total: Number(r.grand_total),
    status: r.status as SalesOrderRow['status'],
    sale_datetime: String(r.sale_datetime),
    item_count: Number(r.item_count),
  }))

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

/* ─────────────── Filter options ─────────────── */
export async function getSalesFilterOptions(): Promise<SalesFilterOptions> {
  const [stores, cities, cashiers, paymentMethods] = await Promise.all([
    prisma.store.findMany({ select: { store_id: true, store_name: true }, orderBy: { store_name: 'asc' } }),
    prisma.city.findMany({ select: { city_id: true, city_name: true }, orderBy: { city_name: 'asc' } }),
    prisma.$queryRawUnsafe<{ employee_id: number; full_name: string; store_name: string }[]>(`
      SELECT DISTINCT e.employee_id, e.full_name, s.store_name
      FROM sales_orders so
      JOIN employees e ON e.employee_id = so.cashier_id
      JOIN stores s ON s.store_id = so.store_id
      ORDER BY e.full_name ASC`),
    prisma.paymentMethod.findMany({ select: { method_id: true, method_name: true } }),
  ])

  return { stores, cities, cashiers, paymentMethods }
}
