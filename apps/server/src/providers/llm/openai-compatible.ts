import type { ChatInput, ChatResult, LLMProvider } from '@ecom-agent/shared'

export interface OpenAiCompatibleConfig {
  baseUrl: string
  apiKey: string
  model: string
  timeoutMs?: number
}

export function createOpenAiCompatibleProvider(config: OpenAiCompatibleConfig): LLMProvider {
  return {
    async chat(input: ChatInput): Promise<ChatResult> {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 30_000)
      try {
        const res = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: input.messages,
            temperature: input.temperature ?? 0.7,
            ...(input.maxTokens ? { max_tokens: input.maxTokens } : {}),
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`LLM 请求失败 (${res.status})`)
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>
          usage?: { prompt_tokens?: number; completion_tokens?: number }
        }
        const content = data.choices?.[0]?.message?.content ?? ''
        if (!content) {
          throw new Error('LLM 返回为空')
        }
        return {
          content,
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
          model: config.model,
        }
      } finally {
        clearTimeout(timer)
      }
    },
  }
}
