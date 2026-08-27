import Fastify, { type FastifyInstance } from 'fastify'

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'ok',
      },
    }
  })

  return app
}
