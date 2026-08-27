import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const svc = await import('../apps/server/dist/services/account.service.js')

test('账号 CRUD + 健康检查', async () => {
  const created = svc.createAccount({ id: 'xy01', platform: 'xianyu', name: '闲鱼主号' })
  assert.equal(created.success, true)
  assert.equal(created.data.isEnabled, true)

  // 重复创建
  assert.equal(svc.createAccount({ id: 'xy01', platform: 'xianyu', name: 'x' }).code, 'ACCOUNT_EXISTS')

  // 更新（含停用）
  const updated = svc.updateAccount('xy01', { name: '闲鱼号2', isEnabled: false })
  assert.equal(updated.data.name, '闲鱼号2')
  assert.equal(updated.data.isEnabled, false)

  // 列表
  assert.equal(svc.listAccounts().data.length, 1)

  // 健康检查
  const health = await svc.checkAccountHealth('xy01')
  assert.equal(health.success, true)
  assert.equal(health.data.status, 'ok')

  // 删除
  assert.equal(svc.deleteAccount('xy01').success, true)
  assert.equal(svc.listAccounts().data.length, 0)
})
