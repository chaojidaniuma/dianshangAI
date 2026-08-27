import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const svc = await import('../apps/server/dist/services/settings.service.js')

test('settings 读写', () => {
  assert.equal(svc.getSettings().data['llm.provider'], undefined)

  svc.updateSettings({ 'llm.provider': 'deepseek', 'llm.apiKey': 'sk-test' })

  assert.equal(svc.getSettings().data['llm.provider'], 'deepseek')
  assert.equal(svc.getSettings().data['llm.apiKey'], 'sk-test')
})

test('settings 非法输入返回错误', () => {
  const r = svc.updateSettings('not-an-object')
  assert.equal(r.success, false)
})
