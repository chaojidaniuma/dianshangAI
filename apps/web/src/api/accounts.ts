import type { Account } from '@ecom-agent/shared'
import { req } from './client'

export const accountApi = {
  list: () => req<Account[]>('/api/accounts'),
  create: (input: { id: string; platform: string; name: string; credential?: string }) =>
    req<Account>('/api/accounts', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Record<string, unknown>) =>
    req<Account>(`/api/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (id: string) => req<{ id: string }>(`/api/accounts/${id}`, { method: 'DELETE' }),
  health: (id: string) =>
    req<{ status: string; message: string }>(`/api/accounts/${id}/health`, { method: 'POST' }),
}
