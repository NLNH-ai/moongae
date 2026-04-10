import { describe, expect, it } from 'vitest'
import { headerMenuSections } from '../../src/config/header-menu'
import {
  getActiveHeaderSectionId,
  getDefaultHeaderSectionId,
} from '../../src/utils/headerNavigation'

describe('headerNavigation', () => {
  it('returns the active top-level section for nested public routes', () => {
    expect(getActiveHeaderSectionId(headerMenuSections, '/about/history')).toBe('about')
    expect(getActiveHeaderSectionId(headerMenuSections, '/business/3')).toBe('business')
    expect(getActiveHeaderSectionId(headerMenuSections, '/')).toBeNull()
  })

  it('falls back to the first section when there is no preferred section', () => {
    expect(getDefaultHeaderSectionId(headerMenuSections, 'business')).toBe('business')
    expect(getDefaultHeaderSectionId(headerMenuSections, null)).toBe('about')
    expect(getDefaultHeaderSectionId([], null)).toBeNull()
  })
})
