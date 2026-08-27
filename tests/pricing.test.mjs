import { test } from 'node:test'
import assert from 'node:assert/strict'

const { analyzeMarket, grossMargin, explainPricing } = await import(
  '../apps/server/dist/services/pricing.service.js'
)

test('毛利率公式：成本20 售价40 → 0.5', () => {
  assert.equal(grossMargin(40, 20), 0.5)
  assert.equal(grossMargin(0, 20), 0)
})

test('analyzeMarket 计算统计量与建议价', () => {
  const items = [
    { title: 'a', price: 10, platform: 'xianyu' },
    { title: 'b', price: 20, platform: 'xianyu' },
    { title: 'c', price: 30, platform: 'xianyu' },
    { title: 'd', price: 40, platform: 'xianyu' },
  ]
  const r = analyzeMarket(items, 20)
  assert.equal(r.stats.min, 10)
  assert.equal(r.stats.max, 40)
  assert.equal(r.stats.avg, 25)
  assert.equal(r.stats.median, 25)
  assert.equal(r.suggestedPrice, 23.75)
  assert.equal(r.stats.count, 4)
})

test('空市场不报错', () => {
  const r = analyzeMarket([])
  assert.equal(r.stats.count, 0)
  assert.equal(r.suggestedPrice, 0)
})

test('explainPricing 无 provider 走规则文案', async () => {
  const r = analyzeMarket([{ title: 'a', price: 40, platform: 'xianyu' }], 20)
  const text = await explainPricing(r, 20, null)
  assert.ok(text.includes('建议定价'))
})
