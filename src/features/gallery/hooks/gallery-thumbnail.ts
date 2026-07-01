export type GalleryThumbnailSession = {
  sessionId: string
  previewVersion?: number
}

const GALLERY_THUMBNAIL_CACHE_TTL_MS = 5 * 60_000

const galleryThumbnailCache = new Map<
  string,
  { objectUrl: string; createdAt: number }
>()
const galleryThumbnailRequests = new Map<string, Promise<string | undefined>>()

export const getGalleryThumbnailUrl = ({
  previewVersion,
  sessionId,
}: GalleryThumbnailSession): string => {
  const version = encodeURIComponent(String(previewVersion ?? 0))
  return `/api/sessions/${encodeURIComponent(sessionId)}/gallery-thumb?v=${version}`
}

export const resolveGalleryThumbnail = async (
  thumbnailUrl: string,
): Promise<string | undefined> => {
  const cached = galleryThumbnailCache.get(thumbnailUrl)
  if (
    cached &&
    Date.now() - cached.createdAt < GALLERY_THUMBNAIL_CACHE_TTL_MS
  ) {
    return cached.objectUrl
  }

  if (cached) {
    URL.revokeObjectURL(cached.objectUrl)
    galleryThumbnailCache.delete(thumbnailUrl)
  }

  const pending = galleryThumbnailRequests.get(thumbnailUrl)
  if (pending) return pending

  const request = fetch(thumbnailUrl)
    .then(async (response) => {
      if (!response.ok) throw new Error(`thumbnail ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      galleryThumbnailCache.set(thumbnailUrl, {
        objectUrl,
        createdAt: Date.now(),
      })
      return objectUrl
    })
    .catch(() => undefined)
    .finally(() => {
      galleryThumbnailRequests.delete(thumbnailUrl)
    })

  galleryThumbnailRequests.set(thumbnailUrl, request)
  return request
}
