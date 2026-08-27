import { req } from './client'

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

export const reportApi = {
  daily: () => req<DailyReport>('/api/report/daily'),
}
