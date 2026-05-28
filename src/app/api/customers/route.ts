import { NextRequest } from 'next/server'
import {
  getCustomerKPIs,
  getCustomerGrowth,
  getMembershipTierStats,
  getMemberVsNonMember,
  getCustomersByCity,
  getTopCustomers,
} from '@/lib/queries/customers'
import type { CustomerFilters } from '@/types/customer'

function parse(sp: URLSearchParams): CustomerFilters {
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to:   sp.get('to')   ? new Date(sp.get('to')!)   : undefined,
    storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    cityId: sp.get('cityId') ? Number(sp.get('cityId')) : undefined,
    tierId: sp.get('tierId') ? Number(sp.get('tierId')) : undefined,
    search: sp.get('search') || '',
    page:   sp.get('page')   ? Number(sp.get('page'))   : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 20,
    sortBy:  sp.get('sortBy')  || 'total_spent',
    sortDir: (sp.get('sortDir') as 'asc' | 'desc') || 'desc',
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parse(sp)

    switch (type) {
      case 'kpis':     return Response.json(await getCustomerKPIs(f))
      case 'growth':   return Response.json(await getCustomerGrowth())
      case 'tiers':    return Response.json(await getMembershipTierStats(f))
      case 'segments': return Response.json(await getMemberVsNonMember(f))
      case 'cities':   return Response.json(await getCustomersByCity(f))
      default:         return Response.json(await getTopCustomers(f))
    }
  } catch (err) {
    console.error('[GET /api/customers]', err)
    return Response.json({ error: 'Gagal memuat data pelanggan' }, { status: 500 })
  }
}
