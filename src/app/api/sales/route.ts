import { NextRequest } from 'next/server'
import {
  getSalesKPIs,
  getSalesTrend,
  getHourlyHeatmap,
  getStoreSales,
  getCashierStats,
  getCategorySales,
  getSalesOrdersTable,
  getSalesFilterOptions,
} from '@/lib/queries/sales'
import type { SalesFilters } from '@/types/sales'

function parseFilters(sp: URLSearchParams): SalesFilters {
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    cityId: sp.get('cityId') ? Number(sp.get('cityId')) : undefined,
    cashierId: sp.get('cashierId') ? Number(sp.get('cashierId')) : undefined,
    paymentMethodId: sp.get('paymentMethodId') ? Number(sp.get('paymentMethodId')) : undefined,
    status: (sp.get('status') as SalesFilters['status']) || undefined,
    groupBy: (sp.get('groupBy') as 'day' | 'month') || 'day',
    search: sp.get('search') || '',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 20,
    sortBy: sp.get('sortBy') || 'sale_datetime',
    sortDir: (sp.get('sortDir') as 'asc' | 'desc') || 'desc',
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parseFilters(sp)

    switch (type) {
      case 'kpis':     return Response.json(await getSalesKPIs(f))
      case 'trend':    return Response.json(await getSalesTrend(f))
      case 'heatmap':  return Response.json(await getHourlyHeatmap(f))
      case 'stores':   return Response.json(await getStoreSales(f))
      case 'cashiers': return Response.json(await getCashierStats(f))
      case 'category': return Response.json(await getCategorySales(f))
      case 'filters':  return Response.json(await getSalesFilterOptions())
      default:         return Response.json(await getSalesOrdersTable(f))
    }
  } catch (err) {
    console.error('[GET /api/sales]', err)
    return Response.json({ error: 'Gagal memuat data penjualan' }, { status: 500 })
  }
}
