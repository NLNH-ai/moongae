import type { AdminMe } from '../../src/types/admin'
import type {
  BusinessAreaItem,
  HistoryEntry,
  PageContentItem,
  PageKey,
} from '../../src/types/domain'

const defaultTimestamp = '2026-04-08T12:00:00'

export function makeAdminMe(overrides: Partial<AdminMe> = {}): AdminMe {
  return {
    id: 1,
    username: 'superadmin',
    name: '관리자',
    role: 'SUPER_ADMIN',
    lastLoginAt: defaultTimestamp,
    createdAt: defaultTimestamp,
    ...overrides,
  }
}

export function makeHistoryEntry(
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry {
  return {
    id: 1,
    year: 2024,
    month: 1,
    title: '신규 사업 진출',
    description: '테스트용 연혁 항목입니다.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    ...overrides,
  }
}

export function makeBusinessArea(
  overrides: Partial<BusinessAreaItem> = {},
): BusinessAreaItem {
  return {
    id: 1,
    title: '에너지',
    subtitle: '지속 가능한 성장',
    description: '<p>테스트용 사업분야 설명입니다.</p>',
    iconUrl: null,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    ...overrides,
  }
}

export function makePageContent(
  overrides: Partial<PageContentItem> = {},
): PageContentItem {
  return {
    id: 1,
    pageKey: 'HOME',
    sectionKey: 'hero',
    title: '혁신적인 미래',
    content: '테스트용 페이지 콘텐츠입니다.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    ...overrides,
  }
}

export function createPageContentMap(
  entries: Partial<Record<PageKey, PageContentItem[]>> = {},
): Record<PageKey, PageContentItem[]> {
  return {
    HOME: entries.HOME ?? [],
    ABOUT: entries.ABOUT ?? [],
    BUSINESS: entries.BUSINESS ?? [],
    CONTACT: entries.CONTACT ?? [],
  }
}
