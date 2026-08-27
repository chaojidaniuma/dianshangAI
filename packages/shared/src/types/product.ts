import type { Platform } from './platform.js'

export interface Product {
  id: string
  accountId: string
  platform: Platform
  title: string
  description: string | null
  price: number
  cost: number
  category: string | null
  status: string
  platformProductId: string | null
  createdAt: string
  updatedAt: string
}
