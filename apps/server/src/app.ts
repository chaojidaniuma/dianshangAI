import Fastify, { type FastifyInstance } from 'fastify'
import { accountRoutes } from './routes/accounts.js'
import { actionRoutes } from './routes/actions.js'
import { importExportRoutes } from './routes/import-export.js'
import { jobRoutes } from './routes/jobs.js'
import { orderRoutes } from './routes/orders.js'
import { productRoutes } from './routes/products.js'
import { reportRoutes } from './routes/report.js'
import { settingsRoutes } from './routes/settings.js'
import { systemRoutes } from './routes/system.js'

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'ok',
      },
    }
  })

  app.register(productRoutes)
  app.register(orderRoutes)
  app.register(importExportRoutes)
  app.register(accountRoutes)
  app.register(settingsRoutes)
  app.register(jobRoutes)
  app.register(reportRoutes)
  app.register(systemRoutes)
  app.register(actionRoutes)

  return app
}
