import type { ChatMessageRole } from './chat'

export interface ConversationSummary {
  conversationId: string
  title: string
  pinned: boolean
  lastModelIdentifier?: string
  lastMessageSummary?: string
  messageCount: number
  lastActiveAt: string
  createdAt: string
  updatedAt: string
}

export interface ConversationMessage {
  messageId: string
  conversationId: string
  role: ChatMessageRole
  content: string
  imageUrls?: string[]
  modelIdentifier?: string
  promptTokens?: number
  completionTokens?: number
  cost?: number
  createdAt: string
}
