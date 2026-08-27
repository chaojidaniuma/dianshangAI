import type { Product, ProductCreateInput, ProductUpdateInput } from '@ecom-agent/shared'
import { req } from './client'

export const productApi = {
  list: () => req<Product[]>('/api/products'),
  create: (input: ProductCreateInput) =>
    req<Product>('/api/products', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: ProductUpdateInput) =>
    req<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => req<{ id: string }>(`/api/products/${id}`, { method: 'DELETE' }),
  publish: (id: string) => req<Product>(`/api/products/${id}/publish`, { method: 'POST' }),
  import: (filename: string, base64: string) =>
    req<{ imported: number; errors: Array<{ row: number; message: string }> }>('/api/products/import', {
      method: 'POST',
      body: JSON.stringify({ filename, base64 }),
    }),
}
