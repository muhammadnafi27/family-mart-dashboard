import { prisma } from '@/lib/prisma'

export type OverviewFilters = {
  from?: Date
  to?: Date
  storeId?: number
  cityId?: number
}

function dateSql(d: Date, endOfDay = false): string {
  const s = d.toISOString().slice(0, 10)
  return endOfDay ? `${s} 23:59:59` : s
}

export async function getOverviewKPIs(filters: OverviewFilters = {}) {
  const { from, to, storeId, cityId } = filters

  const dateClause = [
    from ? `AND so.sale_datetime >= '${dateSql(from)}'` : '',
    to ? `AND so.sale_datetime <= '${dateSql(to, true)}'` : '',
    storeId ? `AND so.store_id = ${storeId}` : '',
  ].join(' ')

  const dateClauseBase = [
    from ? `AND sale_datetime >= '${dateSql(from)}'` : '',
    to ? `AND sale_datetime <= '${dateSql(to, true)}'` : '',
    storeId ? `AND store_id = ${storeId}` : '',
  ].join(' ')

  const [salesRows, refundRows, expenseRows, itemsRows, grossRows, lowStock, totalCustomers] =
    await Promise.all([
      prisma.$queryRawUnsafe<
        { total_revenue: number; subtotal: number; discount_total: number; tax_total: number; tx_count: number }[]
      >(`SELECT
          SUM(grand_total) AS total_revenue,
          SUM(subtotal) AS subtotal,
          SUM(discount_total) AS discount_total,
          SUM(tax_total) AS tax_total,
          COUNT(*) AS tx_count
        FROM sales_orders
        WHERE status = 'completed' ${dateClauseBase}`),

      prisma.$queryRawUnsafe<{ total_refund: number; refund_count: number }[]>(
        `SELECT SUM(refund_amount) AS total_refund, COUNT(*) AS refund_count
         FROM returns
         WHERE status = 'approved'
           ${from ? `AND return_date >= '${dateSql(from)}'` : ''}
           ${to ? `AND return_date <= '${dateSql(to, true)}'` : ''}`
      ),

      prisma.$queryRawUnsafe<{ total_expense: number }[]>(
        `SELECT SUM(amount) AS total_expense
         FROM expenses
         WHERE 1=1
           ${from ? `AND expense_date >= '${dateSql(from)}'` : ''}
           ${to ? `AND expense_date <= '${dateSql(to, true)}'` : ''}
           ${storeId ? `AND store_id = ${storeId}` : ''}`
      ),

      prisma.$queryRawUnsafe<{ total_items: number }[]>(
        `SELECT SUM(soi.quantity) AS total_items
         FROM sales_order_items soi
         JOIN sales_orders so ON so.sale_id = soi.sale_id
         WHERE so.status = 'completed' ${dateClause}`
      ),

      prisma.$queryRawUnsafe<{ gross_profit: number }[]>(
        `SELECT SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit
         FROM sales_order_items soi
         JOIN sales_orders so ON so.sale_id = soi.sale_id
         JOIN products p ON p.product_id = soi.product_id
         WHERE so.status = 'completed' ${dateClause}`
      ),

      prisma.$queryRawUnsafe<[{ count: bigint }]>(
        'SELECT COUNT(*) AS count FROM product_stock WHERE qty_on_hand <= reorder_level'
      ).then((r) => Number(r[0]?.count ?? 0)),

      prisma.customer.count(),
    ])

  const s = salesRows[0]
  const totalRevenue = Number(s?.total_revenue ?? 0)
  const subtotal = Number(s?.subtotal ?? 0)
  const totalDiscount = Number(s?.discount_total ?? 0)
  const totalTax = Number(s?.tax_total ?? 0)
  const totalTransactions = Number(s?.tx_count ?? 0)
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  const netSales = subtotal - totalDiscount
  const totalRefund = Number(refundRows[0]?.total_refund ?? 0)
  const refundCount = Number(refundRows[0]?.refund_count ?? 0)
  const totalExpense = Number(expenseRows[0]?.total_expense ?? 0)
  const totalItemsSold = Number(itemsRows[0]?.total_items ?? 0)
  const grossProfit = Number(grossRows[0]?.gross_profit ?? 0)
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  return {
    totalRevenue,
    netSales,
    totalTransactions,
    avgOrderValue,
    totalDiscount,
    totalTax,
    totalRefund,
    refundCount,
    totalExpense,
    totalItemsSold,
    grossProfit,
    grossMargin,
    lowStockCount: lowStock,
    totalCustomers,
  }
}

export async function getRevenueTrend(filters: OverviewFilters = {}) {
  const { from, to, storeId } = filters

  const rows = await prisma.$queryRawUnsafe<
    { date: string; revenue: number; transactions: number; avg_order: number }[]
  >(
    `SELECT
      DATE(sale_datetime) AS date,
      SUM(grand_total) AS revenue,
      COUNT(*) AS transactions,
      AVG(grand_total) AS avg_order
    FROM sales_orders
    WHERE status = 'completed'
      ${from ? `AND sale_datetime >= '${dateSql(from)}'` : ''}
      ${to ? `AND sale_datetime <= '${dateSql(to, true)}'` : ''}
      ${storeId ? `AND store_id = ${storeId}` : ''}
    GROUP BY DATE(sale_datetime)
    ORDER BY date ASC`
  )

  return rows.map((r) => ({
    date: String(r.date),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
    avg_order: Number(r.avg_order),
  }))
}

export async function getStorePerformance(filters: OverviewFilters = {}) {
  const { from, to } = filters

  const rows = await prisma.$queryRawUnsafe<
    { store_name: string; revenue: number; transactions: number; items_sold: number }[]
  >(
    `SELECT
      s.store_name,
      SUM(so.grand_total) AS revenue,
      COUNT(so.sale_id) AS transactions,
      SUM(soi_agg.item_count) AS items_sold
    FROM sales_orders so
    JOIN stores s ON s.store_id = so.store_id
    LEFT JOIN (
      SELECT sale_id, SUM(quantity) AS item_count FROM sales_order_items GROUP BY sale_id
    ) soi_agg ON soi_agg.sale_id = so.sale_id
    WHERE so.status = 'completed'
      ${from ? `AND so.sale_datetime >= '${dateSql(from)}'` : ''}
      ${to ? `AND so.sale_datetime <= '${dateSql(to, true)}'` : ''}
    GROUP BY s.store_id, s.store_name
    ORDER BY revenue DESC
    LIMIT 12`
  )

  return rows.map((r) => ({
    store_name: String(r.store_name),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
    items_sold: Number(r.items_sold),
  }))
}

export async function getTopProducts(filters: OverviewFilters = {}) {
  const { from, to, storeId } = filters

  const rows = await prisma.$queryRawUnsafe<
    { product_name: string; category_name: string; qty_sold: number; revenue: number; gross_profit: number }[]
  >(
    `SELECT
      p.product_name,
      pc.category_name,
      SUM(soi.quantity) AS qty_sold,
      SUM(soi.line_total) AS revenue,
      SUM((soi.unit_price - p.cost_price) * soi.quantity) AS gross_profit
    FROM sales_order_items soi
    JOIN sales_orders so ON so.sale_id = soi.sale_id
    JOIN products p ON p.product_id = soi.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE so.status = 'completed'
      ${from ? `AND so.sale_datetime >= '${dateSql(from)}'` : ''}
      ${to ? `AND so.sale_datetime <= '${dateSql(to, true)}'` : ''}
      ${storeId ? `AND so.store_id = ${storeId}` : ''}
    GROUP BY p.product_id, p.product_name, pc.category_name
    ORDER BY qty_sold DESC
    LIMIT 10`
  )

  return rows.map((r) => ({
    product_name: String(r.product_name),
    category_name: String(r.category_name),
    qty_sold: Number(r.qty_sold),
    revenue: Number(r.revenue),
    gross_profit: Number(r.gross_profit),
  }))
}

export async function getPaymentMethodDistribution(filters: OverviewFilters = {}) {
  const { from, to } = filters

  const rows = await prisma.$queryRawUnsafe<
    { method_name: string; total: number; count: number }[]
  >(
    `SELECT
      pm.method_name,
      SUM(p.paid_amount) AS total,
      COUNT(p.payment_id) AS count
    FROM payments p
    JOIN payment_methods pm ON pm.method_id = p.method_id
    JOIN sales_orders so ON so.sale_id = p.sale_id
    WHERE p.status = 'success' AND so.status = 'completed'
      ${from ? `AND so.sale_datetime >= '${dateSql(from)}'` : ''}
      ${to ? `AND so.sale_datetime <= '${dateSql(to, true)}'` : ''}
    GROUP BY pm.method_id, pm.method_name
    ORDER BY total DESC`
  )

  const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0)

  return rows.map((r) => ({
    method_name: String(r.method_name),
    total: Number(r.total),
    count: Number(r.count),
    percent: grandTotal > 0 ? (Number(r.total) / grandTotal) * 100 : 0,
  }))
}

export async function getRecentTransactions(limit = 10, filters: OverviewFilters = {}) {
  const { from, to, storeId } = filters

  return prisma.salesOrder.findMany({
    where: {
      status: 'completed',
      ...(from || to
        ? { sale_datetime: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
      ...(storeId ? { store_id: storeId } : {}),
    },
    include: {
      store: { select: { store_name: true } },
      customer: { select: { full_name: true } },
      payments: { include: { method: { select: { method_name: true } } }, take: 1 },
      items: { select: { quantity: true } },
    },
    orderBy: { sale_datetime: 'desc' },
    take: limit,
  })
}

export async function getLowStockProducts(limit = 20) {
  return prisma.$queryRawUnsafe<
    {
      store_name: string
      product_name: string
      sku: string
      category_name: string
      qty_on_hand: number
      reorder_level: number
    }[]
  >(
    `SELECT
      s.store_name,
      p.product_name,
      p.sku,
      pc.category_name,
      ps.qty_on_hand,
      ps.reorder_level
    FROM product_stock ps
    JOIN stores s ON s.store_id = ps.store_id
    JOIN products p ON p.product_id = ps.product_id
    JOIN product_categories pc ON pc.category_id = p.category_id
    WHERE ps.qty_on_hand <= ps.reorder_level
    ORDER BY (ps.qty_on_hand / ps.reorder_level) ASC
    LIMIT ${limit}`
  )
}

export async function getFilterOptions() {
  const [stores, cities, categories, paymentMethods, membershipTiers] = await Promise.all([
    prisma.store.findMany({
      select: { store_id: true, store_name: true },
      orderBy: { store_name: 'asc' },
    }),
    prisma.city.findMany({
      select: { city_id: true, city_name: true },
      orderBy: { city_name: 'asc' },
    }),
    prisma.productCategory.findMany({
      select: { category_id: true, category_name: true },
      orderBy: { category_name: 'asc' },
    }),
    prisma.paymentMethod.findMany({
      select: { method_id: true, method_name: true },
    }),
    prisma.membershipTier.findMany({
      select: { tier_id: true, tier_name: true },
    }),
  ])

  return { stores, cities, categories, paymentMethods, membershipTiers }
}
