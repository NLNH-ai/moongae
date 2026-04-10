import type { PageKey } from './domain'

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

export type AdminSortDirection = 'ASC' | 'DESC'

export interface AdminListResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  sortBy: string
  sortDirection: AdminSortDirection
  hasNext: boolean
  hasPrevious: boolean
}

export interface AdminHistoryFilters {
  keyword?: string
  isActive?: boolean
  year?: number
  page?: number
  size?: number
  sortBy?: 'timeline' | 'year' | 'month' | 'title' | 'displayOrder' | 'updatedAt'
  sortDirection?: AdminSortDirection
}

export interface AdminBusinessFilters {
  keyword?: string
  isActive?: boolean
  page?: number
  size?: number
  sortBy?: 'displayOrder' | 'title' | 'updatedAt'
  sortDirection?: AdminSortDirection
}

export interface AdminContentFilters {
  pageKey?: PageKey
  keyword?: string
  isActive?: boolean
  page?: number
  size?: number
  sortBy?: 'displayOrder' | 'sectionKey' | 'title' | 'updatedAt'
  sortDirection?: AdminSortDirection
}
