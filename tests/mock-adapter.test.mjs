import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mockAdapter } from '../apps/server/dist/adapters/mock/mock.adapter.js'

test('healthCheck 返回 ok', async () => {
  const r = await mockAdapter.healthCheck('demo')
  assert.equal(r.status, 'ok')
})

test('searchMarket 返回竞品数据', async () => {
  const items = await mockAdapter.searchMarket('保温杯')
  assert.ok(items.length >= 3)
  assert.ok(items.every((i) => i.price > 0))
})

test('createProduct 返回递增 platformProductId', async () => {
  const a = await mockAdapter.createProduct({ accountId: 'demo', title: 'x', price: 10 })
  const b = await mockAdapter.createProduct({ accountId: 'demo', title: 'y', price: 20 })
  assert.match(a.platformProductId, /^mock-/)
  assert.notEqual(a.platformProductId, b.platformProductId)
})

test('listOrders 含 3 条 mock 订单，shipOrder 标记已发货', async () => {
  const orders = await mockAdapter.listOrders()
  assert.equal(orders.length, 3)
  const target = orders[0]
  const r = await mockAdapter.shipOrder({ orderId: target.orderNo, expressCompany: '顺丰', trackingNumber: 'SF123' })
  assert.equal(r.status, 'shipped')
  assert.equal(target.status, 'shipped')
  assert.equal(target.trackingNumber, 'SF123')
})
