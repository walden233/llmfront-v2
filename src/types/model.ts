export type ModelCapability = 'text-to-text' | 'text-to-image' | 'image-to-text' | 'image-to-image'

export interface Model {
  id: number
  displayName: string
  modelIdentifier: string
  capabilities: ModelCapability[]
  pricing: Record<string, any>
  priority: number
  status: 0 | 1 // 0: offline, 1: online
  providerId: string
  providerName: string
  urlBase: string
  createdAt: string
  updatedAt: string
}
