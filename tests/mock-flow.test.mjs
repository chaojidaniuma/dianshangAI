import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')
const { listAudit } = await import('../apps/server/dist/repositories/audit.repository.js')
const productSvc = await import('../apps/server/dist/services/product.service.js')
const orderSvc = await import('../apps/server/dist/services/order.service.js')

test('M1 闭环：草稿 → 发布 → 订单 → 发货 → 审计', async () => {
  createAccount({ id: 'demo', platform: 'xianyu', name: '体验账号' })

  // 发布
  const created = productSvc.createProduct({ accountId: 'demo', platform: 'xianyu', title: '316 保温杯', price: 39.9, cost: 20 })
  const productId = created.data.id
  const published = await productSvc.publishProduct(productId)
  assert.equal(published.success, true)
  assert.equal(published.data.status, 'published')
  assert.match(published.data.platformProductId ?? '', /^mock-/)

  // 订单
  await orderSvc.syncMockOrders()
  const list = orderSvc.listOrders()
  assert.equal(list.success, true)
  assert.equal(list.data.length, 3)

  // 发货
  const target = list.data[0]
  const shipped = await orderSvc.shipOrder(target.id, { expressCompany: '顺丰', trackingNumber: 'SF001' })
  assert.equal(shipped.success, true)
  assert.equal(shipped.data.status, 'shipped')

  // 审计
  const audits = listAudit()
  const actions = audits.map((a) => a.action)
  assert.ok(actions.includes('publish'))
  assert.ok(actions.includes('ship'))
})

test('shipOrder 校验：非法输入 / 订单不存在', async () => {
  assert.equal((await orderSvc.shipOrder('nope', { expressCompany: '', trackingNumber: '' })).code, 'ORDER_INVALID')
  assert.equal((await orderSvc.shipOrder('nope', { expressCompany: 'x', trackingNumber: 'y' })).code, 'ORDER_NOT_FOUND')
})
