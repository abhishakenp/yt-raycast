export const GALLERY_PAGE_SIZE = 12

export const publicGalleryQueryKey = (page: number) =>
  ['sf-public-gallery', page, GALLERY_PAGE_SIZE] as const

export type PublicGalleryPayload = {
  items: unknown[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PublicGalleryFetchResult = {
  ok: boolean
  items: PublicGallerySessionSummary[]
  data: PublicGalleryPayload | null
}

export type PublicGallerySessionSummary = {
  id: string
  prompt?: string
  generationTime?: number
  elapsed?: number | null
  cost?: number | null
  createdAt?: string
  homepageReady?: boolean
}

export const fetchPublicGalleryPage = async (page: number): Promise<PublicGalleryFetchResult> => {
  const r = await fetch(`/api/sessions/recent?page=${page}&limit=${GALLERY_PAGE_SIZE}`)
  if (!r.ok) throw new Error('recent-sessions')
  const data = (await r.json()) as PublicGalleryPayload
  const items = Array.isArray(data.items) ? (data.items as PublicGallerySessionSummary[]) : []
  return { ok: true, items, data }
}
