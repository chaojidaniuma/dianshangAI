import { randomUUID } from 'node:crypto'
import { getDb } from '../db/db.js'
import { updateRow } from './utils.js'

export interface ProductRow {
  id: string
  accountId: string
  platform: string
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

export interface NewProduct {
  accountId: string
  platform: string
  title: string
  description?: string
  price: number
  cost: number
  category?: string
  status?: string
}

export interface ProductFilter {
  accountId?: string
  platform?: string
}

export function createProduct(input: NewProduct): ProductRow {
  const id = randomUUID()
  getDb()
    .prepare(
      `INSERT INTO products (id, accountId, platform, title, description, price, cost, category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.accountId,
      input.platform,
      input.title,
      input.description ?? null,
      input.price,
      input.cost,
      input.category ?? null,
      input.status ?? 'draft',
    )
  return getProductById(id) as ProductRow
}

export function getProductById(id: string): ProductRow | undefined {
  return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined
}

export function listProducts(filter?: ProductFilter): ProductRow[] {
  const where: string[] = []
  const params: string[] = []
  if (filter?.accountId) {
    where.push('accountId = ?')
    params.push(filter.accountId)
  }
  if (filter?.platform) {
    where.push('platform = ?')
    params.push(filter.platform)
  }
  const sql = `SELECT * FROM products${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY createdAt DESC`
  return getDb().prepare(sql).all(...params) as ProductRow[]
}

export function updateProduct(
  id: string,
  patch: Partial<Omit<ProductRow, 'id' | 'createdAt' | 'updatedAt'>>,
): ProductRow | undefined {
  updateRow('products', id, patch)
  return getProductById(id)
}

export function deleteProduct(id: string): boolean {
  return getDb().prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0
}
