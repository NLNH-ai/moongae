import type {
  AdminMe,
  BusinessUpsertPayload,
  ContentUpdatePayload,
  FileUploadAsset,
  HistoryUpsertPayload,
  LoginResponse,
} from '../types/admin'
import type {
  BusinessAreaItem,
  CompanyProfile,
  HistoryEntry,
  HistoryGroup,
  PageContentItem,
  PageKey,
} from '../types/domain'
import { getAdminToken } from '../utils/auth'
import {
  demoBusinessAreas,
  demoCompanyProfile,
  demoHistoryGroups,
  demoPageContents,
} from './demoData'

interface DemoCmsStore {
  admin: AdminMe
  business: BusinessAreaItem[]
  company: CompanyProfile
  contents: PageContentItem[]
  history: HistoryEntry[]
  uploads: FileUploadAsset[]
}

const STORE_KEY = 'demoCmsStore'
const DEFAULT_TIMESTAMP = '2026-04-08T12:00:00'

export const DEMO_ADMIN_CREDENTIALS = {
  username: 'demo',
  password: 'demo1234',
} as const

export const DEMO_ADMIN_TOKEN = 'demo-preview-token'

function cloneValue<T>(value: T): T {
  return structuredClone(value)
}

function createSeedStore(): DemoCmsStore {
  return {
    admin: {
      id: 1,
      username: DEMO_ADMIN_CREDENTIALS.username,
      name: 'Preview Admin',
      role: 'SUPER_ADMIN',
      lastLoginAt: null,
      createdAt: DEFAULT_TIMESTAMP,
    },
    business: cloneValue(demoBusinessAreas),
    company: cloneValue(demoCompanyProfile),
    contents: cloneValue(demoPageContents),
    history: cloneValue(demoHistoryGroups.flatMap((group) => group.items)),
    uploads: [],
  }
}

function readStore(): DemoCmsStore {
  if (typeof window === 'undefined') {
    return createSeedStore()
  }

  const raw = window.localStorage.getItem(STORE_KEY)

  if (!raw) {
    const seed = createSeedStore()
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    return JSON.parse(raw) as DemoCmsStore
  } catch {
    const seed = createSeedStore()
    window.localStorage.setItem(STORE_KEY, JSON.stringify(seed))
    return seed
  }
}

function writeStore(store: DemoCmsStore) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
  }

  return store
}

function requireDemoSession() {
  const token = typeof window !== 'undefined' ? getAdminToken() : null

  if (token !== DEMO_ADMIN_TOKEN) {
    throw new Error('Preview admin session expired. Sign in again.')
  }
}

function getTimestamp() {
  return new Date().toISOString()
}

function sortHistoryEntries(items: HistoryEntry[]) {
  return [...items].sort((left, right) => {
    if (left.year !== right.year) {
      return right.year - left.year
    }

    if (left.month !== right.month) {
      return right.month - left.month
    }

    return left.displayOrder - right.displayOrder
  })
}

function buildHistoryGroups(
  items: HistoryEntry[],
  options?: { includeInactive?: boolean },
) {
  const grouped = sortHistoryEntries(
    options?.includeInactive ? items : items.filter((item) => item.isActive),
  ).reduce<HistoryGroup[]>((accumulator, entry) => {
    const current = accumulator.find((group) => group.year === entry.year)

    if (current) {
      current.items.push(entry)
    } else {
      accumulator.push({
        year: entry.year,
        items: [entry],
      })
    }

    return accumulator
  }, [])

  return cloneValue(grouped)
}

function sortBusinessItems(
  items: BusinessAreaItem[],
  options?: { includeInactive?: boolean },
) {
  const filtered = options?.includeInactive
    ? items
    : items.filter((item) => item.isActive)

  return cloneValue(
    [...filtered].sort((left, right) => left.displayOrder - right.displayOrder),
  )
}

function sortContentItems(
  items: PageContentItem[],
  options?: { includeInactive?: boolean },
) {
  const filtered = options?.includeInactive
    ? items
    : items.filter((item) => item.isActive)

  return cloneValue(
    [...filtered].sort((left, right) => left.displayOrder - right.displayOrder),
  )
}

export function getDemoCompanyProfile() {
  return cloneValue(readStore().company)
}

export function getDemoHistoryGroups(options?: { includeInactive?: boolean }) {
  return buildHistoryGroups(readStore().history, options)
}

export function getDemoBusinessAreas(options?: { includeInactive?: boolean }) {
  return sortBusinessItems(readStore().business, options)
}

export function getDemoBusinessArea(id: number | string) {
  const item = readStore().business.find(
    (businessArea) => String(businessArea.id) === String(id),
  )

  if (!item) {
    throw new Error(`Missing demo business area: ${id}`)
  }

  return cloneValue(item)
}

export function getDemoPageContents(
  pageKey: PageKey,
  options?: { includeInactive?: boolean },
) {
  const items = readStore().contents.filter((item) => item.pageKey === pageKey)
  return sortContentItems(items, options)
}

export function getDemoPageSection(pageKey: PageKey, sectionKey: string) {
  const item = readStore().contents.find(
    (pageContent) =>
      pageContent.pageKey === pageKey && pageContent.sectionKey === sectionKey,
  )

  if (!item) {
    throw new Error(`Missing demo page section: ${pageKey}/${sectionKey}`)
  }

  return cloneValue(item)
}

export function loginDemoAdmin(payload: {
  username: string
  password: string
}): LoginResponse {
  if (
    payload.username !== DEMO_ADMIN_CREDENTIALS.username ||
    payload.password !== DEMO_ADMIN_CREDENTIALS.password
  ) {
    throw new Error(
      `Preview login uses ${DEMO_ADMIN_CREDENTIALS.username} / ${DEMO_ADMIN_CREDENTIALS.password}.`,
    )
  }

  const store = readStore()
  const admin = {
    ...store.admin,
    lastLoginAt: getTimestamp(),
  }

  writeStore({
    ...store,
    admin,
  })

  return {
    accessToken: DEMO_ADMIN_TOKEN,
    tokenType: 'Bearer',
    expiresIn: 86400000,
    admin: cloneValue(admin),
  }
}

export function getDemoAdminMe() {
  requireDemoSession()
  return cloneValue(readStore().admin)
}

export function createDemoHistory(payload: HistoryUpsertPayload) {
  requireDemoSession()
  const store = readStore()
  const timestamp = getTimestamp()
  const created: HistoryEntry = {
    id: Date.now(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...payload,
  }

  writeStore({
    ...store,
    history: [...store.history, created],
  })

  return cloneValue(created)
}

export function updateDemoHistory(id: number, payload: HistoryUpsertPayload) {
  requireDemoSession()
  const store = readStore()
  const current = store.history.find((item) => item.id === id)

  if (!current) {
    throw new Error('Preview history entry not found.')
  }

  const updated: HistoryEntry = {
    ...current,
    ...payload,
    updatedAt: getTimestamp(),
  }

  writeStore({
    ...store,
    history: store.history.map((item) => (item.id === id ? updated : item)),
  })

  return cloneValue(updated)
}

export function deleteDemoHistory(id: number) {
  requireDemoSession()
  const store = readStore()
  writeStore({
    ...store,
    history: store.history.filter((item) => item.id !== id),
  })
}

export function updateDemoHistoryOrder(
  items: Array<{ id: number; displayOrder: number }>,
) {
  requireDemoSession()
  const store = readStore()
  const nextHistory = store.history.map((entry) => {
    const orderUpdate = items.find((item) => item.id === entry.id)

    if (!orderUpdate) {
      return entry
    }

    return {
      ...entry,
      displayOrder: orderUpdate.displayOrder,
      updatedAt: getTimestamp(),
    }
  })

  writeStore({
    ...store,
    history: nextHistory,
  })

  return cloneValue(
    sortHistoryEntries(nextHistory).filter((entry) =>
      items.some((item) => item.id === entry.id),
    ),
  )
}

export function createDemoBusiness(payload: BusinessUpsertPayload) {
  requireDemoSession()
  const store = readStore()
  const timestamp = getTimestamp()
  const created: BusinessAreaItem = {
    id: Date.now(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...payload,
  }

  writeStore({
    ...store,
    business: [...store.business, created],
  })

  return cloneValue(created)
}

export function updateDemoBusiness(id: number, payload: BusinessUpsertPayload) {
  requireDemoSession()
  const store = readStore()
  const current = store.business.find((item) => item.id === id)

  if (!current) {
    throw new Error('Preview business area not found.')
  }

  const updated: BusinessAreaItem = {
    ...current,
    ...payload,
    updatedAt: getTimestamp(),
  }

  writeStore({
    ...store,
    business: store.business.map((item) => (item.id === id ? updated : item)),
  })

  return cloneValue(updated)
}

export function deleteDemoBusiness(id: number) {
  requireDemoSession()
  const store = readStore()
  writeStore({
    ...store,
    business: store.business.filter((item) => item.id !== id),
  })
}

export function updateDemoContent(id: number, payload: ContentUpdatePayload) {
  requireDemoSession()
  const store = readStore()
  const current = store.contents.find((item) => item.id === id)

  if (!current) {
    throw new Error('Preview content section not found.')
  }

  const updated: PageContentItem = {
    ...current,
    ...payload,
    updatedAt: getTimestamp(),
  }

  writeStore({
    ...store,
    contents: store.contents.map((item) => (item.id === id ? updated : item)),
  })

  return cloneValue(updated)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Preview upload failed to encode the selected file.'))
    }

    reader.onerror = () => {
      reject(new Error('Preview upload failed to read the selected file.'))
    }

    reader.readAsDataURL(file)
  })
}

export async function uploadDemoImage(file: File) {
  requireDemoSession()
  const store = readStore()
  const timestamp = getTimestamp()
  const filePath = await readFileAsDataUrl(file)
  const created: FileUploadAsset = {
    id: Date.now(),
    originalName: file.name,
    storedName: `${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`,
    filePath,
    fileSize: file.size,
    contentType: file.type,
    createdAt: timestamp,
  }

  writeStore({
    ...store,
    uploads: [...store.uploads, created],
  })

  return cloneValue(created)
}

export function deleteDemoUpload(id: number) {
  requireDemoSession()
  const store = readStore()
  writeStore({
    ...store,
    uploads: store.uploads.filter((item) => item.id !== id),
  })
}
