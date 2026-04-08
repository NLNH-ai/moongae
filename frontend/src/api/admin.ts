import type {
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
  PageKey,
  PageContentItem,
} from '../types/domain'
import { isDemoMode } from '../config/runtime'
import {
  DEMO_ADMIN_CREDENTIALS,
  createDemoBusiness,
  createDemoHistory,
  deleteDemoBusiness,
  deleteDemoHistory,
  deleteDemoUpload,
  getDemoAdminMe,
  getDemoBusinessAreas,
  getDemoHistoryGroups,
  getDemoPageContents,
  loginDemoAdmin,
  updateDemoBusiness,
  updateDemoContent,
  updateDemoHistory,
  updateDemoHistoryOrder,
  uploadDemoImage,
} from '../mocks/demoCmsStore'
import {
  getBusinessAreas,
  getHistoryGroups,
  getPageContents,
} from './public'
import { apiClient } from './client'

export { DEMO_ADMIN_CREDENTIALS }

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

export async function getAdminHistoryGroups() {
  if (isDemoMode) {
    return getDemoHistoryGroups({ includeInactive: true })
  }

  return getHistoryGroups()
}

export async function getAdminBusinessAreas() {
  if (isDemoMode) {
    return getDemoBusinessAreas({ includeInactive: true })
  }

  return getBusinessAreas()
}

export async function getAdminPageContents(pageKey: PageKey) {
  if (isDemoMode) {
    return getDemoPageContents(pageKey, { includeInactive: true })
  }

  return getPageContents(pageKey)
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
