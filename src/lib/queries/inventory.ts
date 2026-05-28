import { prisma } from '@/lib/prisma'
import type {
  InventoryKPIs, StockByStorePoint, StockByCategoryPoint,
  AdjustmentTrendPoint, LowStockRow, ReorderAlertRow,
  StockMovementRow, InventoryFilters,
} from '@/types/inventory'

function d(date: Date) { return date.toISOString().slice(0, 10) }

/* ─────────────── KPIs ─────────────── */
export async function getInventoryKPIs(f: InventoryFilters = {}): Promise<InventoryKPIs> {
  const { storeId, from, to } = f
  const storeFilter = storeId ? `AND ps.store_id = ${storeId}` : ''

  const [stockRow, adjRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      total_qty: number; total_value: number;
      low_stock: bigint; out_of_stock: bigint;
      below_reorder: bigint; total_products: bigint
    }[]>(`
      SELECT
        SUM(ps.qty_on_hand)                                          AS total_qty,
        SUM(ps.qty_on_hand * p.cost_price)                          AS total_value,
        SUM(ps.qty_on_hand > 0 AND ps.qty_on_hand <= ps.reorder_level) AS low_stock,
        SUM(ps.qty_on_hand = 0)                                     AS out_of_stock,
        SUM(ps.qty_on_hand <= ps.reorder_level)                     AS below_reorder,
        COUNT(DISTINCT p.product_id)                                AS total_products
      FROM product_stock ps
      JOIN products p ON p.product_id = ps.product_id
      WHERE 1=1 ${storeFilter}`),

    prisma.$queryRawUnsafe<{
      total: bigint; positive: bigint; negative: bigint
    }[]>(`
      SELECT
        COUNT(*) AS total,
        SUM(qty_change > 0) AS positive,
        SUM(qty_change < 0) AS negative
      FROM inventory_adjustments ia
      WHERE 1=1
        ${storeId ? `AND ia.store_id = ${storeId}` : ''}
        ${from ? `AND ia.adjustment_date >= '${d(from)}'` : ''}
        ${to   ? `AND ia.adjustment_date <= '${d(to)} 23:59:59'` : ''}`),
  ])

  const s = stockRow[0]
  const a = adjRow[0]
  return {
    totalStockQty: Number(s?.total_qty ?? 0),
    totalStockValue: Number(s?.total_value ?? 0),
    lowStockCount: Number(s?.low_stock ?? 0),
    outOfStockCount: Number(s?.out_of_stock ?? 0),
    belowReorderCount: Number(s?.below_reorder ?? 0),
    totalAdjustments: Number(a?.total ?? 0),
    positiveAdjustments: Number(a?.positive ?? 0),
    negativeAdjustments: Number(a?.negative ?? 0),
    totalProductsTracked: Number(s?.total_products ?? 0),
  }
}

/* ─────────────── Stock by Store ─────────────── */
export async function getStockByStore(f: InventoryFilters = {}): Promise<StockByStorePoint[]> {
  const { categoryId } = f
  const catFilter = categoryId ? `AND p.category_id = ${categoryId}` : ''

  const rows = await prisma.$queryRawUnsafe<{
    store_id: number; store_name: string; total_qty: number; total_value: number;
    low_stock_count: bigint; out_of_stock_count: bigint
  }[]>(`
    SELECT
      s.store_id,
      s.store_name,
      SUM(ps.qty_on_hand)                                          AS total_qty,
      SUM(ps.qty_on_hand * p.cost_price)                          AS total_value,
      SUM(ps.qty_on_hand > 0 AND ps.qty_on_hand <= ps.reorder_level) AS low_stock_count,
      SUM(ps.qty_on_hand = 0)                                     AS out_of_stock_count
    FROM product_stock ps
    JOIN stores s ON s.store_id = ps.store_id
    JOIN products p ON p.product_id = ps.product_id
    WHERE 1=1 ${catFilter}
    GROUP BY s.store_id, s.store_name
    ORDER BY total_value DESC`)

  return rows.map((r) => ({
    store_id: Number(r.store_id),
    store_name: String(r.store_name),
    total_qty: Number(r.total_qty),
    total_value: Number(r.total_value),
    low_stock_count: Number(r.low_stock_count),
    out_of_stock_count: Number(r.out_of_stock_count),
  }))
}

/* ─────────────── Stock by Category ─────────────── */
export async function getStockByCategory(f: InventoryFilters = {}): Promise<StockByCategoryPoint[]> {
  const { storeId } = f
  const storeFilter = storeId ? `AND ps.store_id = ${storeId}` : ''

  const rows = await prisma.$queryRawUnsafe<{
    category_name: string; total_qty: number; total_value: number;
    product_count: bigint; low_stock_count: bigint
  }[]>(`
    SELECT
      pc.category_name,
      SUM(ps.qty_on_hand)                                          AS total_qty,
      SUM(ps.qty_on_hand * p.cost_price)                          AS total_value,
      COUNT(DISTINCT p.product_id)                                AS product_count,
      SUM(ps.qty_on_hand <= ps.reorder_level)                     AS low_stock_count
    FROM product_stock ps
    JOIN products p ON p.product_id = ps.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE 1=1 ${storeFilter}
    GROUP BY pc.category_id, pc.category_name
    ORDER BY total_value DESC`)

  return rows.map((r) => ({
    category_name: String(r.category_name),
    total_qty: Number(r.total_qty),
    total_value: Number(r.total_value),
    product_count: Number(r.product_count),
    low_stock_count: Number(r.low_stock_count),
  }))
}

/* ─────────────── Adjustment Trend ─────────────── */
export async function getAdjustmentTrend(f: InventoryFilters = {}): Promise<AdjustmentTrendPoint[]> {
  const { storeId, from, to } = f

  const rows = await prisma.$queryRawUnsafe<{
    date: string; positive_qty: number; negative_qty: number; net_qty: number; count: bigint
  }[]>(`
    SELECT
      DATE(adjustment_date)       AS date,
      SUM(IF(qty_change > 0, qty_change, 0))  AS positive_qty,
      SUM(IF(qty_change < 0, ABS(qty_change), 0)) AS negative_qty,
      SUM(qty_change)             AS net_qty,
      COUNT(*)                    AS count
    FROM inventory_adjustments ia
    WHERE 1=1
      ${storeId ? `AND ia.store_id = ${storeId}` : ''}
      ${from ? `AND ia.adjustment_date >= '${d(from)}'` : ''}
      ${to   ? `AND ia.adjustment_date <= '${d(to)} 23:59:59'` : ''}
    GROUP BY DATE(adjustment_date)
    ORDER BY date ASC`)

  return rows.map((r) => ({
    date: String(r.date),
    positive_qty: Number(r.positive_qty),
    negative_qty: Number(r.negative_qty),
    net_qty: Number(r.net_qty),
    count: Number(r.count),
  }))
}

/* ─────────────── Low Stock Table ─────────────── */
export async function getLowStockTable(f: InventoryFilters = {}): Promise<LowStockRow[]> {
  const { storeId, categoryId } = f
  const filters: string[] = ['ps.qty_on_hand <= ps.reorder_level']
  if (storeId)   filters.push(`ps.store_id = ${storeId}`)
  if (categoryId) filters.push(`p.category_id = ${categoryId}`)
  const where = `WHERE ${filters.join(' AND ')}`

  const rows = await prisma.$queryRawUnsafe<{
    store_name: string; product_name: string; sku: string; category_name: string;
    supplier_name: string; qty_on_hand: number; reorder_level: number;
    cost_price: number;
  }[]>(`
    SELECT
      s.store_name,
      p.product_name,
      p.sku,
      pc.category_name,
      sup.supplier_name,
      ps.qty_on_hand,
      ps.reorder_level,
      p.cost_price
    FROM product_stock ps
    JOIN stores s ON s.store_id = ps.store_id
    JOIN products p ON p.product_id = ps.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    JOIN suppliers sup ON sup.supplier_id = p.supplier_id
    ${where}
    ORDER BY (ps.qty_on_hand / GREATEST(ps.reorder_level, 1)) ASC, ps.qty_on_hand ASC
    LIMIT 100`)

  return rows.map((r) => {
    const qty = Number(r.qty_on_hand)
    const reorder = Number(r.reorder_level)
    const pct = reorder > 0 ? (qty / reorder) * 100 : 0
    return {
      store_name: String(r.store_name),
      product_name: String(r.product_name),
      sku: String(r.sku),
      category_name: String(r.category_name),
      supplier_name: String(r.supplier_name),
      qty_on_hand: qty,
      reorder_level: reorder,
      stock_pct: pct,
      cost_price: Number(r.cost_price),
      stock_value: qty * Number(r.cost_price),
      urgency: qty === 0 ? 'out' : pct <= 40 ? 'critical' : 'low',
    }
  })
}

/* ─────────────── Reorder Alert ─────────────── */
export async function getReorderAlerts(): Promise<ReorderAlertRow[]> {
  const rows = await prisma.$queryRawUnsafe<{
    product_id: number; product_name: string; sku: string; category_name: string;
    stores_affected: bigint; total_qty: number; avg_reorder: number
  }[]>(`
    SELECT
      p.product_id,
      p.product_name,
      p.sku,
      pc.category_name,
      COUNT(ps.store_id)              AS stores_affected,
      SUM(ps.qty_on_hand)             AS total_qty,
      AVG(ps.reorder_level)           AS avg_reorder
    FROM product_stock ps
    JOIN products p ON p.product_id = ps.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE ps.qty_on_hand <= ps.reorder_level
    GROUP BY p.product_id, p.product_name, p.sku, pc.category_name
    ORDER BY stores_affected DESC, total_qty ASC
    LIMIT 50`)

  return rows.map((r) => ({
    product_id: Number(r.product_id),
    product_name: String(r.product_name),
    sku: String(r.sku),
    category_name: String(r.category_name),
    stores_affected: Number(r.stores_affected),
    total_qty: Number(r.total_qty),
    avg_reorder_level: Math.round(Number(r.avg_reorder)),
    needs_restock: Number(r.total_qty) < Number(r.avg_reorder),
  }))
}

/* ─────────────── Stock Movement ─────────────── */
export async function getStockMovement(f: InventoryFilters = {}): Promise<StockMovementRow[]> {
  const { storeId, from, to, page = 1, pageSize = 30 } = f
  const offset = (page - 1) * pageSize

  const rows = await prisma.$queryRawUnsafe<{
    adjustment_id: number; adjustment_date: string; store_name: string;
    product_name: string; sku: string; qty_change: number;
    reason: string; note: string | null; employee_name: string
  }[]>(`
    SELECT
      ia.adjustment_id,
      ia.adjustment_date,
      s.store_name,
      p.product_name,
      p.sku,
      ia.qty_change,
      ia.reason,
      ia.note,
      e.full_name AS employee_name
    FROM inventory_adjustments ia
    JOIN stores s ON s.store_id = ia.store_id
    JOIN products p ON p.product_id = ia.product_id
    JOIN employees e ON e.employee_id = ia.employee_id
    WHERE 1=1
      ${storeId ? `AND ia.store_id = ${storeId}` : ''}
      ${from ? `AND ia.adjustment_date >= '${d(from)}'` : ''}
      ${to   ? `AND ia.adjustment_date <= '${d(to)} 23:59:59'` : ''}
    ORDER BY ia.adjustment_date DESC
    LIMIT ${pageSize} OFFSET ${offset}`)

  return rows.map((r) => ({
    adjustment_id: Number(r.adjustment_id),
    adjustment_date: String(r.adjustment_date),
    store_name: String(r.store_name),
    product_name: String(r.product_name),
    sku: String(r.sku),
    qty_change: Number(r.qty_change),
    reason: String(r.reason),
    note: r.note ? String(r.note) : null,
    employee_name: String(r.employee_name),
  }))
}
