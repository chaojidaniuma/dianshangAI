import Fastify, { type FastifyInstance } from 'fastify'
import { orderRoutes } from './routes/orders.js'
import { productRoutes } from './routes/products.js'

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

  return app
}
