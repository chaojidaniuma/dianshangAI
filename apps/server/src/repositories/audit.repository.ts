import { randomUUID } from 'node:crypto'
import { getDb } from '../db/db.js'

export interface AuditRow {
  id: string
  accountId: string | null
  action: string
  beforeValue: string | null
  afterValue: string | null
  result: string | null
  error: string | null
  createdAt: string
}

export interface NewAudit {
  accountId?: string
  action: string
  beforeValue?: string
  afterValue?: string
  result?: string
  error?: string
}

export function createAudit(input: NewAudit): AuditRow {
  const id = randomUUID()
  getDb()
    .prepare(
      `INSERT INTO audit_logs (id, accountId, action, beforeValue, afterValue, result, error)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.accountId ?? null,
      input.action,
      input.beforeValue ?? null,
      input.afterValue ?? null,
      input.result ?? null,
      input.error ?? null,
    )
  return getDb().prepare('SELECT * FROM audit_logs WHERE id = ?').get(id) as AuditRow
}

export function listAudit(limit = 100): AuditRow[] {
  return getDb().prepare('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT ?').all(limit) as AuditRow[]
}
