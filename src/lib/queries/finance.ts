import { prisma } from '@/lib/prisma'

export async function getExpensesByCategory(filters: {
  from?: Date
  to?: Date
  storeId?: number
} = {}) {
  const { from, to, storeId } = filters

  const rows = await prisma.$queryRawUnsafe<
    { expense_category: string; total: number; count: number }[]
  >(
    `SELECT
      expense_category,
      SUM(amount) AS total,
      COUNT(*) AS count
    FROM expenses
    WHERE 1=1
      ${from ? `AND expense_date >= '${from.toISOString().slice(0, 10)}'` : ''}
      ${to ? `AND expense_date <= '${to.toISOString().slice(0, 10)}'` : ''}
      ${storeId ? `AND store_id = ${storeId}` : ''}
    GROUP BY expense_category
    ORDER BY total DESC`
  )

  return rows.map((r) => ({
    expense_category: String(r.expense_category),
    total: Number(r.total),
    count: Number(r.count),
  }))
}

export async function getReturnReasonStats(filters: { from?: Date; to?: Date } = {}) {
  const { from, to } = filters

  const rows = await prisma.$queryRawUnsafe<
    { reason_name: string; count: number; total_refund: number }[]
  >(
    `SELECT
      rr.reason_name,
      COUNT(r.return_id) AS count,
      SUM(r.refund_amount) AS total_refund
    FROM returns r
    JOIN return_reasons rr ON rr.reason_id = r.reason_id
    WHERE r.status IN ('Approved','Refunded')
      ${from ? `AND r.return_date >= '${from.toISOString().slice(0, 10)}'` : ''}
      ${to ? `AND r.return_date <= '${to.toISOString().slice(0, 10)} 23:59:59'` : ''}
    GROUP BY rr.reason_name
    ORDER BY count DESC`
  )

  return rows.map((r) => ({
    reason_name: String(r.reason_name),
    count: Number(r.count),
    total_refund: Number(r.total_refund),
  }))
}

export async function getCashReconciliations(filters: {
  from?: Date
  to?: Date
  storeId?: number
} = {}) {
  const { from, to, storeId } = filters

  return prisma.dailyCashReconciliation.findMany({
    where: {
      ...(from || to
        ? { recon_date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
        : {}),
      ...(storeId ? { store_id: storeId } : {}),
    },
    include: { store: { select: { store_name: true } } },
    orderBy: { recon_date: 'desc' },
    take: 50,
  })
}
