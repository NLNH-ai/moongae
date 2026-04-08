import type {
  ApiResponse,
  BusinessAreaItem,
  CompanyProfile,
  HistoryGroup,
  PageKey,
  PageContentItem,
} from '../types/domain'
import { isDemoMode } from '../config/runtime'
import {
  getDemoBusinessArea,
  getDemoBusinessAreas,
  getDemoCompanyProfile,
  getDemoHistoryGroups,
  getDemoPageContents,
  getDemoPageSection,
} from '../mocks/demoCmsStore'
import { apiClient } from './client'

export async function getCompanyProfile() {
  if (isDemoMode) {
    return getDemoCompanyProfile()
  }

  const { data } = await apiClient.get<ApiResponse<CompanyProfile>>('/company')
  return data.data
}

export async function getHistoryGroups() {
  if (isDemoMode) {
    return getDemoHistoryGroups()
  }

  const { data } = await apiClient.get<ApiResponse<HistoryGroup[]>>('/history')
  return data.data
}

export async function getBusinessAreas() {
  if (isDemoMode) {
    return getDemoBusinessAreas()
  }

  const { data } = await apiClient.get<ApiResponse<BusinessAreaItem[]>>(
    '/business',
  )
  return data.data
}

export async function getBusinessArea(id: number | string) {
  if (isDemoMode) {
    return getDemoBusinessArea(id)
  }

  const { data } = await apiClient.get<ApiResponse<BusinessAreaItem>>(
    `/business/${id}`,
  )
  return data.data
}

export async function getPageContents(pageKey: PageKey) {
  if (isDemoMode) {
    return getDemoPageContents(pageKey)
  }

  const { data } = await apiClient.get<ApiResponse<PageContentItem[]>>(
    `/content/${pageKey}`,
  )
  return data.data
}

export async function getPageSection(pageKey: PageKey, sectionKey: string) {
  if (isDemoMode) {
    return getDemoPageSection(pageKey, sectionKey)
  }

  const { data } = await apiClient.get<ApiResponse<PageContentItem>>(
    `/content/${pageKey}/${sectionKey}`,
  )
  return data.data
}
