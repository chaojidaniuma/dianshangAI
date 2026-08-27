import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')
const { createProduct, getProductById, updateProduct } = await import(
  '../apps/server/dist/repositories/product.repository.js'
)
const { listOrders } = await import('../apps/server/dist/repositories/order.repository.js')
const { syncMockOrders } = await import('../apps/server/dist/services/order.service.js')
const actionSvc = await import('../apps/server/dist/services/action.service.js')

test('正常链路：preview → execute 发布，令牌一次性', async () => {
  createAccount({ id: 'demo1', platform: 'xianyu', name: '体验账号' })
  const p = createProduct({ accountId: 'demo1', platform: 'xianyu', title: '杯子', price: 10, cost: 5 })

  const preview = actionSvc.previewAction({ action: 'publish_product', resourceId: p.id })
  assert.equal(preview.success, true)
  assert.ok(preview.data.token)
  assert.equal(preview.data.accountId, 'demo1')

  const exe = await actionSvc.executeAction(preview.data.token)
  assert.equal(exe.success, true)
  assert.equal(exe.data.status, 'published')

  const again = await actionSvc.executeAction(preview.data.token)
  assert.equal(again.code, 'ACTION_TOKEN_USED')
})

test('过期令牌被拒绝，Adapter 未调用（商品仍 draft）', async () => {
  createAccount({ id: 'demo2', platform: 'xianyu', name: '体验账号' })
  const p = createProduct({ accountId: 'demo2', platform: 'xianyu', title: '杯子', price: 10, cost: 5 })

  process.env.ACTION_TTL_MS = '1'
  const preview = actionSvc.previewAction({ action: 'publish_product', resourceId: p.id })
  await new Promise((r) => setTimeout(r, 10))
  const exe = await actionSvc.executeAction(preview.data.token)
  assert.equal(exe.code, 'ACTION_TOKEN_EXPIRED')
  assert.equal(getProductById(p.id).status, 'draft')
  delete process.env.ACTION_TTL_MS
})

test('错误资源 / 账号不匹配被拒绝，Adapter 未调用', async () => {
  createAccount({ id: 'demo3', platform: 'xianyu', name: '体验账号' })
  createAccount({ id: 'other', platform: 'xianyu', name: '其他号' })
  const p = createProduct({ accountId: 'demo3', platform: 'xianyu', title: '杯子', price: 10, cost: 5 })

  assert.equal(actionSvc.previewAction({ action: 'publish_product', resourceId: 'nope' }).code, 'PRODUCT_NOT_FOUND')

  const preview = actionSvc.previewAction({ action: 'publish_product', resourceId: p.id })
  updateProduct(p.id, { accountId: 'other' })
  const exe = await actionSvc.executeAction(preview.data.token)
  assert.equal(exe.code, 'ACTION_ACCOUNT_MISMATCH')
  assert.equal(getProductById(p.id).status, 'draft')
})

test('发货正常链路：preview → execute', async () => {
  createAccount({ id: 'demo', platform: 'xianyu', name: '体验账号' })
  await syncMockOrders()
  const order = listOrders()[0]
  const preview = actionSvc.previewAction({
    action: 'ship_order',
    resourceId: order.id,
    params: { expressCompany: '顺丰', trackingNumber: 'SF001' },
  })
  assert.equal(preview.success, true)

  const exe = await actionSvc.executeAction(preview.data.token)
  assert.equal(exe.success, true)
  assert.equal(exe.data.status, 'shipped')
})

test('发货参数非法：preview 阶段即拒绝', async () => {
  await syncMockOrders()
  const order = listOrders()[0]
  const preview = actionSvc.previewAction({ action: 'ship_order', resourceId: order.id, params: { expressCompany: '' } })
  assert.equal(preview.code, 'ORDER_INVALID')
})
