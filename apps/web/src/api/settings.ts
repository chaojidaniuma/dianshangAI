import { req } from './client'

export const settingsApi = {
  get: () => req<Record<string, string>>('/api/settings'),
  update: (input: Record<string, string>) =>
    req<Record<string, string>>('/api/settings', { method: 'PUT', body: JSON.stringify(input) }),
  testLlm: () => req<{ message: string }>('/api/settings/test-llm', { method: 'POST' }),
}
