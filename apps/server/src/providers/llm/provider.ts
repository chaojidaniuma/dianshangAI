import type { LLMProvider } from '@ecom-agent/shared'
import { createProviderFromConfig, resolveLlmConfig } from './registry.js'

let injected: LLMProvider | null | undefined

export function getLlmProvider(): LLMProvider | null {
  if (injected !== undefined) return injected
  return createProviderFromConfig(resolveLlmConfig())
}

// 仅测试用：注入自定义 provider
export function setLlmProvider(provider: LLMProvider | null): void {
  injected = provider
}
