export const GALLERY_PAGE_SIZE = 12

export function publicGalleryQueryKey(page: number) {
  return ['sf-public-gallery', page, GALLERY_PAGE_SIZE] as const
}

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
  sessionId?: string
  prompt?: string
  generationTime?: number
  elapsed?: number | null
  cost?: number | null
  createdAt?: string
  updatedAt?: string | number
  homepageReady?: boolean
  siteSpecReady?: boolean | null
  openuiReady?: boolean | null
  readiness?: {
    homepageReady?: boolean | null
    siteSpecReady?: boolean | null
    openuiReady?: boolean | null
    previewReady?: boolean | null
  }
  html?: string | null
}

export type GalleryPageMeta = Omit<PublicGalleryPayload, 'items'>

function positiveInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

function nonNegativeInt(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback
}

export function normalizeGalleryMeta(
  raw: Partial<GalleryPageMeta> | null | undefined,
): GalleryPageMeta {
  const limit = positiveInt(raw?.limit, GALLERY_PAGE_SIZE)
  const total = nonNegativeInt(raw?.total, 0)
  const totalPages = Math.max(
    1,
    positiveInt(raw?.totalPages, Math.ceil(total / limit) || 1),
  )
  const page = Math.min(positiveInt(raw?.page, 1), totalPages)

  return {
    page,
    limit,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  }
}

export async function fetchPublicGalleryPage(
  page: number,
): Promise<PublicGalleryFetchResult> {
  const r = await fetch(`/api/gallery?page=${page}&limit=${GALLERY_PAGE_SIZE}`)
  if (!r.ok) throw new Error('recent-sessions')
  let data: PublicGalleryPayload
  try {
    data = (await r.json()) as PublicGalleryPayload
  } catch {
    throw new Error('recent-sessions')
  }
  const items = Array.isArray(data.items)
    ? (data.items as PublicGallerySessionSummary[])
    : []
  return { ok: true, items, data }
}
