// Based on the OpenAI-compatible API spec

export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  role: ChatMessageRole
  content: string
  // For UI state
  id?: string
  loading?: boolean
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
}

export interface ChatCompletionRequest {
  model: string
  messages: OpenAiMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
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
}
