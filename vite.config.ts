import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// `bun run dev` spawns vite under node, which does NOT inherit bun's auto-loaded
// .env vars. Read the env files directly so the dev image proxy actually has the
// keys (otherwise every image silently falls back to a random picsum photo).
const devEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')
const PEXELS_API_KEY = devEnv.PEXELS_API_KEY || process.env.PEXELS_API_KEY || ''
const UNSPLASH_ACCESS_KEY =
  devEnv.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY || ''

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

const clampInt = (
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

const orientationFromSize = (
  w: number,
  h: number,
): 'landscape' | 'portrait' | 'square' => {
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

const choosePhotoUrl = (
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
) => {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200)
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  if (w > 800 || h > 800)
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  if (w > 400 || h > 400)
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  return (
    photo.src.medium ??
    photo.src.large ??
    photo.src.large2x ??
    photo.src.original ??
    null
  )
}

type UnsplashPhoto = {
  urls?: { raw?: string; full?: string; regular?: string; small?: string }
}
type UnsplashResponse = { results?: UnsplashPhoto[] }

const searchPexels = async (
  query: string,
  w: number,
  h: number,
  seed: string,
) => {
  if (!PEXELS_API_KEY) return null
  const pexelsUrl = new URL('https://api.pexels.com/v1/search')
  pexelsUrl.searchParams.set('query', query.slice(0, 96))
  pexelsUrl.searchParams.set('per_page', '15')
  pexelsUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(pexelsUrl, {
      headers: { Authorization: PEXELS_API_KEY },
    })
    if (!response.ok) return null
    const data = (await response.json()) as PexelsResponse
    const photos = data.photos ?? []
    if (!photos.length) return null
    const photo = photos[seedIndex(seed, photos.length)]
    return choosePhotoUrl(photo, w, h)
  } catch {
    return null
  }
}

const searchUnsplash = async (
  query: string,
  w: number,
  h: number,
  seed: string,
) => {
  if (!UNSPLASH_ACCESS_KEY) return null
  const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
  unsplashUrl.searchParams.set('query', query.slice(0, 96))
  unsplashUrl.searchParams.set('per_page', '15')
  unsplashUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(unsplashUrl, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    })
    if (!response.ok) return null
    const data = (await response.json()) as UnsplashResponse
    const results = data.results ?? []
    if (!results.length) return null
    const photo = results[seedIndex(seed, results.length)]
    const base =
      photo?.urls?.regular ??
      photo?.urls?.small ??
      photo?.urls?.full ??
      photo?.urls?.raw
    if (!base) return null
    const targetW = Math.min(Math.max(w, 400), 2400)
    const targetH = Math.min(Math.max(h, 300), 1600)
    return `${base}&w=${targetW}&h=${targetH}&fit=crop`
  } catch {
    return null
  }
}

const resolvePexelsUrl = async (requestUrl: string) => {
  const url = new URL(requestUrl, 'http://localhost/api/pexels')
  const query =
    (url.searchParams.get('query') ?? url.searchParams.get('q') ?? '').trim() ||
    'nature'
  const w = clampInt(url.searchParams.get('w'), 800, 100, 2400)
  const h = clampInt(url.searchParams.get('h'), 600, 100, 2400)
  const seed = url.searchParams.get('seed') ?? query
  const fallback = picsumUrl(query, w, h)

  return (
    (await searchPexels(query, w, h, seed)) ??
    (await searchUnsplash(query, w, h, seed)) ??
    fallback
  )
}

const normalizeModuleId = (moduleId: string) => moduleId.replaceAll('\\', '/')

const isOpenUIBlocksSourceModule = (moduleId: string) =>
  normalizeModuleId(moduleId).includes('/packages/ship-fast-blocks/src/')

const isOpenUIGeneratedMetadataModule = (moduleId: string) =>
  normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/generated/',
  )

const isOpenUIRuntimeModule = (moduleId: string) =>
  isOpenUIBlocksSourceModule(moduleId) &&
  !isOpenUIGeneratedMetadataModule(moduleId)

const isOpenUIPrimitiveModule = (moduleId: string) =>
  normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/registry/primitives/',
  )

const isOpenUISectionModule = (moduleId: string) =>
  normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/registry/sections/',
  )

const sanitizeChunkName = (value: string) =>
  value
    .replace(/\.(?:tsx?|jsx?)$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const getPathSegmentAfter = (moduleId: string, marker: string) => {
  const normalized = normalizeModuleId(moduleId)
  const markerIndex = normalized.indexOf(marker)
  if (markerIndex < 0) return null
  const rest = normalized.slice(markerIndex + marker.length)
  return rest.split('/').filter(Boolean)[0] ?? null
}

const getOpenUIFileBaseName = (moduleId: string) =>
  sanitizeChunkName(normalizeModuleId(moduleId).split('/').at(-1) ?? 'module')

const getOpenUICapsuleFileName = (moduleId: string) => {
  const normalized = normalizeModuleId(moduleId)
  if (!normalized.includes('/packages/ship-fast-blocks/src/capsules/'))
    return null
  return normalized.split('/').at(-1)?.toLowerCase() ?? null
}

const isOpenUIRuntimeCoreModule = (moduleId: string) =>
  isOpenUIRuntimeModule(moduleId) &&
  !isOpenUIPrimitiveModule(moduleId) &&
  !isOpenUISectionModule(moduleId) &&
  getOpenUICapsuleFileName(moduleId) === null

const getOpenUIRuntimeChunkName = (moduleId: string) => {
  if (!isOpenUIRuntimeModule(moduleId)) return null
  if (isOpenUIPrimitiveModule(moduleId)) {
    return `openui-primitive-${getOpenUIFileBaseName(moduleId)}`
  }
  if (isOpenUISectionModule(moduleId)) {
    const vertical = getPathSegmentAfter(
      moduleId,
      '/packages/ship-fast-blocks/src/registry/sections/',
    )
    return `openui-section-${sanitizeChunkName(vertical ?? 'misc')}`
  }
  const capsuleFileName = getOpenUICapsuleFileName(moduleId)
  if (capsuleFileName) {
    return `openui-capsule-${getOpenUIFileBaseName(moduleId)}`
  }
  if (isOpenUIRuntimeCoreModule(moduleId)) return 'openui-runtime-core'
  return null
}

const isOpenUIPromptSpecModule = (moduleId: string) => {
  const normalized = normalizeModuleId(moduleId)
  return (
    normalized.includes('/packages/ship-fast-engine/src/genui/generated/') ||
    normalized.includes('/packages/ship-fast-engine/src/generated/')
  )
}

const pexelsDevApi = (): Plugin => ({
  name: 'ship-fast-pexels-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/pexels', async (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next()
        return
      }

      const photoUrl = await resolvePexelsUrl(req.url ?? '')
      res.statusCode = 302
      res.setHeader('Location', photoUrl)
      res.setHeader(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=86400',
      )
      res.end()
    })
  },
})

const config = defineConfig({
  envPrefix: [
    'VITE_',
    'NEXT_PUBLIC_',
    'CONVEX_URL',
    'CONVEX_SELF_HOSTED_URL',
    'MEDUSA_BACKEND_',
    'MEDUSA_ADMIN_URL',
    'MEDUSA_STOREFRONT_',
    'MEDUSA_PUBLISHABLE_',
  ],
  resolve: { tsconfigPaths: true },
  server: {
    allowedHosts: ['.ship-fast.io'],
  },
  // esbuild pulls in fsevents (native macOS binary) which Vite's rolldown
  // optimizer cannot parse as UTF-8. Exclude both from dep pre-bundling.
  optimizeDeps: {
    exclude: ['playwright', 'playwright-core', 'esbuild', 'fsevents'],
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'openui-generated-metadata',
              test: isOpenUIGeneratedMetadataModule,
              priority: 30,
            },
            {
              name: 'openui-prompt-spec',
              test: isOpenUIPromptSpecModule,
              priority: 20,
            },
            {
              name: getOpenUIRuntimeChunkName,
              test: (moduleId) => getOpenUIRuntimeChunkName(moduleId) !== null,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  plugins: [
    devtools(),
    pexelsDevApi(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      preset: 'nodeServer',
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
