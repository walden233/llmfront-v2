import { useAuthStore } from '@/stores/auth'

/**
 * A utility to get the current auth token outside of a Vue component context.
 * Note: This will only work if the Pinia store has been initialized.
 * @returns The auth token or an empty string.
 */
export const getAccessToken = (): string => {
  // Directly accessing the state is not ideal, but necessary for non-component modules.
  // A better approach might involve a singleton or a different auth flow.
  return useAuthStore().token
}
