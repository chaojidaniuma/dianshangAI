import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import * as svc from '../services/account.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  const status = result.success ? 200 : result.code === 'ACCOUNT_NOT_FOUND' ? 404 : 400
  reply.code(status)
  return result
}

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/accounts', async (_req, reply) => {
    return sendResult(reply, svc.listAccounts())
  })

  app.post('/api/accounts', async (req, reply) => {
    return sendResult(reply, svc.createAccount(req.body))
  })

  app.patch('/api/accounts/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.updateAccount(id, req.body))
  })

  app.delete('/api/accounts/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.deleteAccount(id))
  })

  app.post('/api/accounts/:id/health', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, await svc.checkAccountHealth(id))
  })
}
