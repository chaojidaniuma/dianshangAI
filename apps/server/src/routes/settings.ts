import type { FastifyInstance } from 'fastify'
import { getLlmProvider } from '../providers/llm/provider.js'
import * as svc from '../services/settings.service.js'
import { sendResult } from './http.js'

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/settings', async (_req, reply) => {
    return sendResult(reply, svc.getSettings())
  })

  app.put('/api/settings', async (req, reply) => {
    return sendResult(reply, svc.updateSettings(req.body))
  })

  app.post('/api/settings/test-llm', async (_req, reply) => {
    const provider = getLlmProvider()
    if (!provider) {
      return sendResult(reply, { success: false, code: 'LLM_NOT_CONFIGURED', message: '未配置 LLM' })
    }
    try {
      await provider.chat({ messages: [{ role: 'user', content: '回复 ok' }], maxTokens: 8 })
      return sendResult(reply, { success: true, data: { message: '连接成功' } })
    } catch (err) {
      return sendResult(reply, { success: false, code: 'LLM_FAILED', message: (err as Error).message })
    }
  })
}
