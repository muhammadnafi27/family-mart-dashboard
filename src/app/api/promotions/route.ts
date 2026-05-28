import { NextRequest } from 'next/server'
import {
  getPromotionKPIs,
  getPromoUsageStats,
  getPromoRevenueTrend,
  getCouponStats,
  getPromoProductTable,
} from '@/lib/queries/promotions'
import type { PromotionFilters } from '@/types/promotion'

function parse(sp: URLSearchParams): PromotionFilters {
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to:   sp.get('to')   ? new Date(sp.get('to')!)   : undefined,
    status: (sp.get('status') as PromotionFilters['status']) || '',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 25,
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parse(sp)

    switch (type) {
      case 'kpis':    return Response.json(await getPromotionKPIs(f))
      case 'usage':   return Response.json(await getPromoUsageStats(f))
      case 'trend':   return Response.json(await getPromoRevenueTrend(f))
      case 'coupons': return Response.json(await getCouponStats())
      default:        return Response.json(await getPromoProductTable(f))
    }
  } catch (err) {
    console.error('[GET /api/promotions]', err)
    return Response.json({ error: 'Gagal memuat data promosi' }, { status: 500 })
  }
}
