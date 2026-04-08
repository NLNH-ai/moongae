export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

export type PageKey = 'HOME' | 'ABOUT' | 'BUSINESS' | 'CONTACT'

export interface CompanyProfile {
  id: number
  companyName: string
  ceoName: string
  establishedDate: string
  address: string
  phone: string
  email: string
  description: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface HistoryEntry {
  id: number
  year: number
  month: number
  title: string
  description: string
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HistoryGroup {
  year: number
  items: HistoryEntry[]
}

export interface BusinessAreaItem {
  id: number
  title: string
  subtitle: string | null
  description: string
  iconUrl: string | null
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PageContentItem {
  id: number
  pageKey: PageKey
  sectionKey: string
  title: string
  content: string
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
