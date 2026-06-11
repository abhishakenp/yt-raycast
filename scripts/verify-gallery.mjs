#!/usr/bin/env node

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 10000)

if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
  fail('--timeout-ms must be a positive number')
}

const galleryPage = await request('/gallery')
assert(galleryPage.status === 200, `/gallery returned ${galleryPage.status}`)
assert(
  galleryPage.contentType.includes('text/html'),
  '/gallery should return HTML',
)
assert(
  galleryPage.body.length > 1000 && /gallery|public/i.test(galleryPage.body),
  '/gallery should render a non-empty page',
)

const apiPage = await request('/api/gallery?limit=2&page=1')
assert(apiPage.status === 200, `/api/gallery returned ${apiPage.status}`)
assert(
  apiPage.contentType.includes('application/json'),
  '/api/gallery should return JSON',
)

const gallery = parseJson(apiPage.body, '/api/gallery response')
assertGalleryPayload(gallery, '/api/gallery')
assert(
  !apiPage.body.includes('FunctionPathNotFound') &&
    !apiPage.body.includes('fetch failed'),
  '/api/gallery leaked backend failure text',
)

const recentPage = await request('/api/sessions/recent?limit=2&page=1&query=site')
assert(recentPage.status === 200, `/api/sessions/recent returned ${recentPage.status}`)
assert(
  recentPage.contentType.includes('application/json'),
  '/api/sessions/recent should return JSON',
)
const recent = parseJson(recentPage.body, '/api/sessions/recent response')
assertGalleryPayload(recent, '/api/sessions/recent')
assert(
  !recentPage.body.includes('FunctionPathNotFound') &&
    !recentPage.body.includes('fetch failed'),
  '/api/sessions/recent leaked backend failure text',
)

let thumbnail = null
const firstItem = gallery.items[0]
if (firstItem !== undefined) {
  const sessionId =
    typeof firstItem.sessionId === 'string'
      ? firstItem.sessionId
      : typeof firstItem.id === 'string'
        ? firstItem.id
        : null
  assert(sessionId, 'gallery item must expose sessionId or id')

  const thumbnailPage = await request(
    `/api/sessions/${encodeURIComponent(sessionId)}/gallery-thumb`,
  )
  assert(
    thumbnailPage.status === 200,
    `/api/sessions/${sessionId}/gallery-thumb returned ${thumbnailPage.status}`,
  )
  assert(
    thumbnailPage.contentType.includes('image/svg+xml'),
    'gallery thumbnail should return SVG',
  )
  assert(
    /<svg\b/i.test(thumbnailPage.body) &&
      !thumbnailPage.body.includes('FunctionPathNotFound') &&
      !thumbnailPage.body.includes('fetch failed'),
    'gallery thumbnail should be a generated SVG without backend failure text',
  )
  thumbnail = {
    sessionId,
    bytes: thumbnailPage.body.length,
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      items: gallery.items.length,
      recentItems: recent.items.length,
      availableCategories: gallery.availableCategories.length,
      hasNext: gallery.hasNext,
      hasPrev: gallery.hasPrev,
      thumbnail,
    },
    null,
    2,
  ),
)

async function request(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: '*/*' },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    body: await response.text(),
  }
}

function parseJson(value, label) {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertGalleryPayload(payload, label) {
  assert(Array.isArray(payload.items), `${label} must include items array`)
  assert(
    typeof payload.hasNext === 'boolean' && typeof payload.hasPrev === 'boolean',
    `${label} must include pagination booleans`,
  )
  assert(
    Array.isArray(payload.availableCategories),
    `${label} must include availableCategories array`,
  )
  assert(
    Number.isInteger(payload.page) &&
      Number.isInteger(payload.limit) &&
      Number.isInteger(payload.total) &&
      Number.isInteger(payload.totalPages),
    `${label} must include integer page metadata`,
  )
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, errors: [message] }, null, 2))
  process.exit(1)
}
