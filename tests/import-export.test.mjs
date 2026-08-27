import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')
const { importProducts, parseSpreadsheet } = await import('../apps/server/dist/services/import.service.js')
const { toCsv } = await import('../apps/server/dist/services/export.service.js')

test('importProducts：有效导入 + 错误逐条报告', () => {
  createAccount({ id: 'demo', platform: 'xianyu', name: '体验账号' })
  const rows = [
    { 标题: '杯子A', 价格: 20, 成本: 10, 平台: '闲鱼', 账号: 'demo' },
    { 标题: '杯子B', 价格: 0, 成本: 10, 平台: '闲鱼', 账号: 'demo' },
    { 标题: '杯子C', 价格: 30, 成本: 10, 平台: '闲鱼', 账号: 'nope' },
  ]
  const r = importProducts(rows)
  assert.equal(r.imported.length, 1)
  assert.equal(r.errors.length, 2)
  assert.equal(r.imported[0].title, '杯子A')
})

test('parseSpreadsheet 解析 CSV（base64）', () => {
  const csv = '标题,价格,平台\n测试杯,19.9,闲鱼\n'
  const base64 = Buffer.from(csv, 'utf8').toString('base64')
  const rows = parseSpreadsheet('批量上架.csv', base64)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].标题, '测试杯')
})

test('toCsv 带 BOM，中文不乱码', () => {
  const csv = toCsv([{ 标题: '杯子' }], ['标题'])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('标题'))
  assert.ok(csv.includes('杯子'))
})
