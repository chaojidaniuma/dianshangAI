import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Account, Platform } from '@ecom-agent/shared'
import { accountApi } from '../api/accounts'

const statusBadge: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-600',
}

export default function Accounts() {
  const qc = useQueryClient()
  const { data = [], isLoading, error } = useQuery({ queryKey: ['accounts'], queryFn: accountApi.list })

  const [formOpen, setFormOpen] = useState(false)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<Platform>('xianyu')
  const [credential, setCredential] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['accounts'] })

  const createMutation = useMutation({
    mutationFn: (input: { id: string; platform: string; name: string; credential?: string }) =>
      accountApi.create(input),
    onSuccess: () => {
      setFormOpen(false)
      setId('')
      setName('')
      setCredential('')
      invalidate()
    },
  })
  const toggleMutation = useMutation({
    mutationFn: (args: { id: string; isEnabled: boolean }) =>
      accountApi.update(args.id, { isEnabled: args.isEnabled }),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountApi.remove(id),
    onSuccess: invalidate,
  })
  const healthMutation = useMutation({
    mutationFn: (id: string) => accountApi.health(id),
    onSuccess: invalidate,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    createMutation.mutate({ id: id.trim(), platform, name: name.trim(), credential: credential || undefined })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">账号</h1>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
        >
          添加账号
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">账号 ID</label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="如 xy01"
                required
              />
            </div>
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
              <label className="mb-1 block text-sm text-gray-600">平台</label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <option value="xianyu">闲鱼</option>
                <option value="pinduoduo">拼多多</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="mb-1 block text-sm text-gray-600">凭据（Cookie/Token，可留空）</label>
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={2}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
            </div>
          </div>
          {createMutation.error && <p className="text-sm text-red-600">{createMutation.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
              保存
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded border px-4 py-2 text-sm">
              取消
            </button>
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
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">启用</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: Account) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.id}</td>
                  <td className="px-4 py-3">{a.platform === 'xianyu' ? '闲鱼' : '拼多多'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs ${statusBadge[a.status] ?? statusBadge.unknown}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={a.isEnabled ? 'text-green-600' : 'text-gray-400'}
                      onClick={() => toggleMutation.mutate({ id: a.id, isEnabled: !a.isEnabled })}
                    >
                      {a.isEnabled ? '已启用' : '已停用'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button className="mr-2 text-blue-600" onClick={() => healthMutation.mutate(a.id)}>
                      检测
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => {
                        if (window.confirm(`确定删除账号「${a.name}」？`)) deleteMutation.mutate(a.id)
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    暂无账号
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
