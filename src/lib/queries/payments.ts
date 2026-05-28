import { prisma } from '@/lib/prisma'
import type {
  PaymentKPIs, PaymentMethodStat, PaymentTrendPoint,
  PaymentStatusStat, PaymentTransactionRow, PaymentFilters,
} from '@/types/payment'

function d(date: Date) { return date.toISOString().slice(0, 10) }

const CASH_METHODS = ['Cash', 'Tunai']

function buildWhere(f: PaymentFilters, alias = 'p') {
  const parts: string[] = []
  if (f.from) parts.push(`${alias}.payment_time >= '${d(f.from)}'`)
  if (f.to)   parts.push(`${alias}.payment_time <= '${d(f.to)} 23:59:59'`)
  if (f.storeId) parts.push(`so.store_id = ${f.storeId}`)
  if (f.methodId) parts.push(`${alias}.method_id = ${f.methodId}`)
  if (f.status) parts.push(`${alias}.status = '${f.status}'`)
  return parts.length ? `AND ${parts.join(' AND ')}` : ''
}

/* ─── KPIs ─── */
export async function getPaymentKPIs(f: PaymentFilters = {}): Promise<PaymentKPIs> {
  const wc = buildWhere(f)

  const [main, bestMethod] = await Promise.all([
    prisma.$queryRawUnsafe<{
      total: number; tx_count: bigint; failed: bigint; avg_amount: number;
      success: bigint
    }[]>(`
      SELECT
        SUM(p.paid_amount)     AS total,
        COUNT(*)               AS tx_count,
        SUM(p.status='failed') AS failed,
        SUM(p.status='success') AS success,
        AVG(p.paid_amount)     AS avg_amount
      FROM payments p
      JOIN sales_orders so ON so.sale_id = p.sale_id
      WHERE 1=1 ${wc}`),

    prisma.$queryRawUnsafe<{ method_name: string; count: bigint; total: number }[]>(`
      SELECT pm.method_name, COUNT(p.payment_id) AS count, SUM(p.paid_amount) AS total
      FROM payments p
      JOIN payment_methods pm ON pm.method_id = p.method_id
      JOIN sales_orders so ON so.sale_id = p.sale_id
      WHERE p.status = 'success' ${wc}
      GROUP BY pm.method_id, pm.method_name
      ORDER BY count DESC LIMIT 1`),

    // cash vs non-cash
    prisma.$queryRawUnsafe<{ method_name: string; total: number }[]>(`
      SELECT pm.method_name, SUM(p.paid_amount) AS total
      FROM payments p
      JOIN payment_methods pm ON pm.method_id = p.method_id
      JOIN sales_orders so ON so.sale_id = p.sale_id
      WHERE p.status = 'success' ${wc}
      GROUP BY pm.method_id, pm.method_name`),
  ])

  const m = main[0]
  const total = Number(m?.total ?? 0)
  const txCount = Number(m?.tx_count ?? 0)
  const success = Number(m?.success ?? 0)

  // cash / non-cash breakdown calculated below
  return {
    totalAmount: total,
    cashAmount: 0, // filled by caller
    nonCashAmount: 0,
    transactionCount: txCount,
    failedCount: Number(m?.failed ?? 0),
    avgPaymentAmount: Number(m?.avg_amount ?? 0),
    mostUsedMethod: bestMethod[0]
      ? { name: bestMethod[0].method_name, count: Number(bestMethod[0].count), total: Number(bestMethod[0].total) }
      : null,
    successRate: txCount > 0 ? (success / txCount) * 100 : 0,
  }
}

export async function getPaymentKPIsFull(f: PaymentFilters = {}): Promise<PaymentKPIs> {
  const wc = buildWhere(f)

  const [kpis, cashRow] = await Promise.all([
    getPaymentKPIs(f),
    prisma.$queryRawUnsafe<{ method_name: string; total: number }[]>(`
      SELECT pm.method_name, SUM(p.paid_amount) AS total
      FROM payments p
      JOIN payment_methods pm ON pm.method_id = p.method_id
      JOIN sales_orders so ON so.sale_id = p.sale_id
      WHERE p.status = 'success' ${wc}
      GROUP BY pm.method_id, pm.method_name`),
  ])

  let cashAmt = 0; let nonCashAmt = 0
  cashRow.forEach((r) => {
    if (CASH_METHODS.some((cm) => r.method_name.toLowerCase().includes(cm.toLowerCase()))) {
      cashAmt += Number(r.total)
    } else {
      nonCashAmt += Number(r.total)
    }
  })

  return { ...kpis, cashAmount: cashAmt, nonCashAmount: nonCashAmt }
}

/* ─── Method Distribution ─── */
export async function getPaymentMethodStats(f: PaymentFilters = {}): Promise<PaymentMethodStat[]> {
  const wc = buildWhere(f)

  const rows = await prisma.$queryRawUnsafe<{ method_name: string; total_amount: number; transaction_count: bigint }[]>(`
    SELECT pm.method_name, SUM(p.paid_amount) AS total_amount, COUNT(*) AS transaction_count
    FROM payments p
    JOIN payment_methods pm ON pm.method_id = p.method_id
    JOIN sales_orders so ON so.sale_id = p.sale_id
    WHERE p.status = 'success' ${wc}
    GROUP BY pm.method_id, pm.method_name
    ORDER BY total_amount DESC`)

  const grand = rows.reduce((s, r) => s + Number(r.total_amount), 0)
  return rows.map((r) => ({
    method_name: String(r.method_name),
    total_amount: Number(r.total_amount),
    transaction_count: Number(r.transaction_count),
    percent: grand > 0 ? (Number(r.total_amount) / grand) * 100 : 0,
    is_cash: CASH_METHODS.some((cm) => r.method_name.toLowerCase().includes(cm.toLowerCase())),
  }))
}

/* ─── Payment Trend ─── */
export async function getPaymentTrend(f: PaymentFilters = {}): Promise<PaymentTrendPoint[]> {
  const wc = buildWhere(f)

  const rows = await prisma.$queryRawUnsafe<{
    date: string; total_amount: number; transaction_count: bigint; cash_amount: number; non_cash_amount: number
  }[]>(`
    SELECT
      DATE(p.payment_time)                                                     AS date,
      SUM(p.paid_amount)                                                       AS total_amount,
      COUNT(*)                                                                 AS transaction_count,
      SUM(IF(pm.method_name IN('Cash','Tunai'), p.paid_amount, 0))            AS cash_amount,
      SUM(IF(pm.method_name NOT IN('Cash','Tunai'), p.paid_amount, 0))        AS non_cash_amount
    FROM payments p
    JOIN payment_methods pm ON pm.method_id = p.method_id
    JOIN sales_orders so ON so.sale_id = p.sale_id
    WHERE p.status = 'success' ${wc}
    GROUP BY DATE(p.payment_time)
    ORDER BY date ASC`)

  return rows.map((r) => ({
    date: String(r.date),
    total_amount: Number(r.total_amount),
    transaction_count: Number(r.transaction_count),
    cash_amount: Number(r.cash_amount),
    non_cash_amount: Number(r.non_cash_amount),
  }))
}

/* ─── Status Distribution ─── */
export async function getPaymentStatusStats(f: PaymentFilters = {}): Promise<PaymentStatusStat[]> {
  const wc = buildWhere(f, 'p')
  const rows = await prisma.$queryRawUnsafe<{ status: string; count: bigint; total_amount: number }[]>(`
    SELECT p.status, COUNT(*) AS count, SUM(p.paid_amount) AS total_amount
    FROM payments p
    JOIN sales_orders so ON so.sale_id = p.sale_id
    WHERE 1=1 ${wc.replace('p.status', '1=1 -- skip status')}
    GROUP BY p.status ORDER BY count DESC`)

  const grand = rows.reduce((s, r) => s + Number(r.count), 0)
  return rows.map((r) => ({
    status: String(r.status),
    count: Number(r.count),
    total_amount: Number(r.total_amount),
    percent: grand > 0 ? (Number(r.count) / grand) * 100 : 0,
  }))
}

/* ─── Transactions Table ─── */
export async function getPaymentTransactions(f: PaymentFilters = {}): Promise<{
  data: PaymentTransactionRow[]; total: number; page: number; pageSize: number; totalPages: number
}> {
  const { page = 1, pageSize = 20, search = '', sortBy = 'payment_time', sortDir = 'desc' } = f
  const offset = (page - 1) * pageSize
  const wc = buildWhere(f)
  const safeSort = ['payment_time','paid_amount'].includes(sortBy) ? sortBy : 'payment_time'
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC'

  const searchClause = search
    ? `AND (so.invoice_number LIKE '%${search.replace(/'/g,'')}%' OR pm.method_name LIKE '%${search.replace(/'/g,'')}%')`
    : ''

  const base = `
    FROM payments p
    JOIN sales_orders so ON so.sale_id = p.sale_id
    JOIN stores s ON s.store_id = so.store_id
    JOIN payment_methods pm ON pm.method_id = p.method_id
    LEFT JOIN customers c ON c.customer_id = so.customer_id
    WHERE 1=1 ${wc} ${searchClause}`

  const [rows, countRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      payment_id: number; invoice_number: string; store_name: string;
      method_name: string; paid_amount: number; payment_time: string;
      reference_no: string|null; status: string; customer_name: string|null
    }[]>(`
      SELECT p.payment_id, so.invoice_number, s.store_name,
        pm.method_name, p.paid_amount, p.payment_time,
        p.reference_no, p.status, c.full_name AS customer_name
      ${base}
      ORDER BY p.${safeSort} ${dir}
      LIMIT ${pageSize} OFFSET ${offset}`),
    prisma.$queryRawUnsafe<[{ cnt: bigint }]>(`SELECT COUNT(*) AS cnt ${base}`),
  ])

  const total = Number(countRow[0]?.cnt ?? 0)
  const data: PaymentTransactionRow[] = rows.map((r) => ({
    payment_id: Number(r.payment_id),
    invoice_number: String(r.invoice_number),
    store_name: String(r.store_name),
    method_name: String(r.method_name),
    paid_amount: Number(r.paid_amount),
    payment_time: String(r.payment_time),
    reference_no: r.reference_no ? String(r.reference_no) : null,
    status: String(r.status),
    customer_name: r.customer_name ? String(r.customer_name) : null,
  }))

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
