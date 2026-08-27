import { useState, type FormEvent } from 'react'
import type { Platform, Product, ProductCreateInput } from '@ecom-agent/shared'

interface Props {
  initial?: Product | null
  error?: string | null
  submitting?: boolean
  onSubmit: (values: ProductCreateInput) => void
  onCancel: () => void
}

const input = 'w-full rounded border border-gray-300 px-3 py-2 text-sm'
const label = 'mb-1 block text-sm text-gray-600'

export default function ProductForm({ initial, error, submitting, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? 'xianyu')
  const [accountId, setAccountId] = useState(initial?.accountId ?? 'demo')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [cost, setCost] = useState(initial ? String(initial.cost) : '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      accountId,
      platform,
      title: title.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      cost: Number(cost) || 0,
      category: category.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>标题 *</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={label}>平台</label>
          <select className={input} value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
            <option value="xianyu">闲鱼</option>
            <option value="pinduoduo">拼多多</option>
          </select>
        </div>
        <div>
          <label className={label}>账号</label>
          <input className={input} value={accountId} onChange={(e) => setAccountId(e.target.value)} />
        </div>
        <div>
          <label className={label}>售价 *</label>
          <input
            className={input}
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>成本</label>
          <input
            className={input}
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className={label}>目录</label>
          <input className={input} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={label}>描述</label>
          <textarea className={input} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {submitting ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
        >
          取消
        </button>
      </div>
    </form>
  )
}
