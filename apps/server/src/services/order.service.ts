import { ShipOrderSchema, type Order, type Result } from '@ecom-agent/shared'
import { getAdapter } from '../adapters/index.js'
import { createAudit } from '../repositories/audit.repository.js'
import * as orders from '../repositories/order.repository.js'

export interface OrderFilter {
  accountId?: string
  status?: string
}

export async function syncMockOrders(): Promise<void> {
  const adapter = getAdapter('xianyu')
  const list = await adapter.listOrders()
  for (const o of list) {
    if (!orders.getOrderById(o.id)) {
      orders.createOrder({
        id: o.id,
        accountId: o.accountId,
        platform: o.platform,
        orderNo: o.orderNo,
        productId: o.productId ?? undefined,
        productTitle: o.productTitle ?? undefined,
        quantity: o.quantity,
        amount: o.amount,
        status: o.status,
      })
    }
  }
}

export function listOrders(filter?: OrderFilter): Result<Order[]> {
  return { success: true, data: orders.listOrders(filter) }
}

export async function shipOrder(orderId: string, input: unknown): Promise<Result<Order>> {
  const parsed = ShipOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'ORDER_INVALID', message: parsed.error.issues[0]?.message ?? '参数错误' }
  }
  const order = orders.getOrderById(orderId)
  if (!order) {
    return { success: false, code: 'ORDER_NOT_FOUND', message: '订单不存在' }
  }
  const { expressCompany, trackingNumber } = parsed.data
  const adapter = getAdapter(order.platform)
  try {
    await adapter.shipOrder({ orderId: order.orderNo, expressCompany, trackingNumber })
    orders.updateOrder(orderId, { status: 'shipped', expressCompany, trackingNumber })
    createAudit({
      accountId: order.accountId,
      action: 'ship',
      beforeValue: JSON.stringify({ status: order.status }),
      afterValue: JSON.stringify({ status: 'shipped', trackingNumber }),
      result: 'success',
    })
    return { success: true, data: orders.getOrderById(orderId) as Order }
  } catch (err) {
    createAudit({ accountId: order.accountId, action: 'ship', result: 'failed', error: (err as Error).message })
    return { success: false, code: 'SHIP_FAILED', message: (err as Error).message }
  }
}
