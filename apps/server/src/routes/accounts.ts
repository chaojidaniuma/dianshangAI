import type { FastifyInstance } from 'fastify'
import * as svc from '../services/account.service.js'
import { sendResult } from './http.js'
import { IdParamSchema, parse } from './validation.js'

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/accounts', async (_req, reply) => {
    return sendResult(reply, svc.listAccounts())
  })

  app.post('/api/accounts', async (req, reply) => {
    return sendResult(reply, svc.createAccount(req.body))
  })

  app.patch('/api/accounts/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.updateAccount(p.data.id, req.body))
  })

  app.delete('/api/accounts/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.deleteAccount(p.data.id))
  })

  app.post('/api/accounts/:id/health', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, await svc.checkAccountHealth(p.data.id))
  })
}
