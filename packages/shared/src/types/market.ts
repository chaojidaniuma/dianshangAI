import type { Platform } from './platform.js'

export interface MarketItem {
  title: string
  price: number
  sales?: number
  platform: Platform
}
