import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaMariaDb({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'fmdata' })
const prisma = new PrismaClient({ adapter })

console.log('=== sales_orders.status distinct ===')
const s = await prisma.$queryRawUnsafe('SELECT status, COUNT(*) as cnt FROM sales_orders GROUP BY status')
console.log(s)

console.log('\n=== payments.status distinct ===')
const p = await prisma.$queryRawUnsafe('SELECT status, COUNT(*) as cnt FROM payments GROUP BY status')
console.log(p)

console.log('\n=== returns.status distinct ===')
const r = await prisma.$queryRawUnsafe('SELECT status, COUNT(*) as cnt FROM returns GROUP BY status')
console.log(r)

console.log('\n=== sale_datetime sample ===')
const dt = await prisma.$queryRawUnsafe('SELECT MIN(sale_datetime) AS min_dt, MAX(sale_datetime) AS max_dt FROM sales_orders')
console.log(dt)

process.exit(0)
