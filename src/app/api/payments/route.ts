import { NextRequest } from 'next/server'
import {
  getPaymentKPIsFull,
  getPaymentMethodStats,
  getPaymentTrend,
  getPaymentStatusStats,
  getPaymentTransactions,
} from '@/lib/queries/payments'
import type { PaymentFilters } from '@/types/payment'

function parse(sp: URLSearchParams): PaymentFilters {
  return {
    from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
    to:   sp.get('to')   ? new Date(sp.get('to')!)   : undefined,
    storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    methodId: sp.get('methodId') ? Number(sp.get('methodId')) : undefined,
    status: sp.get('status') || '',
    search: sp.get('search') || '',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : 20,
    sortBy: sp.get('sortBy') || 'payment_time',
    sortDir: (sp.get('sortDir') as 'asc' | 'desc') || 'desc',
  }
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const f = parse(sp)

    switch (type) {
      case 'kpis':    return Response.json(await getPaymentKPIsFull(f))
      case 'methods': return Response.json(await getPaymentMethodStats(f))
      case 'trend':   return Response.json(await getPaymentTrend(f))
      case 'status':  return Response.json(await getPaymentStatusStats(f))
      default:        return Response.json(await getPaymentTransactions(f))
    }
  } catch (err) {
    console.error('[GET /api/payments]', err)
    return Response.json({ error: 'Gagal memuat data pembayaran' }, { status: 500 })
  }
}
