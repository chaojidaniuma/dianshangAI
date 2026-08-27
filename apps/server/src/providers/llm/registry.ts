import type { LLMProvider } from '@ecom-agent/shared'
import { getAllSettings } from '../../repositories/settings.repository.js'
import { createOpenAiCompatibleProvider } from './openai-compatible.js'

export interface LlmPreset {
  name: string
  baseUrl: string
  defaultModel: string
}

// 四家主流供应商均提供 OpenAI 兼容协议，统一走一个客户端
export const LLM_PRESETS: Record<string, LlmPreset> = {
  openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  zhipu: { name: '智谱', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash' },
  qwen: { name: '百炼', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-plus' },
}

export interface LlmConfig {
  baseUrl?: string
  apiKey?: string
  model?: string
  timeoutMs: number
}

export function resolveLlmConfig(): LlmConfig {
  const s = getAllSettings()
  const preset = LLM_PRESETS[s['llm.provider'] ?? process.env.LLM_PROVIDER ?? '']
  return {
    baseUrl: s['llm.baseUrl'] ?? process.env.LLM_BASE_URL ?? preset?.baseUrl,
    apiKey: s['llm.apiKey'] ?? process.env.LLM_API_KEY,
    model: s['llm.model'] ?? process.env.LLM_MODEL ?? preset?.defaultModel,
    timeoutMs: Number(s['llm.timeoutMs'] ?? process.env.LLM_TIMEOUT_MS ?? 30_000),
  }
}

export function createProviderFromConfig(config: LlmConfig): LLMProvider | null {
  if (!config.baseUrl || !config.apiKey || !config.model) return null
  return createOpenAiCompatibleProvider(config as { baseUrl: string; apiKey: string; model: string; timeoutMs: number })
}
