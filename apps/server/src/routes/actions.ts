import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import * as svc from '../services/action.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  reply.code(result.success ? 200 : 400)
  return result
}

export async function actionRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/actions/preview', async (req, reply) => {
    return sendResult(reply, svc.previewAction(req.body))
  })

  app.post('/api/actions/:token/execute', async (req, reply) => {
    const { token } = req.params as { token: string }
    return sendResult(reply, await svc.executeAction(token))
  })
}
