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

export interface JobRunRow {
  id: string
  jobId: string
  status: string
  startedAt: string
  finishedAt: string | null
  result: string | null
  error: string | null
}

export function getJobRunById(id: string): JobRunRow | undefined {
  return getDb().prepare('SELECT * FROM job_runs WHERE id = ?').get(id) as JobRunRow | undefined
}

export function createJobRun(jobId: string): JobRunRow {
  const id = randomUUID()
  getDb().prepare('INSERT INTO job_runs (id, jobId) VALUES (?, ?)').run(id, jobId)
  return getJobRunById(id) as JobRunRow
}

export function finishJobRun(
  id: string,
  patch: { status: 'success' | 'failed'; result?: string; error?: string },
): JobRunRow {
  getDb()
    .prepare("UPDATE job_runs SET status = ?, finishedAt = datetime('now'), result = ?, error = ? WHERE id = ?")
    .run(patch.status, patch.result ?? null, patch.error ?? null, id)
  return getJobRunById(id) as JobRunRow
}

export function listJobRuns(jobId?: string, limit = 50): JobRunRow[] {
  if (jobId) {
    return getDb()
      .prepare('SELECT * FROM job_runs WHERE jobId = ? ORDER BY startedAt DESC LIMIT ?')
      .all(jobId, limit) as JobRunRow[]
  }
  return getDb().prepare('SELECT * FROM job_runs ORDER BY startedAt DESC LIMIT ?').all(limit) as JobRunRow[]
}
