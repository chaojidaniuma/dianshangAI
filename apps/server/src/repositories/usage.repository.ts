import { randomUUID } from 'node:crypto'
import { getDb } from '../db/db.js'

export interface UsageRow {
  id: string
  provider: string
  model: string
  accountId: string | null
  feature: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  createdAt: string
}

export interface NewUsage {
  provider: string
  model: string
  accountId?: string
  feature: string
  inputTokens?: number
  outputTokens?: number
  estimatedCost?: number
}

export function createUsage(input: NewUsage): UsageRow {
  const id = randomUUID()
  getDb()
    .prepare(
      `INSERT INTO llm_usage (id, provider, model, accountId, feature, inputTokens, outputTokens, estimatedCost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.provider,
      input.model,
      input.accountId ?? null,
      input.feature,
      input.inputTokens ?? 0,
      input.outputTokens ?? 0,
      input.estimatedCost ?? 0,
    )
  return getDb().prepare('SELECT * FROM llm_usage WHERE id = ?').get(id) as UsageRow
}

export function listUsage(limit = 100): UsageRow[] {
  return getDb().prepare('SELECT * FROM llm_usage ORDER BY createdAt DESC LIMIT ?').all(limit) as UsageRow[]
}
