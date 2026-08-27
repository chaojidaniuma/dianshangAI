import type { PlatformAdapter } from '@ecom-agent/shared'
import { mockAdapter } from './mock/mock.adapter.js'
import { pinduoduoAdapter } from './pinduoduo/adapter.js'
import { xianyuAdapter } from './xianyu/adapter.js'

// 真实平台适配器已搭建骨架，但接入需官方接口确认 + 凭据（见各 adapter 注释）。
// 配置了真实凭据时返回对应适配器（当前为抛错骨架），否则回退 Mock 以便体验/测试。
export function getAdapter(platform: string): PlatformAdapter {
  if (platform === 'xianyu' && process.env.XIANYU_COOKIE) return xianyuAdapter
  if (platform === 'pinduoduo' && process.env.PDD_ACCESS_TOKEN) return pinduoduoAdapter
  return mockAdapter
}
