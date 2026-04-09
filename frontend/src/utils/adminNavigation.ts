import { routerMode } from '../config/runtime'

const ADMIN_LOGIN_ROUTE = '/admin'
const ADMIN_DASHBOARD_ROUTE = '/admin/dashboard'
const ADMIN_RETURN_PATH_KEY = 'adminReturnPath'

type SupportedRouterMode = 'browser' | 'hash'

interface LocationLike {
  pathname: string
  search?: string
  hash?: string
}

function normalizeBasePath(baseUrl: string) {
  if (!baseUrl || baseUrl === '/' || baseUrl === './' || baseUrl === '.') {
    return ''
  }

  return `/${baseUrl.replace(/^\/+|\/+$/g, '')}`
}

export function normalizeAdminRoutePath(path: string | null | undefined) {
  if (!path) {
    return null
  }

  const trimmed = path.trim()
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  if (!normalized.startsWith('/admin')) {
    return null
  }

  if (normalized === ADMIN_LOGIN_ROUTE || normalized === `${ADMIN_LOGIN_ROUTE}/`) {
    return null
  }

  return normalized
}

export function getCurrentAdminRoutePathFromLocation(
  location: LocationLike,
  mode: SupportedRouterMode,
  baseUrl = '/',
) {
  if (mode === 'hash') {
    return normalizeAdminRoutePath((location.hash ?? '').replace(/^#/, ''))
  }

  const normalizedBasePath = normalizeBasePath(baseUrl)
  const pathname = normalizedBasePath
    ? location.pathname.startsWith(normalizedBasePath)
      ? location.pathname.slice(normalizedBasePath.length) || '/'
      : location.pathname || '/'
    : location.pathname || '/'

  return normalizeAdminRoutePath(
    `${pathname}${location.search ?? ''}${location.hash ?? ''}`,
  )
}

export function buildAdminRedirectUrl(
  currentUrl: string,
  mode: SupportedRouterMode,
  route: string,
  baseUrl = '/',
) {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const url = new URL(currentUrl)

  if (mode === 'hash') {
    url.hash = normalizedRoute
    return url.toString()
  }

  const normalizedBasePath = normalizeBasePath(baseUrl)

  url.pathname = `${normalizedBasePath}${normalizedRoute}` || normalizedRoute
  url.search = ''
  url.hash = ''

  return url.toString()
}

export function getAdminLoginUrl() {
  if (typeof window === 'undefined') {
    return ADMIN_LOGIN_ROUTE
  }

  return buildAdminRedirectUrl(
    window.location.href,
    routerMode as SupportedRouterMode,
    ADMIN_LOGIN_ROUTE,
    import.meta.env.BASE_URL,
  )
}

export function getCurrentAdminRoutePath() {
  if (typeof window === 'undefined') {
    return null
  }

  return getCurrentAdminRoutePathFromLocation(
    window.location,
    routerMode as SupportedRouterMode,
    import.meta.env.BASE_URL,
  )
}

export function setAdminReturnPath(path: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  const normalized = normalizeAdminRoutePath(path)

  if (normalized) {
    window.sessionStorage.setItem(ADMIN_RETURN_PATH_KEY, normalized)
    return
  }

  window.sessionStorage.removeItem(ADMIN_RETURN_PATH_KEY)
}

export function getAdminReturnPath() {
  if (typeof window === 'undefined') {
    return null
  }

  return normalizeAdminRoutePath(
    window.sessionStorage.getItem(ADMIN_RETURN_PATH_KEY),
  )
}

export function clearAdminReturnPath() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(ADMIN_RETURN_PATH_KEY)
}

export function resolveAdminDestination(
  statePath: string | null | undefined,
  storedPath: string | null | undefined,
) {
  return (
    normalizeAdminRoutePath(statePath) ??
    normalizeAdminRoutePath(storedPath) ??
    ADMIN_DASHBOARD_ROUTE
  )
}

export function getAdminDashboardRoute() {
  return ADMIN_DASHBOARD_ROUTE
}

export function getAdminLoginRoute() {
  return ADMIN_LOGIN_ROUTE
}
