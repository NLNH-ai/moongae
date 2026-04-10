import { describe, expect, it } from 'vitest'
import {
  buildAdminRedirectUrl,
  getCurrentAdminRoutePathFromLocation,
  normalizeAdminRoutePath,
  resolveAdminDestination,
} from '../../src/utils/adminNavigation'

describe('adminNavigation', () => {
  it('normalizes only protected admin routes', () => {
    expect(normalizeAdminRoutePath('/admin')).toBeNull()
    expect(normalizeAdminRoutePath('/admin/history')).toBe('/admin/history')
    expect(normalizeAdminRoutePath('/admin/content?tab=hero')).toBe(
      '/admin/content?tab=hero',
    )
    expect(normalizeAdminRoutePath('/business')).toBeNull()
  })

  it('builds a hash-router login URL without losing the current base path', () => {
    expect(
      buildAdminRedirectUrl(
        'https://example.com/moongae/docs/site/#/admin/history',
        'hash',
        '/admin',
        './',
      ),
    ).toBe('https://example.com/moongae/docs/site/#/admin')
  })

  it('extracts the current protected route for browser and hash routers', () => {
    expect(
      getCurrentAdminRoutePathFromLocation(
        {
          pathname: '/admin/history',
          search: '?page=2',
          hash: '',
        },
        'browser',
        '/',
      ),
    ).toBe('/admin/history?page=2')

    expect(
      getCurrentAdminRoutePathFromLocation(
        {
          pathname: '/moongae/docs/site/',
          search: '',
          hash: '#/admin/content',
        },
        'hash',
        './',
      ),
    ).toBe('/admin/content')
  })

  it('resolves the post-login destination from state, stored path, or dashboard fallback', () => {
    expect(
      resolveAdminDestination('/admin/history', '/admin/content'),
    ).toBe('/admin/history')
    expect(resolveAdminDestination(null, '/admin/content')).toBe('/admin/content')
    expect(resolveAdminDestination('/admin', null)).toBe('/admin/dashboard')
  })
})

