import type { FastifyInstance } from 'fastify'
import * as svc from '../services/action.service.js'
import { sendResult } from './http.js'

export async function actionRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/actions/preview', async (req, reply) => {
    return sendResult(reply, svc.previewAction(req.body))
  })

  app.post('/api/actions/:token/execute', async (req, reply) => {
    const { token } = req.params as { token: string }
    return sendResult(reply, await svc.executeAction(token))
  })
}
