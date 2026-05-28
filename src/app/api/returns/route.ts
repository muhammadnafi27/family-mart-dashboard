import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from') ? new Date(sp.get('from')!) : undefined
    const to = sp.get('to') ? new Date(sp.get('to')!) : undefined

    const data = await prisma.return.findMany({
      where: {
        ...(from || to
          ? { return_date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
          : {}),
        status: 'approved',
      },
      include: {
        reason: { select: { reason_name: true } },
        sale: { select: { invoice_number: true } },
        customer: { select: { full_name: true } },
        handler: { select: { full_name: true } },
      },
      orderBy: { return_date: 'desc' },
      take: 50,
    })

    return Response.json(data)
  } catch (error) {
    console.error('[API/returns]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
