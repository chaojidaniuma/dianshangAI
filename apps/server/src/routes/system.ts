import type { FastifyInstance } from 'fastify'
import { readFileSync } from 'node:fs'
import { listAudit } from '../repositories/audit.repository.js'
import { createBackup } from '../services/backup.service.js'

export async function systemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/audit', async () => {
    return { success: true, data: listAudit(100) }
  })

  app.get('/api/backup', async (_req, reply) => {
    const { filename, path } = createBackup()
    reply.header('Content-Disposition', `attachment; filename="${filename}"`)
    reply.type('application/zip')
    return readFileSync(path)
  })
}
