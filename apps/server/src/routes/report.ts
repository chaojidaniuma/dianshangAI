import type { FastifyInstance } from 'fastify'
import { generateDailyReport } from '../services/report.service.js'

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/report/daily', async () => {
    return { success: true, data: generateDailyReport() }
  })
}
