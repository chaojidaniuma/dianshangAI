import { getDb } from '../db/db.js'

export interface DailyReport {
  products: number
  orders: number
  shipped: number
  revenue: number
  productCost: number
  aiCost: number
  adCost: number | null
  platformFee: number | null
  shippingFee: number | null
  profit: number
  unaccounted: string[]
}

const UNACCOUNTED = ['广告费', '平台佣金', '运费']

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// 净利润 = 已发货营收 - 商品成本 - AI 费用。
// 广告费/平台佣金/运费暂无数据来源，返回 null 并列入 unaccounted，不伪装成完整净利润。
export function generateDailyReport(): DailyReport {
  const db = getDb()
  const one = <T>(sql: string): T => db.prepare(sql).get() as T
  const products = one<{ c: number }>('SELECT COUNT(*) AS c FROM products').c
  const orders = one<{ c: number }>('SELECT COUNT(*) AS c FROM orders').c
  const shipped = one<{ c: number }>("SELECT COUNT(*) AS c FROM orders WHERE status = 'shipped'").c
  const revenue = one<{ s: number }>("SELECT COALESCE(SUM(amount), 0) AS s FROM orders WHERE status = 'shipped'").s
  const productCost = one<{ s: number }>(
    "SELECT COALESCE(SUM(o.quantity * p.cost), 0) AS s FROM orders o JOIN products p ON o.productId = p.id WHERE o.status = 'shipped'",
  ).s
  const aiCost = one<{ s: number }>('SELECT COALESCE(SUM(estimatedCost), 0) AS s FROM llm_usage').s

  return {
    products,
    orders,
    shipped,
    revenue: round2(revenue),
    productCost: round2(productCost),
    aiCost: round2(aiCost),
    adCost: null,
    platformFee: null,
    shippingFee: null,
    profit: round2(revenue - productCost - aiCost),
    unaccounted: UNACCOUNTED,
  }
}
