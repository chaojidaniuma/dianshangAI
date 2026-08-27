import { ProductCreateSchema, ProductUpdateSchema, type Result } from '@ecom-agent/shared'
import * as accounts from '../repositories/account.repository.js'
import * as products from '../repositories/product.repository.js'
import type { ProductFilter, ProductRow } from '../repositories/product.repository.js'

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? '参数错误'
}

export function createProduct(input: unknown): Result<ProductRow> {
  const parsed = ProductCreateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'PRODUCT_INVALID', message: firstIssue(parsed.error) }
  }
  const data = parsed.data
  if (!accounts.getAccountById(data.accountId)) {
    return { success: false, code: 'ACCOUNT_NOT_FOUND', message: '账号不存在' }
  }
  return { success: true, data: products.createProduct(data) }
}

export function getProduct(id: string): Result<ProductRow> {
  const row = products.getProductById(id)
  if (!row) {
    return { success: false, code: 'PRODUCT_NOT_FOUND', message: '商品不存在' }
  }
  return { success: true, data: row }
}

export function listProducts(filter?: ProductFilter): Result<ProductRow[]> {
  return { success: true, data: products.listProducts(filter) }
}

export function updateProduct(id: string, input: unknown): Result<ProductRow> {
  const existing = products.getProductById(id)
  if (!existing) {
    return { success: false, code: 'PRODUCT_NOT_FOUND', message: '商品不存在' }
  }
  const parsed = ProductUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, code: 'PRODUCT_INVALID', message: firstIssue(parsed.error) }
  }
  const patch = parsed.data
  if (patch.accountId && !accounts.getAccountById(patch.accountId)) {
    return { success: false, code: 'ACCOUNT_NOT_FOUND', message: '账号不存在' }
  }
  const row = products.updateProduct(id, patch)
  return { success: true, data: row as ProductRow }
}

export function deleteProduct(id: string): Result<{ id: string }> {
  const existing = products.getProductById(id)
  if (!existing) {
    return { success: false, code: 'PRODUCT_NOT_FOUND', message: '商品不存在' }
  }
  products.deleteProduct(id)
  return { success: true, data: { id } }
}
