import type {
  AdminBusinessFilters,
  AdminContentFilters,
  AdminHistoryFilters,
} from '../types/admin'

export const publicQueryKeys = {
  company: ['public', 'company'] as const,
  history: ['public', 'history'] as const,
  business: ['public', 'business'] as const,
  businessDetail: (id: number | string) => ['public', 'business', id] as const,
  pageContents: (pageKey: string) => ['public', 'content', pageKey] as const,
  pageSection: (pageKey: string, sectionKey: string) =>
    ['public', 'content', pageKey, sectionKey] as const,
}

function normalizeBooleanFilter(value: boolean | undefined) {
  return typeof value === 'boolean' ? String(value) : 'all'
}

export const adminQueryKeys = {
  me: ['admin', 'me'] as const,
  history: (filters?: AdminHistoryFilters) =>
    [
      'admin',
      'history',
      filters?.keyword ?? '',
      normalizeBooleanFilter(filters?.isActive),
      filters?.year ?? 'all',
      filters?.page ?? 0,
      filters?.size ?? 20,
      filters?.sortBy ?? 'timeline',
      filters?.sortDirection ?? 'DESC',
    ] as const,
  business: (filters?: AdminBusinessFilters) =>
    [
      'admin',
      'business',
      filters?.keyword ?? '',
      normalizeBooleanFilter(filters?.isActive),
      filters?.page ?? 0,
      filters?.size ?? 20,
      filters?.sortBy ?? 'displayOrder',
      filters?.sortDirection ?? 'ASC',
    ] as const,
  pageContents: (filters?: AdminContentFilters) =>
    [
      'admin',
      'content',
      filters?.pageKey ?? 'all',
      filters?.keyword ?? '',
      normalizeBooleanFilter(filters?.isActive),
      filters?.page ?? 0,
      filters?.size ?? 20,
      filters?.sortBy ?? 'displayOrder',
      filters?.sortDirection ?? 'ASC',
    ] as const,
}
