import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'

const input = 'w-full rounded border border-gray-300 px-3 py-2 text-sm'
const label = 'mb-1 block text-sm text-gray-600'

const LLM_PRESETS = [
  { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { value: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { value: 'zhipu', label: '智谱', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { value: 'qwen', label: '百炼', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { value: 'custom', label: '自定义', baseUrl: '', model: '' },
]

export default function Settings() {
  const qc = useQueryClient()
  const { data = {}, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    setDraft(data)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (input: Record<string, string>) => settingsApi.update(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
  const testMutation = useMutation({
    mutationFn: () => settingsApi.testLlm(),
    onSuccess: (r) => setTestResult(r.message),
    onError: (e) => setTestResult((e as Error).message),
  })

  const set = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }))

  function handlePreset(value: string) {
    const preset = LLM_PRESETS.find((p) => p.value === value)
    setDraft((d) => ({
      ...d,
      'llm.provider': value,
      ...(preset?.baseUrl ? { 'llm.baseUrl': preset.baseUrl } : {}),
      ...(preset?.model ? { 'llm.model': preset.model } : {}),
    }))
  }

  if (isLoading) return <p className="text-gray-500">加载中…</p>

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">设置</h1>

      <div className="max-w-2xl space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">AI 模型</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>供应商</label>
              <select
                className={input}
                value={draft['llm.provider'] ?? ''}
                onChange={(e) => handlePreset(e.target.value)}
              >
                <option value="">未配置</option>
                {LLM_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>模型</label>
              <input className={input} value={draft['llm.model'] ?? ''} onChange={(e) => set('llm.model', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={label}>Base URL</label>
              <input
                className={input}
                value={draft['llm.baseUrl'] ?? ''}
                onChange={(e) => set('llm.baseUrl', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={label}>API Key</label>
              <input
                className={input}
                type="password"
                value={draft['llm.apiKey'] ?? ''}
                onChange={(e) => set('llm.apiKey', e.target.value)}
              />
            </div>
          </div>
          <button
            className="mt-4 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? '测试中…' : '测试连接'}
          </button>
          {testResult && <p className="mt-2 text-sm text-gray-600">{testResult}</p>}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">生图</h2>
          <div>
            <label className={label}>供应商（默认关闭，关闭时用本地海报）</label>
            <select className={input} value={draft['image.provider'] ?? 'off'} onChange={(e) => set('image.provider', e.target.value)}>
              <option value="off">关闭</option>
              <option value="qwen">百炼 wanx</option>
            </select>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold">备份</h2>
          <a href="/api/backup" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700">
            下载数据备份（zip）
          </a>
        </section>

        <div className="flex gap-2">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? '保存中…' : '保存设置'}
          </button>
        </div>
        {saveMutation.error && <p className="text-sm text-red-600">{saveMutation.error.message}</p>}
        {saveMutation.isSuccess && <p className="text-sm text-green-600">已保存</p>}
      </div>
    </div>
  )
}
