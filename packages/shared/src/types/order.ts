import type { Platform } from './platform.js'

export interface Order {
  id: string
  accountId: string
  platform: Platform
  orderNo: string
  productId: string | null
  productTitle: string | null
  quantity: number
  amount: number
  status: string
  expressCompany: string | null
  trackingNumber: string | null
  createdAt: string
  updatedAt: string
}
