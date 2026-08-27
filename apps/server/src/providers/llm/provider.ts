import type { LLMProvider } from '@ecom-agent/shared'
import { createProviderFromEnv } from './registry.js'

let cached: LLMProvider | null | undefined

export function getLlmProvider(): LLMProvider | null {
  if (cached === undefined) {
    cached = createProviderFromEnv()
  }
  return cached
}

// 仅测试用：注入自定义 provider
export function setLlmProvider(provider: LLMProvider | null): void {
  cached = provider
}
