import { NextRequest } from 'next/server'
import {
  getOverviewKPIs,
  getRevenueTrend,
  getStorePerformance,
  getTopProducts,
  getPaymentMethodDistribution,
  getRecentTransactions,
  getLowStockProducts,
  getFilterOptions,
} from '@/lib/queries/overview'

function parseFilters(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    cityId: sp.get('cityId') ? Number(sp.get('cityId')) : undefined,
  }
}

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')
    const filters = parseFilters(req)

    switch (type) {
      case 'trend':
        return Response.json({ trend: await getRevenueTrend(filters) })

      case 'stores':
        return Response.json({ stores: await getStorePerformance(filters) })

      case 'products':
        return Response.json({ products: await getTopProducts(filters) })

      case 'payments':
        return Response.json({ payments: await getPaymentMethodDistribution(filters) })

      case 'transactions':
        return Response.json({
          transactions: await getRecentTransactions(15, filters),
        })

      case 'lowstock':
        return Response.json({ lowStock: await getLowStockProducts(20) })

      case 'filters':
        return Response.json(await getFilterOptions())

      default:
        return Response.json(await getOverviewKPIs(filters))
    }
  } catch (err) {
    console.error('[GET /api/overview]', err)
    return Response.json({ error: 'Gagal memuat data' }, { status: 500 })
  }
}
