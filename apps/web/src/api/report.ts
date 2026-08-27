import { req } from './client'

export interface DailyReport {
  products: number
  orders: number
  shipped: number
  revenue: number
  aiCost: number
  profit: number
}

export const reportApi = {
  daily: () => req<DailyReport>('/api/report/daily'),
}
