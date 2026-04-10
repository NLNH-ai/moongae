export interface HeaderMenuChild {
  id: string
  label: string
  href: string
  description?: string
}

export interface HeaderMenuSection {
  id: string
  label: string
  href: string
  matchPaths: string[]
  summary: string
  children: HeaderMenuChild[]
}
