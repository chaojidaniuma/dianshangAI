export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatInput {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export interface ChatResult {
  content: string
  inputTokens: number
  outputTokens: number
  model: string
}

export interface LLMProvider {
  chat(input: ChatInput): Promise<ChatResult>
}
