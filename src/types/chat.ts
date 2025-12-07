// Based on the OpenAI-compatible API spec

export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  role: ChatMessageRole
  content: string
  imageUrl?: string
  imageUrls?: string[]
  messageId?: string
  // For UI state
  id?: string
  loading?: boolean
  createdAt?: string
}

export interface OpenAiMessageContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
    detail?: 'auto' | 'low' | 'high'
  }
}

export interface OpenAiMessage {
  role: ChatMessageRole
  content: string | OpenAiMessageContent[]
  name?: string
  tool_call_id?: string
  tool_calls?: any[] // Simplified for now
  conversation_id?: string
}

export interface ChatCompletionRequest {
  model: string
  messages: OpenAiMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
  conversation_id?: string
  persist_history?: boolean
  metadata?: Record<string, any>
  extra_params?: Record<string, any>
  // ... other options from the spec
}

export interface OpenAiUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface OpenAiResponseMessage {
  role: ChatMessageRole
  content: string | OpenAiMessageContent[]
  tool_calls?: any[] // Simplified for now
}

export interface OpenAiChatCompletionChoice {
  index: number
  message: OpenAiResponseMessage
  finish_reason: string
  logprobs?: Record<string, any> // Simplified
}

export interface OpenAiChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAiChatCompletionChoice[]
  usage: OpenAiUsage
  system_fingerprint?: string
  conversation_id?: string
}
