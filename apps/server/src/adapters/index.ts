import type { PlatformAdapter } from '@ecom-agent/shared'
import { mockAdapter } from './mock/mock.adapter.js'

// 当前只有 Mock；后续按平台返回真实适配器（pinduoduo / xianyu）
export function getAdapter(_platform: string): PlatformAdapter {
  return mockAdapter
}
