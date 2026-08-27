import type { ChatInput, LLMProvider, Platform } from '@ecom-agent/shared'
import { getLlmProvider } from '../providers/llm/provider.js'
import { estimateCost } from '../providers/llm/pricing.js'
import { createUsage } from '../repositories/usage.repository.js'

export interface CopyInput {
  name: string
  platform: Platform
  attributes?: string
}

export interface CopyResult {
  title: string
  description: string
  sellingPoints: string[]
  source: 'ai' | 'rule'
}

const platformLabel: Record<Platform, string> = { xianyu: '闲鱼', pinduoduo: '拼多多' }

function ruleCopy(input: CopyInput): CopyResult {
  const title = `${input.name}${input.attributes ? ` ${input.attributes}` : ''}`.trim().slice(0, 30)
  return {
    title,
    description: `${input.name}，${input.attributes ?? '优质好物'}，现货秒发，喜欢直接拍。`,
    sellingPoints: [input.name, '现货秒发', '价格实惠'],
    source: 'rule',
  }
}

function buildPrompt(input: CopyInput): ChatInput {
  const label = platformLabel[input.platform]
  const attr = input.attributes ? `（属性：${input.attributes}）` : ''
  return {
    messages: [
      { role: 'system', content: '你是电商文案助手，只输出 JSON，不要输出其他内容。' },
      {
        role: 'user',
        content: `为${label}平台商品「${input.name}」${attr}生成文案，返回 JSON：{"title":"...","description":"...","sellingPoints":["..."]}`,
      },
    ],
    temperature: 0.7,
  }
}

export async function generateCopy(
  input: CopyInput,
  provider: LLMProvider | null = getLlmProvider(),
): Promise<CopyResult> {
  if (!provider) return ruleCopy(input)
  try {
    const result = await provider.chat(buildPrompt(input))
    const parsed = JSON.parse(result.content) as {
      title?: string
      description?: string
      sellingPoints?: string[]
    }
    if (!parsed.title) return ruleCopy(input)
    createUsage({
      provider: process.env.LLM_PROVIDER ?? 'custom',
      model: result.model,
      feature: 'copy',
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: estimateCost(result.model, result.inputTokens, result.outputTokens),
    })
    return {
      title: parsed.title,
      description: parsed.description ?? '',
      sellingPoints: parsed.sellingPoints ?? [],
      source: 'ai',
    }
  } catch {
    return ruleCopy(input)
  }
}
