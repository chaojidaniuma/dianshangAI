import type { Order } from '@ecom-agent/shared'
import { req } from './client'

export const orderApi = {
  list: () => req<Order[]>('/api/orders'),
  ship: (id: string, body: { expressCompany: string; trackingNumber: string }) =>
    req<Order>(`/api/orders/${id}/ship`, { method: 'POST', body: JSON.stringify(body) }),
}
