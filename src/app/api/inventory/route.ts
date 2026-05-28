import { NextRequest } from 'next/server'
import {
  getInventoryKPIs,
  getStockByStore,
  getStockByCategory,
  getAdjustmentTrend,
  getLowStockTable,
  getReorderAlerts,
  getStockMovement,
} from '@/lib/queries/inventory'
import type { InventoryFilters } from '@/types/inventory'

function parseFilters(sp: URLSearchParams): InventoryFilters {
  return {
    storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    categoryId: sp.get('categoryId') ? Number(sp.get('categoryId')) : undefined,
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 30,
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parseFilters(sp)

    switch (type) {
      case 'kpis':      return Response.json(await getInventoryKPIs(f))
      case 'by-store':  return Response.json(await getStockByStore(f))
      case 'by-cat':    return Response.json(await getStockByCategory(f))
      case 'trend':     return Response.json(await getAdjustmentTrend(f))
      case 'low-stock': return Response.json(await getLowStockTable(f))
      case 'reorder':   return Response.json(await getReorderAlerts())
      case 'movement':  return Response.json(await getStockMovement(f))
      default:          return Response.json(await getLowStockTable(f))
    }
  } catch (err) {
    console.error('[GET /api/inventory]', err)
    return Response.json({ error: 'Gagal memuat data inventori' }, { status: 500 })
  }
}
