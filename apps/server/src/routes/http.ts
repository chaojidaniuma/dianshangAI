import type { FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'

export function sendResult<T>(reply: FastifyReply, result: Result<T>): Result<T> {
  const status = result.success ? 200 : result.code.endsWith('_NOT_FOUND') ? 404 : 400
  reply.code(status)
  return result
}
