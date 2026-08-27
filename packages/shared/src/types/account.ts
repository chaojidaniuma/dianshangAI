import type { Platform } from './platform.js'

export interface Account {
  id: string
  platform: Platform
  name: string
  status: string
  isEnabled: boolean
  lastHealthCheckAt: string | null
  createdAt: string
  updatedAt: string
}
