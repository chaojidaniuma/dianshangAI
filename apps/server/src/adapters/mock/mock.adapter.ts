import type {
  CreateProductResult,
  HealthResult,
  MarketItem,
  Order,
  PlatformAdapter,
  ShipOrderInput,
  ShipResult,
} from '@ecom-agent/shared'

// 纯内存态，不触达任何真实平台。仅用于演示与测试。
const mockOrders: Order[] = ['001', '002', '003'].map((n) => ({
  id: `mock-${n}`,
  accountId: 'demo',
  platform: 'xianyu',
  orderNo: `MOCK-ORDER-${n}`,
  productId: null,
  productTitle: `测试商品 ${n}`,
  quantity: 1,
  amount: 39.9,
  status: 'pending_ship',
  expressCompany: null,
  trackingNumber: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

let productSeq = 10000

export const mockAdapter: PlatformAdapter = {
  async healthCheck(): Promise<HealthResult> {
    return { status: 'ok', message: 'mock 账号正常' }
  },

  async searchMarket(keyword: string): Promise<MarketItem[]> {
    return [
      { title: `${keyword} 竞品A`, price: 39.9, sales: 120, platform: 'xianyu' },
      { title: `${keyword} 竞品B`, price: 45, sales: 300, platform: 'xianyu' },
      { title: `${keyword} 竞品C`, price: 29.9, sales: 80, platform: 'pinduoduo' },
    ]
  },

  async createProduct(): Promise<CreateProductResult> {
    productSeq += 1
    return { platformProductId: `mock-${productSeq}` }
  },

  async listProducts(): Promise<unknown[]> {
    return []
  },

  async listOrders(): Promise<Order[]> {
    return mockOrders
  },

  async shipOrder(input: ShipOrderInput): Promise<ShipResult> {
    const order = mockOrders.find((o) => o.id === input.orderId || o.orderNo === input.orderId)
    if (!order) {
      throw new Error('订单不存在')
    }
    order.status = 'shipped'
    order.expressCompany = input.expressCompany
    order.trackingNumber = input.trackingNumber
    order.updatedAt = new Date().toISOString()
    return { orderId: order.id, status: 'shipped' }
  },
}
