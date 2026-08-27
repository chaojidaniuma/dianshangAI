import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, rmSync } from 'node:fs'
import { createBackup } from '../apps/server/dist/services/backup.service.js'

test('createBackup 生成 zip 文件', () => {
  const r = createBackup()
  assert.match(r.filename, /^backup-.*\.zip$/)
  assert.ok(existsSync(r.path))
  assert.ok(r.size > 0)
  rmSync(r.path, { force: true })
})
