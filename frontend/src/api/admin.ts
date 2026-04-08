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
  PageContentItem,
} from '../types/domain'
import { apiClient } from './client'

export async function loginAdmin(payload: {
  username: string
  password: string
}) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/admin/login',
    payload,
  )
  return data.data
}

export async function getAdminMe() {
  const { data } = await apiClient.get<ApiResponse<AdminMe>>('/admin/me')
  return data.data
}

export async function createHistory(payload: HistoryUpsertPayload) {
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
  const { data } = await apiClient.put<ApiResponse<HistoryEntry>>(
    `/admin/history/${id}`,
    payload,
  )
  return data.data
}

export async function deleteHistory(id: number) {
  await apiClient.delete(`/admin/history/${id}`)
}

export async function updateHistoryOrder(
  items: Array<{ id: number; displayOrder: number }>,
) {
  const { data } = await apiClient.patch<ApiResponse<HistoryEntry[]>>(
    '/admin/history/order',
    { items },
  )
  return data.data
}

export async function createBusiness(payload: BusinessUpsertPayload) {
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
  const { data } = await apiClient.put<ApiResponse<BusinessAreaItem>>(
    `/admin/business/${id}`,
    payload,
  )
  return data.data
}

export async function deleteBusiness(id: number) {
  await apiClient.delete(`/admin/business/${id}`)
}

export async function updateContent(
  id: number,
  payload: ContentUpdatePayload,
) {
  const { data } = await apiClient.put<ApiResponse<PageContentItem>>(
    `/admin/content/${id}`,
    payload,
  )
  return data.data
}

export async function uploadImage(file: File) {
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
  await apiClient.delete(`/admin/upload/${id}`)
}
