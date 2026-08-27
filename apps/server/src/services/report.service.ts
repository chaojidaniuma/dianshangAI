import { getDb } from '../db/db.js'

export interface DailyReport {
  products: number
  orders: number
  shipped: number
  revenue: number
  aiCost: number
  profit: number
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ponytail: 商品成本/广告花费暂不计入利润（无可靠的订单↔商品成本映射），仅扣 AI 费用。
export function generateDailyReport(): DailyReport {
  const db = getDb()
  const one = <T>(sql: string): T => db.prepare(sql).get() as T
  const products = one<{ c: number }>('SELECT COUNT(*) AS c FROM products').c
  const orders = one<{ c: number }>('SELECT COUNT(*) AS c FROM orders').c
  const shipped = one<{ c: number }>("SELECT COUNT(*) AS c FROM orders WHERE status = 'shipped'").c
  const revenue = one<{ s: number }>("SELECT COALESCE(SUM(amount), 0) AS s FROM orders WHERE status = 'shipped'").s
  const aiCost = one<{ s: number }>('SELECT COALESCE(SUM(estimatedCost), 0) AS s FROM llm_usage').s
  return {
    products,
    orders,
    shipped,
    revenue: round2(revenue),
    aiCost: round2(aiCost),
    profit: round2(revenue - aiCost),
  }
}
