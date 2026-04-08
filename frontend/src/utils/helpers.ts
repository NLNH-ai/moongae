import type { HistoryEntry, HistoryGroup } from '../types/domain'

export function groupHistoryByYear(entries: HistoryEntry[]) {
  return entries.reduce<Record<number, HistoryEntry[]>>((accumulator, entry) => {
    accumulator[entry.year] ??= []
    accumulator[entry.year].push(entry)
    return accumulator
  }, {})
}

export function flattenHistoryGroups(groups: HistoryGroup[]) {
  return groups.flatMap((group) => group.items)
}

export function trimText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}...`
}

export function toHistoryGroups(entries: HistoryEntry[]) {
  const grouped = groupHistoryByYear(entries)

  return Object.entries(grouped)
    .map(([year, items]) => ({
      year: Number(year),
      items: [...items].sort((left, right) => left.displayOrder - right.displayOrder),
    }))
    .sort((left, right) => right.year - left.year)
}
