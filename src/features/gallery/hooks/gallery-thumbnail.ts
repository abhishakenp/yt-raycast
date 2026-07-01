export type GalleryThumbnailSession = {
  sessionId: string
  previewVersion?: number
}

// Gallery previews must come from server-rendered static HTML or a local
// gradient placeholder — never from a fetched PNG thumbnail. These helpers are
// intentionally no-ops so callers never build a thumbnail URL or fetch a blob.
export const getGalleryThumbnailUrl = (
  _session: GalleryThumbnailSession,
): string => ''

export const resolveGalleryThumbnail = async (
  _thumbnailUrl: string,
): Promise<string | undefined> => undefined
