import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import * as svc from '../services/order.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  const status = result.success ? 200 : result.code === 'ORDER_NOT_FOUND' ? 404 : 400
  reply.code(status)
  return result
}

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/orders', async (req, reply) => {
    const { accountId, status } = req.query as { accountId?: string; status?: string }
    return sendResult(reply, svc.listOrders({ accountId, status }))
  })

  app.post('/api/orders/:id/ship', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, await svc.shipOrder(id, req.body))
  })
}
