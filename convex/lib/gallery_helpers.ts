import type { Doc } from '../_generated/dataModel'

const ongoingGalleryStatuses = new Set([
  'created',
  'queued',
  'validating',
  'streaming',
])

// Sessions with these terminal statuses should never appear in the gallery,
// even though they are no longer "ongoing".  Failed generations have no
// renderable output and must not clutter the grid.
const hiddenGalleryStatuses = new Set(['failed'])

export function hasGalleryReadySignal(session: Doc<'sessions'>): boolean {
  return (
    session.genuiStatus === 'done' ||
    session.openuiReady === true ||
    session.status === 'preview_ready' ||
    (session.previewVersion ?? 0) > 0
  )
}

export function isGalleryVisibleSession(session: Doc<'sessions'>): boolean {
  if (session.isDraft === true) return false

  const status = session.status
  if (status !== undefined && ongoingGalleryStatuses.has(status))
    return hasGalleryReadySignal(session)
  if (status !== undefined && hiddenGalleryStatuses.has(status)) return false
  if (status !== undefined) return true

  return hasGalleryReadySignal(session)
}

export const galleryCategoryTerms = {
  saas: [
    'saas',
    'software',
    'platform',
    'dashboard',
    'analytics',
    'copilot',
    'ai',
  ],
  commerce: [
    'store',
    'shop',
    'ecommerce',
    'commerce',
    'product',
    'checkout',
    'subscription',
  ],
  portfolio: [
    'portfolio',
    'studio',
    'agency',
    'consultancy',
    'case studies',
    'architecture',
  ],
  blog: ['blog', 'publication', 'news', 'story', 'stories', 'article'],
  service: [
    'service',
    'booking',
    'local',
    'gym',
    'wellness',
    'grooming',
    'restaurant',
  ],
  app: ['app', 'mobile', 'tool', 'planner', 'manager', 'studio'],
} as const

export function getGalleryCategories(prompt: string): string[] {
  const normalizedPrompt = prompt.toLowerCase()

  return Object.entries(galleryCategoryTerms)
    .filter(([, terms]) =>
      terms.some((term) => normalizedPrompt.includes(term)),
    )
    .map(([category]) => category)
}

export function formatGalleryCategory(category: string): string {
  return category
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

export function getGalleryCategoryOptions(sessions: Doc<'sessions'>[]) {
  const counts = new Map<string, number>()

  for (const session of sessions) {
    for (const category of getGalleryCategories(session.prompt)) {
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .sort(
      ([categoryA, countA], [categoryB, countB]) =>
        countB - countA || categoryA.localeCompare(categoryB),
    )
    .map(([value, count]) => ({
      value,
      label: formatGalleryCategory(value),
      count,
    }))
}

export function matchesGalleryFilters(
  session: Doc<'sessions'>,
  search: string | undefined,
  category: string | undefined,
): boolean {
  const categories = getGalleryCategories(session.prompt)
  const normalizedCategory = category?.trim().toLowerCase()
  if (
    normalizedCategory !== undefined &&
    normalizedCategory.length > 0 &&
    !categories.includes(normalizedCategory)
  ) {
    return false
  }

  const normalizedSearch = search?.trim().toLowerCase()
  if (normalizedSearch === undefined || normalizedSearch.length === 0)
    return true

  return [
    session._id,
    session.prompt,
    session.status,
    session.genuiStatus,
    ...(categories.length > 0 ? categories : ['website']),
  ]
    .filter((value): value is string => typeof value === 'string')
    .some((value) => value.toLowerCase().includes(normalizedSearch))
}
