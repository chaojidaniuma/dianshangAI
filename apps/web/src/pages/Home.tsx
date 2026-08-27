import { useQuery } from '@tanstack/react-query'
import { reportApi } from '../api/report'

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
    </div>
  )
}

export default function Home() {
  const { data, isLoading } = useQuery({ queryKey: ['report'], queryFn: reportApi.daily })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">首页</h1>
      {isLoading && <p className="text-gray-500">加载中…</p>}
      {data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card label="商品数" value={data.products} />
            <Card label="订单数" value={data.orders} />
            <Card label="已发货" value={data.shipped} />
            <Card label="营收" value={`¥${data.revenue}`} />
            <Card label="商品成本" value={`¥${data.productCost}`} />
            <Card label="AI 费用" value={`¥${data.aiCost}`} />
            <Card label="利润" value={`¥${data.profit}`} hint="未含广告费/佣金/运费" />
          </div>
          {data.unaccounted.length > 0 && (
            <p className="mt-3 text-sm text-gray-400">
              暂未计价：{data.unaccounted.join('、')}（有数据后计入利润）
            </p>
          )}
        </>
      )}
    </div>
  )
}
