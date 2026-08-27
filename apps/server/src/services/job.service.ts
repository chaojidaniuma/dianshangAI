import cron from 'node-cron'
import type { Result } from '@ecom-agent/shared'
import * as jobs from '../repositories/job.repository.js'
import type { JobRow, JobRunRow } from '../repositories/job.repository.js'
import * as accountSvc from './account.service.js'
import { generateDailyReport } from './report.service.js'

const running = new Set<string>()

export interface NewJobInput {
  name: string
  type: string
  cron: string
  accountId?: string
  config?: string
}

const handlers: Record<string, (job: JobRow) => Promise<string>> = {
  daily_report: async () => JSON.stringify(generateDailyReport()),
  health_check: async () => {
    const result = accountSvc.listAccounts()
    if (!result.success) return '获取账号失败'
    for (const a of result.data) await accountSvc.checkAccountHealth(a.id)
    return `已检查 ${result.data.length} 个账号`
  },
}

export function listJobs(): Result<JobRow[]> {
  return { success: true, data: jobs.listJobs() }
}

export function createJob(input: unknown): Result<JobRow> {
  const data = input as NewJobInput
  if (!data || typeof data !== 'object' || !data.name || !data.type || !data.cron) {
    return { success: false, code: 'JOB_INVALID', message: '缺少 name/type/cron' }
  }
  if (!cron.validate(data.cron)) {
    return { success: false, code: 'JOB_INVALID', message: 'cron 表达式无效' }
  }
  return { success: true, data: jobs.createJob({ ...data }) }
}

export function updateJob(id: string, input: unknown): Result<JobRow> {
  const existing = jobs.getJobById(id)
  if (!existing) {
    return { success: false, code: 'JOB_NOT_FOUND', message: '任务不存在' }
  }
  const data = (input ?? {}) as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  if (typeof data.name === 'string') patch.name = data.name
  if (typeof data.cron === 'string') {
    if (!cron.validate(data.cron)) return { success: false, code: 'JOB_INVALID', message: 'cron 表达式无效' }
    patch.cron = data.cron
  }
  if (typeof data.isEnabled === 'boolean') patch.isEnabled = data.isEnabled ? 1 : 0
  if (typeof data.config === 'string') patch.config = data.config
  const row = jobs.updateJob(id, patch)
  return { success: true, data: row as JobRow }
}

export function deleteJob(id: string): Result<{ id: string }> {
  if (!jobs.getJobById(id)) {
    return { success: false, code: 'JOB_NOT_FOUND', message: '任务不存在' }
  }
  jobs.deleteJob(id)
  return { success: true, data: { id } }
}

export async function runJob(id: string): Promise<Result<JobRunRow>> {
  const job = jobs.getJobById(id)
  if (!job) {
    return { success: false, code: 'JOB_NOT_FOUND', message: '任务不存在' }
  }
  if (running.has(id)) {
    return { success: false, code: 'JOB_ALREADY_RUNNING', message: '任务正在执行中' }
  }
  running.add(id)
  const run = jobs.createJobRun(id)
  try {
    const handler = handlers[job.type]
    const result = handler ? await handler(job) : '无对应处理器'
    return { success: true, data: jobs.finishJobRun(run.id, { status: 'success', result }) }
  } catch (err) {
    jobs.finishJobRun(run.id, { status: 'failed', error: (err as Error).message })
    return { success: false, code: 'JOB_FAILED', message: (err as Error).message }
  } finally {
    running.delete(id)
  }
}

export function listJobRuns(jobId?: string): Result<JobRunRow[]> {
  return { success: true, data: jobs.listJobRuns(jobId) }
}

export function startScheduler(): void {
  for (const job of jobs.listJobs()) {
    if (job.isEnabled === 1 && cron.validate(job.cron)) {
      cron.schedule(job.cron, () => {
        void runJob(job.id)
      })
    }
  }
}
