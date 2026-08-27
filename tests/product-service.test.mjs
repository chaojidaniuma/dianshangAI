import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')
const svc = await import('../apps/server/dist/services/product.service.js')

test('createProduct：price<=0 / cost<0 / 账号不存在 均拒绝', () => {
  assert.equal(svc.createProduct({ accountId: 'nope', platform: 'xianyu', title: 'x', price: 10 }).code, 'ACCOUNT_NOT_FOUND')

  createAccount({ id: 'xy01', platform: 'xianyu', name: '闲鱼主号' })

  assert.equal(svc.createProduct({ accountId: 'xy01', platform: 'xianyu', title: 'x', price: 0 }).success, false)
  assert.equal(svc.createProduct({ accountId: 'xy01', platform: 'xianyu', title: 'x', price: 10, cost: -1 }).success, false)
  assert.equal(svc.createProduct({ accountId: 'xy01', platform: 'taobao', title: 'x', price: 10 }).success, false)
})

test('createProduct：合法输入成功，cost 默认 0', () => {
  createAccount({ id: 'xy02', platform: 'pinduoduo', name: '拼多多店' })
  const r = svc.createProduct({ accountId: 'xy02', platform: 'pinduoduo', title: '316 保温杯', price: 39.9 })
  assert.equal(r.success, true)
  assert.equal(r.data.cost, 0)
  assert.equal(r.data.status, 'draft')
})

test('get/update/delete 全链路', () => {
  createAccount({ id: 'xy03', platform: 'xianyu', name: '闲鱼号3' })
  const created = svc.createProduct({ accountId: 'xy03', platform: 'xianyu', title: '杯子', price: 20 })
  const id = created.data.id

  assert.equal(svc.getProduct(id).success, true)

  const upd = svc.updateProduct(id, { price: 25, cost: 10 })
  assert.equal(upd.success, true)
  assert.equal(upd.data.price, 25)

  assert.equal(svc.updateProduct('missing', { price: 1 }).code, 'PRODUCT_NOT_FOUND')

  assert.equal(svc.deleteProduct(id).success, true)
  assert.equal(svc.getProduct(id).code, 'PRODUCT_NOT_FOUND')
  assert.equal(svc.deleteProduct(id).code, 'PRODUCT_NOT_FOUND')
})
