import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaMariaDb({
  host: 'localhost', port: 3306, user: 'root', password: '', database: 'fmdata',
})
const prisma = new PrismaClient({ adapter })

try {
  const stores = await prisma.store.count()
  const customers = await prisma.customer.count()
  const sales = await prisma.salesOrder.count()
  const products = await prisma.product.count()
  console.log('OK - stores:', stores, 'customers:', customers, 'sales:', sales, 'products:', products)
} catch (e) {
  console.log('ERROR:', e.message)
}
process.exit(0)
