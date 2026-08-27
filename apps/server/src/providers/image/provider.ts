import type { ImageProvider } from '@ecom-agent/shared'

// 生图默认关闭（IMAGE_PROVIDER=off）；关闭时由本地海报兜底。
// ponytail: 百炼 wanx 走 DashScope 原生协议（非 OpenAI 兼容），接入时在此按 IMAGE_PROVIDER 分支返回实现。
export function getImageProvider(): ImageProvider | null {
  const provider = process.env.IMAGE_PROVIDER
  if (!provider || provider === 'off') return null
  return null
}
