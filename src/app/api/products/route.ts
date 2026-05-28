import { NextRequest } from 'next/server'
import {
  getProductKPIs,
  getTopProducts,
  getCategorySales,
  getBrandPerformance,
  getProductTable,
  getProductFilterOptions,
} from '@/lib/queries/products'
import type { ProductFilters } from '@/types/product'

function parseFilters(sp: URLSearchParams): ProductFilters {
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    categoryId: sp.get('categoryId') ? Number(sp.get('categoryId')) : undefined,
    brandId: sp.get('brandId') ? Number(sp.get('brandId')) : undefined,
    search: sp.get('search') || '',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 25,
    sortBy: sp.get('sortBy') || 'revenue',
    sortDir: (sp.get('sortDir') as 'asc' | 'desc') || 'desc',
    status: (sp.get('status') as ProductFilters['status']) || '',
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parseFilters(sp)

    switch (type) {
      case 'kpis':     return Response.json(await getProductKPIs(f))
      case 'top':      return Response.json(await getTopProducts(f))
      case 'category': return Response.json(await getCategorySales(f))
      case 'brand':    return Response.json(await getBrandPerformance(f))
      case 'filters':  return Response.json(await getProductFilterOptions())
      default:         return Response.json(await getProductTable(f))
    }
  } catch (err) {
    console.error('[GET /api/products]', err)
    return Response.json({ error: 'Gagal memuat data produk' }, { status: 500 })
  }
}
