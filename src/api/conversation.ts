import { get } from './request'
import type { ConversationMessage, ConversationSummary } from '@/types/conversation'

interface ConversationMessagesParams {
  limit?: number
  before?: string
}

export const fetchRecentConversations = (limit = 20) =>
  get<ConversationSummary[]>('/conversations/recent', {
    params: { limit },
    headers: { 'X-Use-Access-Key': true },
  })

export const fetchConversationMessages = (
  conversationId: string,
  params?: ConversationMessagesParams,
) =>
  get<ConversationMessage[]>(`/conversations/${conversationId}/messages`, {
    params,
    headers: { 'X-Use-Access-Key': true },
  })
