import { useQuery } from '@tanstack/react-query'
import { systemApi } from '../api/system'

export default function Analytics() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['audit'], queryFn: systemApi.audit })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">数据</h1>
      {isLoading && <p className="text-gray-500">加载中…</p>}
      {error && <p className="text-red-600">加载失败：{error.message}</p>}
      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">账号</th>
                <th className="px-4 py-3 font-medium">动作</th>
                <th className="px-4 py-3 font-medium">结果</th>
                <th className="px-4 py-3 font-medium">详情</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500">{a.createdAt}</td>
                  <td className="px-4 py-3">{a.accountId ?? '—'}</td>
                  <td className="px-4 py-3">{a.action}</td>
                  <td className="px-4 py-3">{a.result ?? a.error ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.afterValue ?? ''}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    暂无审计记录
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
