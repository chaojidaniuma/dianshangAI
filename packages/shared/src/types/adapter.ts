import type { Order } from './order.js'
import type { MarketItem } from './market.js'

export interface HealthResult {
  status: 'ok' | 'warning' | 'expired'
  message: string
}

export interface CreateProductInput {
  accountId: string
  title: string
  description?: string
  price: number
  cost?: number
  category?: string
}

export interface CreateProductResult {
  platformProductId: string
}

export interface ShipOrderInput {
  orderId: string
  expressCompany: string
  trackingNumber: string
}

export interface ShipResult {
  orderId: string
  status: string
}

export interface PlatformAdapter {
  healthCheck(accountId: string): Promise<HealthResult>
  searchMarket(keyword: string): Promise<MarketItem[]>
  createProduct(input: CreateProductInput): Promise<CreateProductResult>
  listProducts(): Promise<unknown[]>
  listOrders(): Promise<Order[]>
  shipOrder(input: ShipOrderInput): Promise<ShipResult>
}
