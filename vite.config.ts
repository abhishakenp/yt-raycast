import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import type { Plugin as RollupPlugin } from 'rollup'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { assertNoClientExposedSecrets } from './scripts/assert-no-secret-vite-vars'

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

function clampInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

function orientationFromSize(
  w: number,
  h: number,
): 'landscape' | 'portrait' | 'square' {
  const ratio = w / h
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

function seedIndex(seed: string, length: number) {
  if (length <= 1) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % length
}

function picsumUrl(query: string, w: number, h: number) {
  const seed =
    query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image'
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

function choosePhotoUrl(photo: PexelsPhoto | undefined, w: number, h: number) {
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

async function searchPexels(query: string, w: number, h: number, seed: string) {
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

async function searchUnsplash(
  query: string,
  w: number,
  h: number,
  seed: string,
) {
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

async function resolvePexelsUrl(requestUrl: string) {
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

function normalizeModuleId(moduleId: string) {
  const normalized = moduleId.replaceAll('\\', '/')
  const queryIndex = normalized.indexOf('?')
  const path = queryIndex === -1 ? normalized : normalized.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : normalized.slice(queryIndex)
  const isAbsolute = path.startsWith('/')
  const parts: string[] = []

  for (const part of path.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (parts.length > 0 && parts.at(-1) !== '..') {
        parts.pop()
      } else if (!isAbsolute) {
        parts.push(part)
      }
      continue
    }
    parts.push(part)
  }

  return `${isAbsolute ? '/' : ''}${parts.join('/')}${query}`
}

function isOpenUIBlocksSourceModule(moduleId: string) {
  return normalizeModuleId(moduleId).includes('/packages/ship-fast-blocks/src/')
}

function isOpenUIGeneratedMetadataModule(moduleId: string) {
  return normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/generated/',
  )
}

function isOpenUIRuntimeModule(moduleId: string) {
  return (
    isOpenUIBlocksSourceModule(moduleId) &&
    !isOpenUIGeneratedMetadataModule(moduleId)
  )
}

function getOpenUIBlocksSourcePath(moduleId: string) {
  const normalized = normalizeModuleId(moduleId)
  const marker = '/packages/ship-fast-blocks/src/'
  const markerIndex = normalized.indexOf(marker)
  if (markerIndex < 0) return null
  return normalized.slice(markerIndex + marker.length)
}

function isOpenUICatalogIndexModule(moduleId: string) {
  const sourcePath = getOpenUIBlocksSourcePath(moduleId)
  return (
    sourcePath === 'index.ts' ||
    sourcePath === 'library.ts' ||
    sourcePath === 'registry/all.ts'
  )
}

function isOpenUIThemeModule(moduleId: string) {
  const sourcePath = getOpenUIBlocksSourcePath(moduleId)
  return (
    sourcePath === 'theme.ts' ||
    sourcePath === 'theme-presets.ts' ||
    sourcePath === 'theme-apply.ts'
  )
}

function isOpenUISupportModule(moduleId: string) {
  const sourcePath = getOpenUIBlocksSourcePath(moduleId)
  return Boolean(
    sourcePath?.startsWith('section-kit/') ||
    sourcePath?.startsWith('lib/') ||
    sourcePath === 'integrations.tsx',
  )
}

function isOpenUIPrimitiveModule(moduleId: string) {
  return normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/registry/primitives/',
  )
}

function isOpenUISectionModule(moduleId: string) {
  return normalizeModuleId(moduleId).includes(
    '/packages/ship-fast-blocks/src/registry/sections/',
  )
}

function sanitizeChunkName(value: string) {
  return value
    .replace(/\.(?:tsx?|jsx?)$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function getPathSegmentAfter(moduleId: string, marker: string) {
  const normalized = normalizeModuleId(moduleId)
  const markerIndex = normalized.indexOf(marker)
  if (markerIndex < 0) return null
  const rest = normalized.slice(markerIndex + marker.length)
  return rest.split('/').filter(Boolean)[0] ?? null
}

function getOpenUIFileBaseName(moduleId: string) {
  return sanitizeChunkName(
    normalizeModuleId(moduleId).split('/').at(-1) ?? 'module',
  )
}

function getOpenUICapsuleFileName(moduleId: string) {
  const normalized = normalizeModuleId(moduleId)
  if (!normalized.includes('/packages/ship-fast-blocks/src/capsules/'))
    return null
  return normalized.split('/').at(-1)?.toLowerCase() ?? null
}

function isOpenUIRuntimeCoreModule(moduleId: string) {
  return (
    isOpenUIRuntimeModule(moduleId) &&
    !isOpenUICatalogIndexModule(moduleId) &&
    !isOpenUIThemeModule(moduleId) &&
    !isOpenUISupportModule(moduleId) &&
    !isOpenUIPrimitiveModule(moduleId) &&
    !isOpenUISectionModule(moduleId) &&
    getOpenUICapsuleFileName(moduleId) === null
  )
}

function getOpenUIRuntimeChunkName(moduleId: string) {
  if (!isOpenUIRuntimeModule(moduleId)) return null
  if (isOpenUICatalogIndexModule(moduleId)) return null
  if (isOpenUIThemeModule(moduleId)) return 'openui-theme'
  if (isOpenUISupportModule(moduleId)) return 'openui-runtime-support'
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

function isOpenUIPromptSpecModule(moduleId: string) {
  const normalized = normalizeModuleId(moduleId)
  return (
    normalized.includes('/packages/ship-fast-engine/src/genui/generated/') ||
    normalized.includes('/packages/ship-fast-engine/src/generated/')
  )
}

// Bundled CJS dependencies (notably `typescript`, pulled in by the OpenUI export
// builders) reference the CommonJS globals `__filename` / `__dirname`. In the
// Nitro `nodeServer` ESM output those identifiers are undefined, so the first use
// throws `ReferenceError: __filename is not defined in ES module scope` and every
// SSR request that touches an export builder 500s. Inject per-chunk definitions so
// the free identifiers resolve to the running module's path. Only chunks that
// actually reference the globals are touched, and any chunk that already declares
// them is skipped to avoid a redeclaration SyntaxError.
function cjsDirnameShim(): RollupPlugin {
  return {
    name: 'ship-fast-cjs-dirname-shim',
    renderChunk(code: string) {
      if (!/(?<![.\w])__(?:filename|dirname)\b/.test(code)) return null
      if (/(?:const|let|var)\s+__(?:filename|dirname)\b/.test(code)) return null
      const shim =
        "import { fileURLToPath as __shimFileURLToPath } from 'node:url'\n" +
        'const __filename = __shimFileURLToPath(import.meta.url)\n' +
        "const __dirname = __filename.slice(0, Math.max(0, __filename.lastIndexOf('/')))\n"
      return { code: shim + code, map: null }
    },
  }
}

function pexelsDevApi(): Plugin {
  return {
    name: 'ship-fast-pexels-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/pexels', async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }

        // Delegate to the real route handler so the Pollinations proxy +
        // caching path runs in dev too. The inline Pexels/Unsplash resolver
        // below is kept only as a fallback if the route handler import fails
        // (e.g. during a broken HMR state).
        try {
          const { createPexelsPreviewImageResponse } =
            await import('./src/features/images/server/pexels-preview-image')
          const host = req.headers.host ?? 'localhost:3000'
          const request = new Request(
            new URL(req.url ?? '', `http://${host}/api/pexels`),
            { method: req.method },
          )
          const response = await createPexelsPreviewImageResponse(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          if (req.method === 'HEAD') {
            res.end()
            return
          }
          res.end(Buffer.from(await response.arrayBuffer()))
          return
        } catch (error) {
          console.error(
            '[pexels-dev-api] route handler failed, falling back to inline resolver:',
            error,
          )
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
  }
}

function logrocketDevProxy(): Plugin {
  return {
    name: 'ship-fast-logrocket-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? '', 'http://localhost/')
        if (!requestUrl.pathname.startsWith('/api/logrocket/')) {
          next()
          return
        }

        try {
          const proxyReq = new Request(requestUrl, {
            method: req.method,
            headers: new Headers(req.headers as Record<string, string>),
          })
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk as Buffer)
            proxyReq.headers.delete('content-length')
          }
          const { proxyLogRocketRequest } =
            await import('./src/features/logrocket/server/logrocket-proxy')
          const proxyRes = await proxyLogRocketRequest(proxyReq)
          res.statusCode = proxyRes.status
          proxyRes.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          const body = await proxyRes.arrayBuffer()
          res.end(Buffer.from(body))
        } catch (error) {
          res.statusCode = 502
          res.end('LogRocket proxy error')
        }
      })
    },
  }
}

function galleryImageRouteDevProxy(): Plugin {
  return {
    name: 'ship-fast-gallery-image-route-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }

        const requestUrl = new URL(req.url ?? '', 'http://localhost/')
        if (!requestUrl.pathname.startsWith('/api/images/')) {
          next()
          return
        }

        if (requestUrl.searchParams.has('__gallery_image_bypass')) {
          next()
          return
        }

        const parts = requestUrl.pathname.split('/').filter(Boolean)
        const sessionId = parts[2]
        if (!sessionId) {
          next()
          return
        }

        try {
          const host = req.headers.host ?? 'localhost:3000'
          const forwardedUrl = new URL(
            `/api/images/${encodeURIComponent(sessionId)}`,
            `http://${host}`,
          )
          requestUrl.searchParams.forEach((value, key) => {
            if (key !== '__gallery_image_bypass') {
              forwardedUrl.searchParams.append(key, value)
            }
          })
          forwardedUrl.searchParams.set('__gallery_image_bypass', '1')

          const forwardedHeaders = new Headers()
          Object.entries(req.headers).forEach(([key, value]) => {
            if (
              value === undefined ||
              key === 'host' ||
              key === 'connection' ||
              key === 'content-length' ||
              key === 'sec-fetch-dest'
            ) {
              return
            }
            if (Array.isArray(value)) {
              value.forEach((item) => forwardedHeaders.append(key, item))
              return
            }
            forwardedHeaders.set(key, value)
          })

          const response = await fetch(forwardedUrl, {
            headers: forwardedHeaders,
            method: req.method,
          })

          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })

          if (req.method === 'HEAD') {
            res.end()
            return
          }

          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// --- Subdomain rewrite (dev server) -----------------------------------------
// TanStack Router's `rewrite.input` only receives a URL object whose host is
// `localhost:3000` in the Vite dev server — it cannot see the `Host` header
// that carries the deployment subdomain. This middleware rewrites `req.url`
// from `/<path>` to `/deployed/<slug>/<path>` BEFORE the Nitro/TanStack handler
// sees it, so SSR matches the `/deployed/$slug/$` route. The router's
// `rewrite.output` then maps the internal path back to `/<path>` for the
// browser URL. In production, a Nitro middleware does the same thing (see
// `server/middleware/subdomain-rewrite.ts`).
const SUBDOMAIN_BASE_DOMAIN = (
  devEnv.NEXT_PUBLIC_BASE_DOMAIN ||
  process.env.NEXT_PUBLIC_BASE_DOMAIN ||
  'ship-fast.ai'
)
  .toLowerCase()
  .replace(/^\.+|\.+$/g, '')
const SUBDOMAIN_RESERVED_HOST_LABELS = new Set([
  'admin',
  'agent',
  'api',
  'app',
  'assets',
  'canva',
  'cdn',
  'convex',
  'convex-backend',
  'convex-dashboard',
  'convex-studio',
  'dashboard',
  'free-preview',
  'medusa',
  'partners',
  'www',
])
const SUBDOMAIN_RESERVED_EXACT_PATHS = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
])
const SUBDOMAIN_RESERVED_PATH_PREFIXES = [
  '/api/',
  '/export/',
  // Vite dev server internal asset paths — must not be rewritten
  '/@',
  '/src/',
  '/node_modules/',
  '/favicon',
  // App source modules served by Vite — must not be rewritten
  '/convex/',
  '/packages/',
  '/lib/',
  '/medusa-backend/',
]
const SUBDOMAIN_INTERNAL_PREFIX = '/deployed/'
// File extensions that indicate a static asset, not a route — skip rewrite.
// Route paths never have file extensions.
const SUBDOMAIN_ASSET_EXTENSION = /\.[a-zA-Z0-9]{1,8}$/

function resolveSubdomainSlug(host: string): string | undefined {
  const hostname = host.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? ''
  if (!hostname || !SUBDOMAIN_BASE_DOMAIN) return undefined
  if (
    hostname === SUBDOMAIN_BASE_DOMAIN ||
    hostname === `www.${SUBDOMAIN_BASE_DOMAIN}`
  ) {
    return undefined
  }
  if (!hostname.endsWith(`.${SUBDOMAIN_BASE_DOMAIN}`)) return undefined
  const label = hostname.slice(0, -1 * `.${SUBDOMAIN_BASE_DOMAIN}`.length)
  if (
    !label ||
    label.includes('.') ||
    SUBDOMAIN_RESERVED_HOST_LABELS.has(label)
  ) {
    return undefined
  }
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  return slug || undefined
}

function subdomainRewriteDevMiddleware(): Plugin {
  return {
    name: 'ship-fast-subdomain-rewrite-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        const forwardedHost = req.headers['x-forwarded-host'] as
          | string
          | undefined
        const host = forwardedHost ?? req.headers.host ?? ''
        const slug = resolveSubdomainSlug(host)
        if (slug === undefined) {
          next()
          return
        }
        const pathname = req.url ?? '/'
        const queryIndex = pathname.indexOf('?')
        const path =
          queryIndex === -1 ? pathname : pathname.slice(0, queryIndex)
        const query = queryIndex === -1 ? '' : pathname.slice(queryIndex)
        if (path.startsWith(SUBDOMAIN_INTERNAL_PREFIX)) {
          next()
          return
        }
        if (SUBDOMAIN_RESERVED_EXACT_PATHS.has(path)) {
          next()
          return
        }
        for (const prefix of SUBDOMAIN_RESERVED_PATH_PREFIXES) {
          if (path.startsWith(prefix)) {
            next()
            return
          }
        }
        // Skip paths with file extensions — they're static assets, not routes
        if (SUBDOMAIN_ASSET_EXTENSION.test(path)) {
          next()
          return
        }
        const rest = path === '/' ? '' : path
        req.url = `/deployed/${slug}${rest}${query}`
        next()
      })
    },
  }
}

/**
 * `envPrefix` inlines every VITE_/NEXT_PUBLIC_ variable into the public
 * bundle. Fail the build rather than silently publish a credential that was
 * given the wrong prefix.
 */
function clientSecretExposureGuard(): Plugin {
  return {
    name: 'ship-fast-client-secret-exposure-guard',
    enforce: 'pre',
    config() {
      assertNoClientExposedSecrets()
    },
  }
}

const config = defineConfig({
  define: {
    'import.meta.env.MEDUSA_BACKEND_URL': JSON.stringify(
      devEnv.MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || '',
    ),
    // site-config.ts reads BASE_DOMAIN via process.env.NEXT_PUBLIC_BASE_DOMAIN.
    // Vite's envPrefix only exposes vars via import.meta.env, not process.env,
    // so explicitly define it for the client bundle.
    'process.env.NEXT_PUBLIC_BASE_DOMAIN': JSON.stringify(
      devEnv.NEXT_PUBLIC_BASE_DOMAIN ||
        process.env.NEXT_PUBLIC_BASE_DOMAIN ||
        'ship-fast.ai',
    ),
  },
  envPrefix: [
    'VITE_',
    'NEXT_PUBLIC_',
    'CONVEX_URL',
    'CONVEX_SELF_HOSTED_URL',
    'MEDUSA_ADMIN_URL',
    'MEDUSA_STOREFRONT_',
    'MEDUSA_PUBLISHABLE_',
  ],
  resolve: { tsconfigPaths: true },
  server: {
    allowedHosts: ['.ship-fast.ai', '.ship-fast.test'],
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
    clientSecretExposureGuard(),
    devtools(),
    pexelsDevApi(),
    logrocketDevProxy(),
    galleryImageRouteDevProxy(),
    subdomainRewriteDevMiddleware(),
    nitro({
      rollupConfig: {
        external: [/^@sentry\//],
        plugins: [cjsDirnameShim()],
      },
      preset: 'nodeServer',
      serverDir: './server',
      // Nitro scans `server/**/*.{ts,tsx,...}` and imports every match as a
      // middleware/route handler. Co-located `*.test.*` files call `vi.mock()`
      // at module top level, which explodes outside a vitest runner
      // ("Vitest mocker was not initialized"). Exclude test files from the
      // scan so they never enter the app bundle.
      ignore: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
