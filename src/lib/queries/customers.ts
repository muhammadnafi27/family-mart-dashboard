import { prisma } from '@/lib/prisma'
import type {
  CustomerKPIs, CustomerGrowthPoint, MembershipTierStat,
  MemberVsNonMember, CustomerByCityPoint, TopCustomerRow,
  CustomerFilters,
} from '@/types/customer'

function d(date: Date) { return date.toISOString().slice(0, 10) }
function wc(f: CustomerFilters, alias = 'so') {
  const p: string[] = []
  if (f.from) p.push(`${alias}.sale_datetime >= '${d(f.from)}'`)
  if (f.to)   p.push(`${alias}.sale_datetime <= '${d(f.to)} 23:59:59'`)
  if (f.storeId) p.push(`${alias}.store_id = ${f.storeId}`)
  return p.length ? `AND ${p.join(' AND ')}` : ''
}

/* ─── KPIs ─── */
export async function getCustomerKPIs(f: CustomerFilters = {}): Promise<CustomerKPIs> {
  const dateClause = wc(f)

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [totals, newMonth, topRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      total: bigint; members: bigint; avg_purchase: number
    }[]>(`
      SELECT
        COUNT(DISTINCT c.customer_id) AS total,
        COUNT(DISTINCT m.customer_id) AS members,
        AVG(cust_spend.total_spent)   AS avg_purchase
      FROM customers c
      LEFT JOIN memberships m ON m.customer_id = c.customer_id
      LEFT JOIN (
        SELECT customer_id, SUM(grand_total) AS total_spent
        FROM sales_orders
        WHERE status = 'completed' ${dateClause}
        GROUP BY customer_id
      ) cust_spend ON cust_spend.customer_id = c.customer_id`),

    prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) AS count FROM customers
      WHERE registered_at >= '${monthStart}'`),

    prisma.$queryRawUnsafe<{ full_name: string; total_spent: number; order_count: bigint }[]>(`
      SELECT c.full_name, SUM(so.grand_total) AS total_spent, COUNT(so.sale_id) AS order_count
      FROM customers c
      JOIN sales_orders so ON so.customer_id = c.customer_id
      WHERE so.status = 'completed' ${dateClause}
      GROUP BY c.customer_id, c.full_name
      ORDER BY total_spent DESC LIMIT 1`),
  ])

  const t = totals[0]
  const total = Number(t?.total ?? 0)
  const members = Number(t?.members ?? 0)

  return {
    totalCustomers: total,
    totalMembers: members,
    totalNonMembers: total - members,
    newThisMonth: Number(newMonth[0]?.count ?? 0),
    avgPurchasePerCustomer: Number(t?.avg_purchase ?? 0),
    topCustomer: topRow[0]
      ? { name: topRow[0].full_name, total_spent: Number(topRow[0].total_spent), order_count: Number(topRow[0].order_count) }
      : null,
  }
}

/* ─── Customer Growth ─── */
export async function getCustomerGrowth(): Promise<CustomerGrowthPoint[]> {
  const rows = await prisma.$queryRawUnsafe<{ month: string; new_customers: bigint }[]>(`
    SELECT DATE_FORMAT(registered_at, '%Y-%m-01') AS month, COUNT(*) AS new_customers
    FROM customers
    WHERE registered_at IS NOT NULL
    GROUP BY month ORDER BY month ASC`)

  let cum = 0
  return rows.map((r) => {
    const n = Number(r.new_customers)
    cum += n
    return { month: String(r.month), new_customers: n, cumulative: cum }
  })
}

/* ─── Membership Tier Stats ─── */
export async function getMembershipTierStats(f: CustomerFilters = {}): Promise<MembershipTierStat[]> {
  const dateClause = wc(f)
  const rows = await prisma.$queryRawUnsafe<{
    tier_name: string; count: bigint; total_revenue: number; avg_order: number; avg_points: number
  }[]>(`
    SELECT
      COALESCE(mt.tier_name,'Non-Member') AS tier_name,
      COUNT(DISTINCT c.customer_id)       AS count,
      COALESCE(SUM(so.grand_total),0)     AS total_revenue,
      COALESCE(AVG(so.grand_total),0)     AS avg_order,
      COALESCE(AVG(m.points),0)           AS avg_points
    FROM customers c
    LEFT JOIN memberships m ON m.customer_id = c.customer_id
    LEFT JOIN membership_tiers mt ON mt.tier_id = m.tier_id
    LEFT JOIN sales_orders so ON so.customer_id = c.customer_id
      AND so.status = 'completed' ${dateClause ? dateClause.replace('AND so.', 'AND ') : ''}
    GROUP BY mt.tier_id, mt.tier_name
    ORDER BY FIELD(mt.tier_name,'Platinum','Gold','Silver','Bronze') ASC, count DESC`)

  return rows.map((r) => ({
    tier_name: String(r.tier_name),
    count: Number(r.count),
    total_revenue: Number(r.total_revenue),
    avg_order: Number(r.avg_order),
    avg_points: Number(r.avg_points),
  }))
}

/* ─── Member vs Non-member ─── */
export async function getMemberVsNonMember(f: CustomerFilters = {}): Promise<MemberVsNonMember[]> {
  const dateClause = wc(f)
  const rows = await prisma.$queryRawUnsafe<{
    segment: string; customer_count: bigint; total_revenue: number; avg_order: number; order_count: bigint
  }[]>(`
    SELECT
      IF(m.customer_id IS NOT NULL,'Member','Non-Member') AS segment,
      COUNT(DISTINCT so.customer_id)                       AS customer_count,
      SUM(so.grand_total)                                  AS total_revenue,
      AVG(so.grand_total)                                  AS avg_order,
      COUNT(so.sale_id)                                    AS order_count
    FROM sales_orders so
    LEFT JOIN memberships m ON m.customer_id = so.customer_id
    WHERE so.status = 'completed' ${dateClause}
    GROUP BY segment`)

  return rows.map((r) => ({
    segment: String(r.segment),
    customer_count: Number(r.customer_count),
    total_revenue: Number(r.total_revenue),
    avg_order: Number(r.avg_order),
    order_count: Number(r.order_count),
  }))
}

/* ─── By City ─── */
export async function getCustomersByCity(f: CustomerFilters = {}): Promise<CustomerByCityPoint[]> {
  const dateClause = wc(f)
  const rows = await prisma.$queryRawUnsafe<{
    city_name: string; customer_count: bigint; total_revenue: number; avg_spent: number
  }[]>(`
    SELECT
      ci.city_name,
      COUNT(DISTINCT c.customer_id) AS customer_count,
      COALESCE(SUM(spend.total),0)  AS total_revenue,
      COALESCE(AVG(spend.total),0)  AS avg_spent
    FROM customers c
    JOIN districts d ON d.district_id = c.district_id
    JOIN cities ci ON ci.city_id = d.city_id
    LEFT JOIN (
      SELECT customer_id, SUM(grand_total) AS total
      FROM sales_orders WHERE status='completed' ${dateClause}
      GROUP BY customer_id
    ) spend ON spend.customer_id = c.customer_id
    GROUP BY ci.city_id, ci.city_name
    ORDER BY total_revenue DESC`)

  return rows.map((r) => ({
    city_name: String(r.city_name),
    customer_count: Number(r.customer_count),
    total_revenue: Number(r.total_revenue),
    avg_spent: Number(r.avg_spent),
  }))
}

/* ─── Top Customer Table ─── */
export async function getTopCustomers(f: CustomerFilters = {}): Promise<{
  data: TopCustomerRow[]; total: number; page: number; pageSize: number; totalPages: number
}> {
  const { page = 1, pageSize = 20, search = '', sortBy = 'total_spent', sortDir = 'desc', tierId } = f
  const offset = (page - 1) * pageSize
  const dateClause = wc(f)
  const safeSort = ['total_spent','order_count','avg_order','last_purchase'].includes(sortBy) ? sortBy : 'total_spent'
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC'

  const searchClause = search
    ? `AND (c.full_name LIKE '%${search.replace(/'/g,'')  }%' OR c.phone LIKE '%${search.replace(/'/g,'')}%')`
    : ''
  const tierClause = tierId ? `AND m.tier_id = ${tierId}` : ''

  const base = `
    FROM customers c
    LEFT JOIN memberships m ON m.customer_id = c.customer_id
    LEFT JOIN membership_tiers mt ON mt.tier_id = m.tier_id
    LEFT JOIN districts dist ON dist.district_id = c.district_id
    LEFT JOIN cities ci ON ci.city_id = dist.city_id
    LEFT JOIN (
      SELECT customer_id,
        SUM(grand_total) AS total_spent,
        COUNT(*) AS order_count,
        AVG(grand_total) AS avg_order,
        MAX(sale_datetime) AS last_purchase
      FROM sales_orders
      WHERE status='completed' ${dateClause}
      GROUP BY customer_id
    ) s ON s.customer_id = c.customer_id
    WHERE s.customer_id IS NOT NULL ${searchClause} ${tierClause}`

  const [rows, countRow] = await Promise.all([
    prisma.$queryRawUnsafe<{
      customer_id: number; full_name: string; gender: string|null;
      city_name: string|null; tier_name: string|null;
      total_spent: number; order_count: bigint; avg_order: number;
      last_purchase: string|null; member_no: string|null; points: number|null
    }[]>(`
      SELECT c.customer_id, c.full_name, c.gender,
        ci.city_name, COALESCE(mt.tier_name,'Non-Member') AS tier_name,
        COALESCE(s.total_spent,0) AS total_spent,
        COALESCE(s.order_count,0) AS order_count,
        COALESCE(s.avg_order,0) AS avg_order,
        s.last_purchase,
        m.member_no, m.points
      ${base}
      ORDER BY ${safeSort} ${dir}
      LIMIT ${pageSize} OFFSET ${offset}`),
    prisma.$queryRawUnsafe<[{ cnt: bigint }]>(`SELECT COUNT(*) AS cnt ${base}`),
  ])

  const total = Number(countRow[0]?.cnt ?? 0)
  const data: TopCustomerRow[] = rows.map((r) => ({
    customer_id: Number(r.customer_id),
    full_name: String(r.full_name),
    gender: r.gender ? String(r.gender) : null,
    city_name: r.city_name ? String(r.city_name) : null,
    tier_name: r.tier_name ? String(r.tier_name) : 'Non-Member',
    total_spent: Number(r.total_spent),
    order_count: Number(r.order_count),
    avg_order: Number(r.avg_order),
    last_purchase: r.last_purchase ? String(r.last_purchase) : null,
    member_no: r.member_no ? String(r.member_no) : null,
    points: Number(r.points ?? 0),
  }))

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
