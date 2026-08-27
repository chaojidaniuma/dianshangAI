import { req } from './client'

export interface AuditRow {
  id: string
  accountId: string | null
  action: string
  beforeValue: string | null
  afterValue: string | null
  result: string | null
  error: string | null
  createdAt: string
}

export const systemApi = {
  audit: () => req<AuditRow[]>('/api/audit'),
}
