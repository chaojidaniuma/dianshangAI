import { randomUUID } from 'node:crypto'
import type { Order } from '@ecom-agent/shared'
import { getDb } from '../db/db.js'
import { updateRow } from './utils.js'

export type OrderRow = Order

export interface NewOrder {
  accountId: string
  platform: string
  orderNo: string
  productId?: string
  productTitle?: string
  quantity?: number
  amount?: number
  status?: string
}

export interface OrderFilter {
  accountId?: string
  status?: string
}

export function createOrder(input: NewOrder): OrderRow {
  const id = randomUUID()
  getDb()
    .prepare(
      `INSERT INTO orders (id, accountId, platform, orderNo, productId, productTitle, quantity, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.accountId,
      input.platform,
      input.orderNo,
      input.productId ?? null,
      input.productTitle ?? null,
      input.quantity ?? 1,
      input.amount ?? 0,
      input.status ?? 'pending_ship',
    )
  return getOrderById(id) as OrderRow
}

export function getOrderById(id: string): OrderRow | undefined {
  return getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined
}

export function listOrders(filter?: OrderFilter): OrderRow[] {
  const where: string[] = []
  const params: string[] = []
  if (filter?.accountId) {
    where.push('accountId = ?')
    params.push(filter.accountId)
  }
  if (filter?.status) {
    where.push('status = ?')
    params.push(filter.status)
  }
  const sql = `SELECT * FROM orders${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY createdAt DESC`
  return getDb().prepare(sql).all(...params) as OrderRow[]
}

export function updateOrder(
  id: string,
  patch: Partial<Omit<OrderRow, 'id' | 'createdAt' | 'updatedAt'>>,
): OrderRow | undefined {
  updateRow('orders', id, patch)
  return getOrderById(id)
}

export function deleteOrder(id: string): boolean {
  return getDb().prepare('DELETE FROM orders WHERE id = ?').run(id).changes > 0
}
