import type {
  AdminBusinessFilters,
  AdminContentFilters,
  AdminHistoryFilters,
  AdminListResponse,
  AdminMe,
  BusinessUpsertPayload,
  ContentUpdatePayload,
  FileUploadAsset,
  HistoryUpsertPayload,
  LoginResponse,
} from '../types/admin'
import type {
  ApiResponse,
  BusinessAreaItem,
  HistoryEntry,
  HistoryGroup,
  PageContentItem,
  PageKey,
} from '../types/domain'
import { isDemoMode } from '../config/runtime'
import {
  DEMO_ADMIN_CREDENTIALS,
  createDemoBusiness,
  createDemoHistory,
  deleteDemoBusiness,
  deleteDemoHistory,
  deleteDemoUpload,
  getDemoAdminBusinessList,
  getDemoAdminContentList,
  getDemoAdminMe,
  getDemoAdminHistoryList,
  loginDemoAdmin,
  updateDemoBusiness,
  updateDemoContent,
  updateDemoHistory,
  updateDemoHistoryOrder,
  uploadDemoImage,
} from '../mocks/demoCmsStore'
import { toHistoryGroups } from '../utils/helpers'
import { apiClient } from './client'

export { DEMO_ADMIN_CREDENTIALS }

function normalizeKeyword(keyword?: string) {
  const trimmed = keyword?.trim()
  return trimmed ? trimmed : undefined
}

export async function loginAdmin(payload: {
  username: string
  password: string
}) {
  if (isDemoMode) {
    return loginDemoAdmin(payload)
  }

  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/admin/login',
    payload,
  )
  return data.data
}

export async function getAdminMe() {
  if (isDemoMode) {
    return getDemoAdminMe()
  }

  const { data } = await apiClient.get<ApiResponse<AdminMe>>('/admin/me')
  return data.data
}

export async function getAdminHistoryEntries(
  filters: AdminHistoryFilters = {},
) {
  if (isDemoMode) {
    return getDemoAdminHistoryList(filters)
  }

  const { data } = await apiClient.get<ApiResponse<AdminListResponse<HistoryEntry>>>(
    '/admin/history',
    {
      params: {
        keyword: normalizeKeyword(filters.keyword),
        isActive: filters.isActive,
        year: filters.year,
        page: filters.page ?? 0,
        size: filters.size ?? 100,
        sortBy: filters.sortBy ?? 'timeline',
        sortDirection: filters.sortDirection ?? 'DESC',
      },
    },
  )

  return data.data
}

export async function getAdminHistoryGroups(
  filters: AdminHistoryFilters = {},
): Promise<HistoryGroup[]> {
  const response = await getAdminHistoryEntries(filters)
  return toHistoryGroups(response.items)
}

export async function getAdminBusinessAreas(
  filters: AdminBusinessFilters = {},
) {
  if (isDemoMode) {
    return getDemoAdminBusinessList(filters)
  }

  const { data } = await apiClient.get<ApiResponse<AdminListResponse<BusinessAreaItem>>>(
    '/admin/business',
    {
      params: {
        keyword: normalizeKeyword(filters.keyword),
        isActive: filters.isActive,
        page: filters.page ?? 0,
        size: filters.size ?? 100,
        sortBy: filters.sortBy ?? 'displayOrder',
        sortDirection: filters.sortDirection ?? 'ASC',
      },
    },
  )

  return data.data
}

export async function getAdminPageContents(
  pageKey: PageKey,
  filters: Omit<AdminContentFilters, 'pageKey'> = {},
) {
  if (isDemoMode) {
    return getDemoAdminContentList({ ...filters, pageKey })
  }

  const { data } = await apiClient.get<ApiResponse<AdminListResponse<PageContentItem>>>(
    '/admin/content',
    {
      params: {
        pageKey,
        keyword: normalizeKeyword(filters.keyword),
        isActive: filters.isActive,
        page: filters.page ?? 0,
        size: filters.size ?? 100,
        sortBy: filters.sortBy ?? 'displayOrder',
        sortDirection: filters.sortDirection ?? 'ASC',
      },
    },
  )

  return data.data
}

export async function createHistory(payload: HistoryUpsertPayload) {
  if (isDemoMode) {
    return createDemoHistory(payload)
  }

  const { data } = await apiClient.post<ApiResponse<HistoryEntry>>(
    '/admin/history',
    payload,
  )
  return data.data
}

export async function updateHistory(
  id: number,
  payload: HistoryUpsertPayload,
) {
  if (isDemoMode) {
    return updateDemoHistory(id, payload)
  }

  const { data } = await apiClient.put<ApiResponse<HistoryEntry>>(
    `/admin/history/${id}`,
    payload,
  )
  return data.data
}

export async function deleteHistory(id: number) {
  if (isDemoMode) {
    return deleteDemoHistory(id)
  }

  await apiClient.delete(`/admin/history/${id}`)
}

export async function updateHistoryOrder(
  items: Array<{ id: number; displayOrder: number }>,
) {
  if (isDemoMode) {
    return updateDemoHistoryOrder(items)
  }

  const { data } = await apiClient.patch<ApiResponse<HistoryEntry[]>>(
    '/admin/history/order',
    { items },
  )
  return data.data
}

export async function createBusiness(payload: BusinessUpsertPayload) {
  if (isDemoMode) {
    return createDemoBusiness(payload)
  }

  const { data } = await apiClient.post<ApiResponse<BusinessAreaItem>>(
    '/admin/business',
    payload,
  )
  return data.data
}

export async function updateBusiness(
  id: number,
  payload: BusinessUpsertPayload,
) {
  if (isDemoMode) {
    return updateDemoBusiness(id, payload)
  }

  const { data } = await apiClient.put<ApiResponse<BusinessAreaItem>>(
    `/admin/business/${id}`,
    payload,
  )
  return data.data
}

export async function deleteBusiness(id: number) {
  if (isDemoMode) {
    return deleteDemoBusiness(id)
  }

  await apiClient.delete(`/admin/business/${id}`)
}

export async function updateContent(
  id: number,
  payload: ContentUpdatePayload,
) {
  if (isDemoMode) {
    return updateDemoContent(id, payload)
  }

  const { data } = await apiClient.put<ApiResponse<PageContentItem>>(
    `/admin/content/${id}`,
    payload,
  )
  return data.data
}

export async function uploadImage(file: File) {
  if (isDemoMode) {
    return uploadDemoImage(file)
  }

  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<ApiResponse<FileUploadAsset>>(
    '/admin/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function deleteUpload(id: number) {
  if (isDemoMode) {
    return deleteDemoUpload(id)
  }

  await apiClient.delete(`/admin/upload/${id}`)
}
