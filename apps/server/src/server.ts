import { buildApp } from './app.js'
import { seedDefaultAccount } from './seed.js'
import { startScheduler } from './services/job.service.js'
import { syncMockOrders } from './services/order.service.js'

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

seedDefaultAccount()
await syncMockOrders()
startScheduler()

const app = buildApp()

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
