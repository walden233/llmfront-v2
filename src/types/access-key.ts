export interface AccessKeyItem {
  id: number
  keyValue?: string
  maskedKeyValue?: string
  isActive: boolean
  createdAt: string
}

export interface CreateAccessKeyResponse {
  keyValue: string
  id: number
}
