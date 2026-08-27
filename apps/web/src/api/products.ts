import type { Product, ProductCreateInput, ProductUpdateInput, Result } from '@ecom-agent/shared'

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })
  const body = (await res.json().catch(() => null)) as Result<T> | null
  if (!body || !body.success) {
    const message = body && !body.success ? body.message : `请求失败 (${res.status})`
    throw new Error(message)
  }
  return body.data
}

export const productApi = {
  list: () => req<Product[]>('/api/products'),
  create: (input: ProductCreateInput) =>
    req<Product>('/api/products', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: ProductUpdateInput) =>
    req<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => req<{ id: string }>(`/api/products/${id}`, { method: 'DELETE' }),
}
