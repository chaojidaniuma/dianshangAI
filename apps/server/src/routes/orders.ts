import type { FastifyInstance } from 'fastify'
import * as svc from '../services/order.service.js'
import { sendResult } from './http.js'
import { IdParamSchema, OrderListQuerySchema, parse } from './validation.js'

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/orders', async (req, reply) => {
    const q = parse(OrderListQuerySchema, req.query)
    if (!q.success) return sendResult(reply, q)
    return sendResult(reply, svc.listOrders(q.data))
  })

  app.post('/api/orders/:id/ship', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, await svc.shipOrder(p.data.id, req.body))
  })
}
