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

export interface ImageInput {
  prompt: string
}

export interface ImageResult {
  imageUrl?: string
  imageBase64?: string
}

export interface ImageProvider {
  generate(input: ImageInput): Promise<ImageResult>
}
