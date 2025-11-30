export interface Provider {
  id: number
  name: string
  urlBase: string
  createdAt: string
  updatedAt: string
}

export interface ProviderKey {
  id: number
  providerId: number
  apiKey?: string
  maskedApiKey?: string
  status: boolean | number
  createdAt: string
}
