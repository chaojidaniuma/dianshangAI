import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const jobSvc = await import('../apps/server/dist/services/job.service.js')
const { generateDailyReport } = await import('../apps/server/dist/services/report.service.js')
const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')

test('任务 CRUD + cron 校验', () => {
  const created = jobSvc.createJob({ name: '每日日报', type: 'daily_report', cron: '0 20 * * *' })
  assert.equal(created.success, true)

  assert.equal(jobSvc.createJob({ name: 'x', type: 'x', cron: 'not-a-cron' }).code, 'JOB_INVALID')

  const updated = jobSvc.updateJob(created.data.id, { isEnabled: false })
  assert.equal(updated.data.isEnabled, 0)

  assert.equal(jobSvc.deleteJob(created.data.id).success, true)
})

test('任务执行记录 job_runs', async () => {
  const job = jobSvc.createJob({ name: '日报', type: 'daily_report', cron: '0 20 * * *' })
  const run = await jobSvc.runJob(job.data.id)
  assert.equal(run.success, true)
  assert.equal(run.data.status, 'success')

  const runs = jobSvc.listJobRuns(job.data.id)
  assert.equal(runs.data.length, 1)
  assert.ok(runs.data[0].result.includes('products'))
})

test('防重：任务运行中再次触发被拒绝', async () => {
  const job = jobSvc.createJob({ name: '健康检查', type: 'health_check', cron: '0 * * * *' })
  // 直接并发调用两次，第二次应被拒绝
  const [a, b] = await Promise.all([jobSvc.runJob(job.data.id), jobSvc.runJob(job.data.id)])
  const results = [a, b].map((r) => r.success)
  assert.ok(results.includes(false))
})

test('日报统计', () => {
  createAccount({ id: 'demo', platform: 'xianyu', name: 'x' })
  const r = generateDailyReport()
  assert.equal(typeof r.products, 'number')
  assert.equal(typeof r.revenue, 'number')
  assert.equal(r.profit, Math.round((r.revenue - r.aiCost) * 100) / 100)
})
