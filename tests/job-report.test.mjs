import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_PATH = ':memory:'

const jobSvc = await import('../apps/server/dist/services/job.service.js')
const { generateDailyReport } = await import('../apps/server/dist/services/report.service.js')
const { createAccount } = await import('../apps/server/dist/repositories/account.repository.js')
const { createProduct } = await import('../apps/server/dist/repositories/product.repository.js')
const { createOrder } = await import('../apps/server/dist/repositories/order.repository.js')

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

test('日报统计：营收/成本/利润口径', () => {
  createAccount({ id: 'demo', platform: 'xianyu', name: 'x' })
  const p = createProduct({ accountId: 'demo', platform: 'xianyu', title: '杯子', price: 40, cost: 20 })
  createOrder({ accountId: 'demo', platform: 'xianyu', orderNo: 'T1', productId: p.id, quantity: 2, amount: 80, status: 'shipped' })

  const r = generateDailyReport()
  assert.equal(r.revenue, 80)
  assert.equal(r.productCost, 40) // 2 * 20
  assert.equal(r.profit, Math.round((80 - 40 - r.aiCost) * 100) / 100)
  assert.equal(r.adCost, null)
  assert.equal(r.platformFee, null)
  assert.equal(r.shippingFee, null)
  assert.ok(r.unaccounted.length > 0)
})
