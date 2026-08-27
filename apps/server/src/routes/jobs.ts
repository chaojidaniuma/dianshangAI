import type { FastifyInstance, FastifyReply } from 'fastify'
import type { Result } from '@ecom-agent/shared'
import * as svc from '../services/job.service.js'

function sendResult<T>(reply: FastifyReply, result: Result<T>) {
  const status = result.success ? 200 : result.code === 'JOB_NOT_FOUND' ? 404 : 400
  reply.code(status)
  return result
}

export async function jobRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/jobs', async (_req, reply) => {
    return sendResult(reply, svc.listJobs())
  })

  app.post('/api/jobs', async (req, reply) => {
    return sendResult(reply, svc.createJob(req.body))
  })

  app.patch('/api/jobs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.updateJob(id, req.body))
  })

  app.delete('/api/jobs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.deleteJob(id))
  })

  app.post('/api/jobs/:id/run', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, await svc.runJob(id))
  })

  app.get('/api/jobs/:id/runs', async (req, reply) => {
    const { id } = req.params as { id: string }
    return sendResult(reply, svc.listJobRuns(id))
  })
}
