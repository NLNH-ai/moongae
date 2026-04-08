export interface AdminMe {
  id: number
  username: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  lastLoginAt: string | null
  createdAt: string | null
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  admin: AdminMe
}

export interface FileUploadAsset {
  id: number
  originalName: string
  storedName: string
  filePath: string
  fileSize: number
  contentType: string
  createdAt: string
}

export interface HistoryUpsertPayload {
  year: number
  month: number
  title: string
  description: string
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
}

export interface BusinessUpsertPayload {
  title: string
  subtitle: string | null
  description: string
  iconUrl: string | null
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
}

export interface ContentUpdatePayload {
  title: string
  content: string
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
}
