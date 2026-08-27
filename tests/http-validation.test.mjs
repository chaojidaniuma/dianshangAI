import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { buildApp } = await import('../apps/server/dist/app.js')

test('query 校验：非法 platform 返回 400 VALIDATION_ERROR', async () => {
  const app = buildApp()
  const r = await app.inject({ method: 'GET', url: '/api/products?platform=taobao' })
  assert.equal(r.statusCode, 400)
  assert.equal(r.json().code, 'VALIDATION_ERROR')
  await app.close()
})

test('import body 校验：缺 base64 返回 400', async () => {
  const app = buildApp()
  const r = await app.inject({ method: 'POST', url: '/api/products/import', payload: { filename: 'x.csv' } })
  assert.equal(r.statusCode, 400)
  assert.equal(r.json().code, 'VALIDATION_ERROR')
  await app.close()
})

test('订单查询：合法查询正常', async () => {
  const app = buildApp()
  const r = await app.inject({ method: 'GET', url: '/api/orders?status=pending_ship' })
  assert.equal(r.statusCode, 200)
  assert.equal(r.json().success, true)
  await app.close()
})
