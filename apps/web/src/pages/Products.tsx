import { useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product, ProductCreateInput, ProductUpdateInput } from '@ecom-agent/shared'
import { productApi } from '../api/products'
import ProductForm from '../components/ProductForm'

const PAGE_SIZE = 10

const marginOf = (p: Product) => (p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0)

export default function Products() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data = [], isLoading, error } = useQuery({ queryKey: ['products'], queryFn: productApi.list })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products'] })

  const createMutation = useMutation({
    mutationFn: (input: ProductCreateInput) => productApi.create(input),
    onSuccess: () => {
      setFormOpen(false)
      invalidate()
    },
  })
  const updateMutation = useMutation({
    mutationFn: (args: { id: string; input: ProductUpdateInput }) => productApi.update(args.id, args.input),
    onSuccess: () => {
      setEditing(null)
      invalidate()
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: invalidate,
  })
  const publishMutation = useMutation({
    mutationFn: (id: string) => productApi.publish(id),
    onSuccess: invalidate,
  })

  const filtered = data.filter((p) => {
    if (search && !p.title.includes(search)) return false
    if (platformFilter && p.platform !== platformFilter) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const formError =
    createMutation.error?.message ?? updateMutation.error?.message ?? null

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const base64 = dataUrl.split(',')[1] ?? ''
    try {
      const r = await productApi.import(file.name, base64)
      setImportResult(`成功导入 ${r.imported} 条${r.errors.length ? `，${r.errors.length} 条错误` : ''}`)
      invalidate()
    } catch (err) {
      setImportResult(`导入失败：${(err as Error).message}`)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">商品</h1>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
          >
            批量导入
          </button>
          <a
            href="/api/export/products"
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
          >
            导出 CSV
          </a>
          <button
            onClick={() => {
              setEditing(null)
              setFormOpen((v) => !v)
            }}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
          >
            新建商品
          </button>
        </div>
      </div>

      {importResult && (
        <p className="mb-4 rounded bg-gray-100 px-3 py-2 text-sm text-gray-700">{importResult}</p>
      )}

      {formOpen && (
        <div className="mb-6">
          <ProductForm
            error={formError}
            submitting={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate(values)}
            onCancel={() => setFormOpen(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-700">编辑商品</h2>
          <ProductForm
            initial={editing}
            error={formError}
            submitting={updateMutation.isPending}
            onSubmit={(values) => updateMutation.mutate({ id: editing.id, input: values })}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="搜索标题"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          value={platformFilter}
          onChange={(e) => {
            setPlatformFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="">全部平台</option>
          <option value="xianyu">闲鱼</option>
          <option value="pinduoduo">拼多多</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-500">加载中…</p>}
      {error && <p className="text-red-600">加载失败：{error.message}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">账号</th>
                <th className="px-4 py-3 font-medium">售价</th>
                <th className="px-4 py-3 font-medium">成本</th>
                <th className="px-4 py-3 font-medium">毛利率</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">更新时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3">{p.platform === 'xianyu' ? '闲鱼' : '拼多多'}</td>
                  <td className="px-4 py-3">{p.accountId}</td>
                  <td className="px-4 py-3">¥{p.price}</td>
                  <td className="px-4 py-3">¥{p.cost}</td>
                  <td className="px-4 py-3">{marginOf(p).toFixed(1)}%</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{p.updatedAt}</td>
                  <td className="px-4 py-3">
                    {p.status === 'draft' && (
                      <button
                        className="mr-2 text-green-600"
                        onClick={() => {
                          if (window.confirm(`确认发布「${p.title}」到 ${p.platform === 'xianyu' ? '闲鱼' : '拼多多'}？`))
                            publishMutation.mutate(p.id)
                        }}
                      >
                        发布
                      </button>
                    )}
                    <button
                      className="mr-2 text-blue-600"
                      onClick={() => {
                        setFormOpen(false)
                        setEditing(p)
                      }}
                    >
                      编辑
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => {
                        if (window.confirm(`确定删除「${p.title}」？`)) deleteMutation.mutate(p.id)
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    暂无商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <button
          className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          上一页
        </button>
        <span className="text-gray-600">
          {currentPage} / {totalPages}
        </span>
        <button
          className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  )
}
