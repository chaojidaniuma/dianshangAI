import { test } from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import { migrate, migrations } from '../apps/server/dist/db/migrations.js'

const EXPECTED_TABLES = [
  'accounts',
  'products',
  'product_images',
  'orders',
  'jobs',
  'job_runs',
  'llm_usage',
  'price_snapshots',
  'audit_logs',
  'settings',
  'categories',
]

test('migration 建立全部业务表 + schema_migrations', () => {
  const db = new Database(':memory:')
  migrate(db)

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name)

  for (const t of [...EXPECTED_TABLES, 'schema_migrations']) {
    assert.ok(tables.includes(t), `缺少表 ${t}`)
  }
  db.close()
})

test('migration 幂等：重复执行不报错、不重复应用', () => {
  const db = new Database(':memory:')
  migrate(db)
  migrate(db)

  const count = db.prepare('SELECT COUNT(*) AS c FROM schema_migrations').get().c
  assert.equal(count, migrations.length)
  db.close()
})
