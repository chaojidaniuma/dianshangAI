import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import { getLlmProvider } from '../providers/llm/provider.js'
import * as svc from '../services/settings.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  reply.code(result.success ? 200 : 400)
  return result
}

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
      reply.code(400)
      return { success: false, code: 'LLM_NOT_CONFIGURED', message: '未配置 LLM' }
    }
    try {
      await provider.chat({ messages: [{ role: 'user', content: '回复 ok' }], maxTokens: 8 })
      return { success: true, data: { message: '连接成功' } }
    } catch (err) {
      reply.code(400)
      return { success: false, code: 'LLM_FAILED', message: (err as Error).message }
    }
  })
}
