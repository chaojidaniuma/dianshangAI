import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../apps/server/src/app.ts'

test('GET /health 返回统一结构', async () => {
  const app = buildApp()
  const res = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.json(), {
    success: true,
    data: { status: 'ok' },
  })

  await app.close()
})
