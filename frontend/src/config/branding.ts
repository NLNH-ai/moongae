export const BRAND_NAME = 'COMPANY LOGO'

export const BRAND_EMAIL = 'contact@example.com'

const legacyBrandPattern = /hanwha/i

export function resolveBrandName(candidate?: string | null) {
  return candidate && !legacyBrandPattern.test(candidate) ? candidate : BRAND_NAME
}

export function resolveBrandEmail(candidate?: string | null) {
  return candidate && !legacyBrandPattern.test(candidate) ? candidate : BRAND_EMAIL
}
