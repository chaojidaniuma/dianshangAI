import type { Result } from '@ecom-agent/shared'
import { getAllSettings, setSetting } from '../repositories/settings.repository.js'

export function getSettings(): Result<Record<string, string>> {
  return { success: true, data: getAllSettings() }
}

export function updateSettings(input: unknown): Result<Record<string, string>> {
  if (typeof input !== 'object' || input === null) {
    return { success: false, code: 'SETTINGS_INVALID', message: '参数错误' }
  }
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') setSetting(key, value)
  }
  return { success: true, data: getAllSettings() }
}
