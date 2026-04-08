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
  demoBusinessAreas,
  demoCompanyProfile,
  demoHistoryGroups,
  getDemoPageContents,
} from '../mocks/demoData'
import { apiClient } from './client'

function cloneDemoData<T>(value: T): T {
  return structuredClone(value)
}

export async function getCompanyProfile() {
  if (isDemoMode) {
    return cloneDemoData(demoCompanyProfile)
  }

  const { data } = await apiClient.get<ApiResponse<CompanyProfile>>('/company')
  return data.data
}

export async function getHistoryGroups() {
  if (isDemoMode) {
    return cloneDemoData(demoHistoryGroups)
  }

  const { data } = await apiClient.get<ApiResponse<HistoryGroup[]>>('/history')
  return data.data
}

export async function getBusinessAreas() {
  if (isDemoMode) {
    return cloneDemoData(demoBusinessAreas)
  }

  const { data } = await apiClient.get<ApiResponse<BusinessAreaItem[]>>(
    '/business',
  )
  return data.data
}

export async function getBusinessArea(id: number | string) {
  if (isDemoMode) {
    const item = demoBusinessAreas.find(
      (businessArea) => String(businessArea.id) === String(id),
    )

    if (!item) {
      throw new Error(`Missing demo business area: ${id}`)
    }

    return cloneDemoData(item)
  }

  const { data } = await apiClient.get<ApiResponse<BusinessAreaItem>>(
    `/business/${id}`,
  )
  return data.data
}

export async function getPageContents(pageKey: PageKey) {
  if (isDemoMode) {
    return cloneDemoData(getDemoPageContents(pageKey))
  }

  const { data } = await apiClient.get<ApiResponse<PageContentItem[]>>(
    `/content/${pageKey}`,
  )
  return data.data
}

export async function getPageSection(pageKey: PageKey, sectionKey: string) {
  if (isDemoMode) {
    const item = getDemoPageContents(pageKey).find(
      (pageContent) => pageContent.sectionKey === sectionKey,
    )

    if (!item) {
      throw new Error(`Missing demo page section: ${pageKey}/${sectionKey}`)
    }

    return cloneDemoData(item)
  }

  const { data } = await apiClient.get<ApiResponse<PageContentItem>>(
    `/content/${pageKey}/${sectionKey}`,
  )
  return data.data
}
