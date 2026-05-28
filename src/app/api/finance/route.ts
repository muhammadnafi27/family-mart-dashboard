import { NextRequest } from 'next/server'
import { getExpensesByCategory, getReturnReasonStats, getCashReconciliations } from '@/lib/queries/finance'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const type = sp.get('type')
    const filters = {
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
      storeId: sp.get('storeId') ? Number(sp.get('storeId')) : undefined,
    }

    if (type === 'returns') {
      const data = await getReturnReasonStats(filters)
      return Response.json(data)
    }

    if (type === 'reconciliation') {
      const data = await getCashReconciliations(filters)
      return Response.json(data)
    }

    const data = await getExpensesByCategory(filters)
    return Response.json(data)
  } catch (error) {
    console.error('[API/finance]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
