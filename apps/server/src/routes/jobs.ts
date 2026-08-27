import type { FastifyInstance } from 'fastify'
import * as svc from '../services/job.service.js'
import { sendResult } from './http.js'
import { IdParamSchema, parse } from './validation.js'

export async function jobRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/jobs', async (_req, reply) => {
    return sendResult(reply, svc.listJobs())
  })

  app.post('/api/jobs', async (req, reply) => {
    return sendResult(reply, svc.createJob(req.body))
  })

  app.patch('/api/jobs/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.updateJob(p.data.id, req.body))
  })

  app.delete('/api/jobs/:id', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.deleteJob(p.data.id))
  })

  app.post('/api/jobs/:id/run', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, await svc.runJob(p.data.id))
  })

  app.get('/api/jobs/:id/runs', async (req, reply) => {
    const p = parse(IdParamSchema, req.params)
    if (!p.success) return sendResult(reply, p)
    return sendResult(reply, svc.listJobRuns(p.data.id))
  })
}
