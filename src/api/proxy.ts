import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ChatCompletionRequest, OpenAiChatResponse } from '@/types/chat'
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types/image'
import { post } from './request'

/**
 * Initiates a non-streaming chat completion request.
 *
 * @param payload The chat completion request payload.
 * @param accessKey The user's access key for authentication.
 * @returns A promise that resolves to the chat completion response.
 */
export const chatCompletion = async (payload: ChatCompletionRequest, accessKey: string) => {
  // This endpoint returns a raw, unwrapped response and does not fit the project's
  // standard `http` client with its response interceptors.
  // We create a separate, clean axios call to handle it.
  const authStore = useAuthStore()
  const token = authStore.token

  const headers: Record<string, string> = {
    'ACCESS-KEY': accessKey,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await axios.post<OpenAiChatResponse>(
    `/v2/chat`,
    { ...payload, stream: false },
    {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers,
    }
  )
  return response.data
}

/**
 * Generates an image based on a text prompt.
 * @param payload The image generation request payload.
 * @param accessKey The user's access key for authentication.
 */
export const generateImage = (payload: ImageGenerationRequest, accessKey: string) => {
  return post<ImageGenerationResponse>('/generate-image', payload, {
    headers: {
      'ACCESS-KEY': accessKey,
    },
  })
}


