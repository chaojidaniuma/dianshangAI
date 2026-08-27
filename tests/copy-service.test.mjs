import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const { generateCopy } = await import('../apps/server/dist/services/copy.service.js')
const { listUsage } = await import('../apps/server/dist/repositories/usage.repository.js')

test('无 provider：走规则模板兜底', async () => {
  const r = await generateCopy({ name: '316 保温杯', platform: 'xianyu' }, null)
  assert.equal(r.source, 'rule')
  assert.ok(r.title.length > 0)
  assert.ok(r.sellingPoints.length > 0)
})

test('provider 抛错：走规则模板兜底', async () => {
  const bad = { async chat() { throw new Error('boom') } }
  const r = await generateCopy({ name: '316 保温杯', platform: 'xianyu' }, bad)
  assert.equal(r.source, 'rule')
})

test('provider 正常：解析 JSON 并记录用量', async () => {
  const fake = {
    async chat() {
      return {
        content: JSON.stringify({ title: 'AI标题', description: 'AI描述', sellingPoints: ['点1', '点2'] }),
        inputTokens: 100,
        outputTokens: 50,
        model: 'test-model',
      }
    },
  }
  const r = await generateCopy({ name: '316 保温杯', platform: 'pinduoduo' }, fake)
  assert.equal(r.source, 'ai')
  assert.equal(r.title, 'AI标题')
  assert.equal(r.sellingPoints.length, 2)

  const usage = listUsage()
  assert.equal(usage.length, 1)
  assert.equal(usage[0].model, 'test-model')
  assert.equal(usage[0].feature, 'copy')
})
