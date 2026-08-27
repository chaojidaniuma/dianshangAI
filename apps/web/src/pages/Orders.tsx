import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@ecom-agent/shared'
import { orderApi } from '../api/orders'

const statusLabel = (s: string) =>
  s === 'shipped' ? '已发货' : s === 'pending_ship' ? '待发货' : s

export default function Orders() {
  const qc = useQueryClient()
  const { data = [], isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: orderApi.list })

  const [shipping, setShipping] = useState<Order | null>(null)
  const [expressCompany, setExpressCompany] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const shipMutation = useMutation({
    mutationFn: (args: { id: string; body: { expressCompany: string; trackingNumber: string } }) =>
      orderApi.ship(args.id, args.body),
    onSuccess: () => {
      setShipping(null)
      setExpressCompany('')
      setTrackingNumber('')
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">订单</h1>

      {isLoading && <p className="text-gray-500">加载中…</p>}
      {error && <p className="text-red-600">加载失败：{error.message}</p>}
      {shipMutation.error && <p className="text-red-600">发货失败：{shipMutation.error.message}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">数量</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">账号</th>
                <th className="px-4 py-3 font-medium">平台</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{o.orderNo}</td>
                  <td className="px-4 py-3">{o.productTitle ?? '—'}</td>
                  <td className="px-4 py-3">{o.quantity}</td>
                  <td className="px-4 py-3">¥{o.amount}</td>
                  <td className="px-4 py-3">{statusLabel(o.status)}</td>
                  <td className="px-4 py-3">{o.accountId}</td>
                  <td className="px-4 py-3">{o.platform === 'xianyu' ? '闲鱼' : '拼多多'}</td>
                  <td className="px-4 py-3">
                    {o.status === 'pending_ship' && (
                      <button className="text-blue-600" onClick={() => setShipping(o)}>
                        发货
                      </button>
                    )}
                    {o.status === 'shipped' && (
                      <span className="text-gray-400">
                        {o.expressCompany} {o.trackingNumber}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    暂无订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {shipping && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="w-96 rounded-lg bg-white p-6">
            <h2 className="mb-4 text-base font-semibold">确认发货</h2>
            <p className="mb-3 text-sm text-gray-600">订单号：{shipping.orderNo}</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">物流公司</label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={expressCompany}
                  onChange={(e) => setExpressCompany(e.target.value)}
                  placeholder="如：顺丰"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">运单号</label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="如：SF123456789"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                disabled={shipMutation.isPending || !expressCompany || !trackingNumber}
                onClick={() =>
                  shipMutation.mutate({ id: shipping.id, body: { expressCompany, trackingNumber } })
                }
              >
                {shipMutation.isPending ? '发货中…' : '确认发货'}
              </button>
              <button
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
                onClick={() => setShipping(null)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
