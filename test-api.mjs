import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaMariaDb({
  host: 'localhost', port: 3306, user: 'root', password: '', database: 'fmdata',
})
const prisma = new PrismaClient({ adapter })

const tests = [
  ['sales_orders completed', () => prisma.salesOrder.count({ where: { status: 'completed' } })],
  ['low_stock count', async () => {
    const r = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM product_stock WHERE qty_on_hand <= reorder_level')
    return Number(r[0].cnt)
  }],
  ['payments success', async () => {
    const r = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM payments WHERE status = "success"')
    return Number(r[0].cnt)
  }],
  ['membership_tiers count', () => prisma.membershipTier.count()],
  ['promotions count', () => prisma.promotion.count()],
  ['inventory adjustments', () => prisma.inventoryAdjustment.count()],
  ['expenses count', () => prisma.expense.count()],
]

for (const [name, fn] of tests) {
  try {
    const res = await fn()
    console.log('OK  ', name, '=>', res)
  } catch (e) {
    console.log('FAIL', name, '=>', e.message.split('\n')[0])
  }
}
process.exit(0)
