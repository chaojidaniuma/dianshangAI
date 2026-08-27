import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import * as svc from '../services/product.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  const status = result.success ? 200 : result.code === 'PRODUCT_NOT_FOUND' ? 404 : 400
  reply.code(status)
  return result
}

export async function productRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/products', async (req, reply) => {
    const { accountId, platform } = req.query as { accountId?: string; platform?: string }
    return sendResult(reply, svc.listProducts({ accountId, platform }))
  })

  app.get('/api/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.getProduct(id))
  })

  app.post('/api/products', async (req, reply) => {
    return sendResult(reply, svc.createProduct(req.body))
  })

  app.patch('/api/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.updateProduct(id, req.body))
  })

  app.delete('/api/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.deleteProduct(id))
  })

  app.post('/api/products/:id/publish', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, await svc.publishProduct(id))
  })
}
