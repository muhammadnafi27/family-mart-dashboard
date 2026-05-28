import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = sp.get('page') ? Number(sp.get('page')) : 1
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        include: {
          city: { select: { city_name: true } },
          _count: { select: { products: true, purchase_orders: true } },
        },
        orderBy: { supplier_name: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.supplier.count(),
    ])

    return Response.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    console.error('[API/suppliers]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
