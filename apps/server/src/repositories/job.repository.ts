import { randomUUID } from 'node:crypto'
import { getDb } from '../db/db.js'
import { updateRow } from './utils.js'

export interface JobRow {
  id: string
  name: string
  type: string
  cron: string
  accountId: string | null
  config: string | null
  isEnabled: number
  createdAt: string
  updatedAt: string
}

export interface NewJob {
  name: string
  type: string
  cron: string
  accountId?: string
  config?: string
  isEnabled?: number
}

export function createJob(input: NewJob): JobRow {
  const id = randomUUID()
  getDb()
    .prepare(
      `INSERT INTO jobs (id, name, type, cron, accountId, config, isEnabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.name, input.type, input.cron, input.accountId ?? null, input.config ?? null, input.isEnabled ?? 1)
  return getJobById(id) as JobRow
}

export function getJobById(id: string): JobRow | undefined {
  return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow | undefined
}

export function listJobs(): JobRow[] {
  return getDb().prepare('SELECT * FROM jobs ORDER BY createdAt').all() as JobRow[]
}

export function updateJob(
  id: string,
  patch: Partial<Omit<JobRow, 'id' | 'createdAt' | 'updatedAt'>>,
): JobRow | undefined {
  updateRow('jobs', id, patch)
  return getJobById(id)
}

export function deleteJob(id: string): boolean {
  return getDb().prepare('DELETE FROM jobs WHERE id = ?').run(id).changes > 0
}
