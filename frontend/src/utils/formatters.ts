import { BRAND_NAME } from '../config/branding'

export function formatMonth(month: number) {
  return `${String(month).padStart(2, '0')}\uc6d4`
}

export function formatPageTitle(title: string, suffix = BRAND_NAME) {
  return `${title} | ${suffix}`
}

export function formatKoreanDate(dateString: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

export function getDecadeLabel(year: number) {
  const decade = Math.floor(year / 10) * 10
  return `${decade}s`
}
