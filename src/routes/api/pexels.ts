import { createFileRoute } from '@tanstack/react-router'

import { PEXELS_API_KEY } from '@ship-fast/engine/config.js'

type PexelsPhoto = {
  src?: {
    large?: string
    large2x?: string
    original?: string
    medium?: string
  }
}

type PexelsResponse = {
  photos?: PexelsPhoto[]
}

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

const orientationFromSize = (w: number, h: number): 'landscape' | 'portrait' | 'square' => {
  const ratio = w / h
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

const seedIndex = (seed: string, length: number) => {
  if (length <= 1) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % length
}

const picsumUrl = (query: string, w: number, h: number) => {
  const seed =
    query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

const redirect = (url: string, status = 302) =>
  new Response(null, {
    status,
    headers: {
      Location: url,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })

const choosePhotoUrl = (photo: PexelsPhoto | undefined, w: number, h: number) => {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200) return photo.src.original ?? photo.src.large2x ?? photo.src.large ?? photo.src.medium ?? null
  if (w > 800 || h > 800) return photo.src.large2x ?? photo.src.large ?? photo.src.original ?? photo.src.medium ?? null
  if (w > 400 || h > 400) return photo.src.large ?? photo.src.large2x ?? photo.src.medium ?? photo.src.original ?? null
  return photo.src.medium ?? photo.src.large ?? photo.src.large2x ?? photo.src.original ?? null
}

export const Route = createFileRoute('/api/pexels')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const query = (url.searchParams.get('query') ?? url.searchParams.get('q') ?? '').trim() || 'nature'
        const w = clampInt(url.searchParams.get('w'), 800, 100, 2400)
        const h = clampInt(url.searchParams.get('h'), 600, 100, 2400)
        const fallback = picsumUrl(query, w, h)

        if (!PEXELS_API_KEY) return redirect(fallback)

        const pexelsUrl = new URL('https://api.pexels.com/v1/search')
        pexelsUrl.searchParams.set('query', query.slice(0, 96))
        pexelsUrl.searchParams.set('per_page', '15')
        pexelsUrl.searchParams.set('orientation', orientationFromSize(w, h))

        try {
          const response = await fetch(pexelsUrl, {
            headers: { Authorization: PEXELS_API_KEY },
          })
          if (!response.ok) return redirect(fallback)

          const data = (await response.json()) as PexelsResponse
          const photos = data.photos ?? []
          const photo = photos[seedIndex(url.searchParams.get('seed') ?? query, photos.length)]
          const photoUrl = choosePhotoUrl(photo, w, h)

          return redirect(photoUrl ?? fallback)
        } catch {
          return redirect(fallback)
        }
      },
    },
  },
})
