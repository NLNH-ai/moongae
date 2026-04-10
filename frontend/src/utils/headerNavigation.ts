import type { HeaderMenuSection } from '../types/navigation'

function normalizePath(pathname: string) {
  if (!pathname) {
    return '/'
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

export function getActiveHeaderSectionId(
  sections: HeaderMenuSection[],
  pathname: string,
) {
  const normalizedPath = normalizePath(pathname)

  const matchedSection = sections.find((section) =>
    section.matchPaths.some((matchPath) => {
      const normalizedMatchPath = normalizePath(matchPath)

      return (
        normalizedPath === normalizedMatchPath ||
        normalizedPath.startsWith(`${normalizedMatchPath}/`)
      )
    }),
  )

  return matchedSection?.id ?? null
}

export function getDefaultHeaderSectionId(
  sections: HeaderMenuSection[],
  preferredSectionId: string | null,
) {
  if (preferredSectionId && sections.some((section) => section.id === preferredSectionId)) {
    return preferredSectionId
  }

  return sections[0]?.id ?? null
}
