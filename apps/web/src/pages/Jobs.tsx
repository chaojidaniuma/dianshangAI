import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobApi, type Job, type JobRun } from '../api/jobs'

const TYPES = [
  { value: 'daily_report', label: '每日日报' },
  { value: 'health_check', label: '账号体检' },
]

export default function Jobs() {
  const qc = useQueryClient()
  const { data = [], isLoading, error } = useQuery({ queryKey: ['jobs'], queryFn: jobApi.list })

  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('daily_report')
  const [cron, setCron] = useState('0 20 * * *')
  const [runsFor, setRunsFor] = useState<string | null>(null)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['jobs'] })
    if (runsFor) qc.invalidateQueries({ queryKey: ['runs', runsFor] })
  }

  const createMutation = useMutation({
    mutationFn: (input: { name: string; type: string; cron: string }) => jobApi.create(input),
    onSuccess: () => {
      setFormOpen(false)
      setName('')
      invalidate()
    },
  })
  const toggleMutation = useMutation({
    mutationFn: (args: { id: string; isEnabled: boolean }) => jobApi.update(args.id, { isEnabled: args.isEnabled }),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({ mutationFn: (id: string) => jobApi.remove(id), onSuccess: invalidate })
  const runMutation = useMutation({
    mutationFn: (id: string) => jobApi.run(id),
    onSuccess: () => invalidate(),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    createMutation.mutate({ name: name.trim(), type, cron: cron.trim() })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">任务</h1>
        <button onClick={() => setFormOpen((v) => !v)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          新建任务
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">名称</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">类型</label>
              <select className="w-full rounded border border-gray-300 px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Cron 表达式</label>
              <input className="w-full rounded border border-gray-300 px-3 py-2 text-sm" value={cron} onChange={(e) => setCron(e.target.value)} />
            </div>
          </div>
          {createMutation.error && <p className="text-sm text-red-600">{createMutation.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">保存</button>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded border px-4 py-2 text-sm">取消</button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-gray-500">加载中…</p>}
      {error && <p className="text-red-600">加载失败：{error.message}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">名称</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">Cron</th>
                <th className="px-4 py-3 font-medium">启用</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((j: Job) => (
                <tr key={j.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{j.name}</td>
                  <td className="px-4 py-3">{j.type}</td>
                  <td className="px-4 py-3">{j.cron}</td>
                  <td className="px-4 py-3">
                    <button
                      className={j.isEnabled === 1 ? 'text-green-600' : 'text-gray-400'}
                      onClick={() => toggleMutation.mutate({ id: j.id, isEnabled: j.isEnabled !== 1 })}
                    >
                      {j.isEnabled === 1 ? '已启用' : '已停用'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="mr-2 text-blue-600"
                      onClick={() => {
                        setRunsFor(j.id)
                        runMutation.mutate(j.id)
                      }}
                    >
                      执行
                    </button>
                    <button
                      className="mr-2 text-blue-600"
                      onClick={() => setRunsFor(runsFor === j.id ? null : j.id)}
                    >
                      日志
                    </button>
                    <button className="text-red-600" onClick={() => { if (window.confirm(`删除任务「${j.name}」？`)) deleteMutation.mutate(j.id) }}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无任务</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {runMutation.error && <p className="mt-3 text-sm text-red-600">{runMutation.error.message}</p>}

      {runsFor && <RunsView jobId={runsFor} />}
    </div>
  )
}

function RunsView({ jobId }: { jobId: string }) {
  const { data = [] } = useQuery({ queryKey: ['runs', jobId], queryFn: () => jobApi.runs(jobId) })
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-medium text-gray-700">执行记录</h3>
      <table className="w-full text-sm">
        <tbody>
          {data.map((r: JobRun) => (
            <tr key={r.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 text-gray-500">{r.startedAt}</td>
              <td className="py-2 pr-4">
                <span className={r.status === 'success' ? 'text-green-600' : 'text-red-600'}>{r.status}</span>
              </td>
              <td className="py-2 text-gray-600">{r.error ?? r.result ?? ''}</td>
            </tr>
          ))}
          {data.length === 0 && <tr><td className="py-2 text-gray-400">暂无记录</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
