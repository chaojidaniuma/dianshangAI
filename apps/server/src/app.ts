import Fastify, { type FastifyInstance } from 'fastify'
import { accountRoutes } from './routes/accounts.js'
import { importExportRoutes } from './routes/import-export.js'
import { orderRoutes } from './routes/orders.js'
import { productRoutes } from './routes/products.js'
import { settingsRoutes } from './routes/settings.js'

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

  return app
}
