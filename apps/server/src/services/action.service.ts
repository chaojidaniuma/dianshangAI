import { randomBytes } from 'node:crypto'
import { ActionPreviewSchema, ShipOrderSchema, type Result } from '@ecom-agent/shared'
import * as orders from '../repositories/order.repository.js'
import * as products from '../repositories/product.repository.js'
import * as orderSvc from './order.service.js'
import * as productSvc from './product.service.js'

export type ActionName = (typeof ActionPreviewSchema) extends never ? never : 'publish_product' | 'ship_order'

interface PendingAction {
  action: ActionName
  resourceId: string
  accountId: string
  params: Record<string, unknown>
  expiresAt: number
  used: boolean
}

const pending = new Map<string, PendingAction>()

function ttlMs(): number {
  return Number(process.env.ACTION_TTL_MS ?? 5 * 60 * 1000)
}

function resolveAccount(action: ActionName, resourceId: string): string | null {
  if (action === 'publish_product') return products.getProductById(resourceId)?.accountId ?? null
  return orders.getOrderById(resourceId)?.accountId ?? null
}

export interface ActionPreviewData {
  token: string
  action: ActionName
  resourceId: string
  accountId: string
  detail: Record<string, unknown>
}

export function previewAction(input: unknown): Result<ActionPreviewData> {
  const parsed = ActionPreviewSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'ACTION_INVALID', message: parsed.error.issues[0]?.message ?? '参数错误' }
  }
  const { action, resourceId, params = {} } = parsed.data

  let detail: Record<string, unknown>
  if (action === 'publish_product') {
    const product = products.getProductById(resourceId)
    if (!product) return { success: false, code: 'PRODUCT_NOT_FOUND', message: '商品不存在' }
    detail = { title: product.title, price: product.price, status: product.status }
  } else {
    const shipParsed = ShipOrderSchema.safeParse(params)
    if (!shipParsed.success) {
      return { success: false, code: 'ORDER_INVALID', message: shipParsed.error.issues[0]?.message ?? '参数错误' }
    }
    const order = orders.getOrderById(resourceId)
    if (!order) return { success: false, code: 'ORDER_NOT_FOUND', message: '订单不存在' }
    detail = { orderNo: order.orderNo, ...shipParsed.data }
  }

  const accountId = resolveAccount(action, resourceId)
  const token = randomBytes(16).toString('hex')
  pending.set(token, { action, resourceId, accountId: accountId ?? '', params, expiresAt: Date.now() + ttlMs(), used: false })
  return { success: true, data: { token, action, resourceId, accountId: accountId ?? '', detail } }
}

export async function executeAction(token: string): Promise<Result<unknown>> {
  const entry = pending.get(token)
  if (!entry) return { success: false, code: 'ACTION_TOKEN_INVALID', message: '令牌无效' }
  if (entry.used) return { success: false, code: 'ACTION_TOKEN_USED', message: '令牌已使用' }
  if (Date.now() > entry.expiresAt) {
    pending.delete(token)
    return { success: false, code: 'ACTION_TOKEN_EXPIRED', message: '令牌已过期' }
  }

  const currentAccount = resolveAccount(entry.action, entry.resourceId)
  if (!currentAccount) {
    pending.delete(token)
    return { success: false, code: 'ACTION_RESOURCE_MISSING', message: '资源不存在' }
  }
  if (currentAccount !== entry.accountId) {
    pending.delete(token)
    return { success: false, code: 'ACTION_ACCOUNT_MISMATCH', message: '资源所属账号已变更' }
  }

  entry.used = true

  if (entry.action === 'publish_product') {
    return productSvc.publishProduct(entry.resourceId)
  }
  return orderSvc.shipOrder(entry.resourceId, entry.params)
}
