import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { buildApp } = await import('../apps/server/dist/app.js')
const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')

test('商品 API 全链路：POST → GET → PATCH → DELETE', async () => {
  createAccount({ id: 'xy01', platform: 'xianyu', name: '闲鱼主号' })
  const app = buildApp()

  const created = await app.inject({
    method: 'POST',
    url: '/api/products',
    payload: { accountId: 'xy01', platform: 'xianyu', title: '316 保温杯', price: 39.9, cost: 20 },
  })
  assert.equal(created.statusCode, 200)
  const { id } = created.json().data

  const list = await app.inject({ method: 'GET', url: '/api/products' })
  assert.equal(list.json().data.length, 1)

  const patched = await app.inject({ method: 'PATCH', url: `/api/products/${id}`, payload: { price: 45 } })
  assert.equal(patched.json().data.price, 45)

  const removed = await app.inject({ method: 'DELETE', url: `/api/products/${id}` })
  assert.equal(removed.json().success, true)

  const gone = await app.inject({ method: 'GET', url: `/api/products/${id}` })
  assert.equal(gone.statusCode, 404)

  await app.close()
})

test('POST /api/products 非法输入返回 400 + 错误码', async () => {
  createAccount({ id: 'xy02', platform: 'xianyu', name: '闲鱼号2' })
  const app = buildApp()

  const r = await app.inject({
    method: 'POST',
    url: '/api/products',
    payload: { accountId: 'xy02', platform: 'xianyu', title: 'x', price: 0 },
  })
  assert.equal(r.statusCode, 400)
  assert.equal(r.json().code, 'PRODUCT_INVALID')

  const missing = await app.inject({
    method: 'POST',
    url: '/api/products',
    payload: { accountId: 'not-exist', platform: 'xianyu', title: 'x', price: 10 },
  })
  assert.equal(missing.json().code, 'ACCOUNT_NOT_FOUND')

  await app.close()
})
