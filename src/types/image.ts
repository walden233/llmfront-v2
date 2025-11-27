export interface ImageGenerationRequest {
  prompt: string
  modelIdentifier?: string
  options?: {
    size?: '1024x1024' | '512x512' | '1024x768' // Example sizes
    n?: number
    [key: string]: any
  }
}

export interface ImageGenerationResponse {
  imageUrls: string[]
  actualPrompt: string
  usedModelIdentifier: string
}
