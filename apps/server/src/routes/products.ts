import type { FastifyInstance } from 'fastify'
import * as svc from '../services/product.service.js'
import { sendResult } from './http.js'
import { IdParamSchema, ProductListQuerySchema, parse } from './validation.js'

export async function productRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/products', async (req, reply) => {
    const q = parse(ProductListQuerySchema, req.query)
    if (!q.success) return sendResult(reply, q)
    return sendResult(reply, svc.listProducts(q.data))
  })

  app.get('/api/products/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.getProduct(p.data.id))
  })

  app.post('/api/products', async (req, reply) => {
    return sendResult(reply, svc.createProduct(req.body))
  })

  app.patch('/api/products/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.updateProduct(p.data.id, req.body))
  })

  app.delete('/api/products/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.deleteProduct(p.data.id))
  })

  app.post('/api/products/:id/publish', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, await svc.publishProduct(p.data.id))
  })
}
