import type { LLMProvider } from '@ecom-agent/shared'
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

export function createProviderFromEnv(): LLMProvider | null {
  const preset = LLM_PRESETS[process.env.LLM_PROVIDER ?? '']
  const baseUrl = process.env.LLM_BASE_URL ?? preset?.baseUrl
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL ?? preset?.defaultModel
  if (!baseUrl || !apiKey || !model) return null
  return createOpenAiCompatibleProvider({
    baseUrl,
    apiKey,
    model,
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 30_000),
  })
}
