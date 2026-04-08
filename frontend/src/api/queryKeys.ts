export const publicQueryKeys = {
  company: ['public', 'company'] as const,
  history: ['public', 'history'] as const,
  business: ['public', 'business'] as const,
  businessDetail: (id: number | string) => ['public', 'business', id] as const,
  pageContents: (pageKey: string) => ['public', 'content', pageKey] as const,
  pageSection: (pageKey: string, sectionKey: string) =>
    ['public', 'content', pageKey, sectionKey] as const,
}
