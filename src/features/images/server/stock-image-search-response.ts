import { rateLimitByIp, stockImageHits } from '@/lib/rate-limit'
import { searchStockImages, type StockImageResult } from '@/lib/stock-image'

/** Upper bounds keep a crafted query from amplifying into a huge upstream fan-out. */
const MAX_PER_PAGE = 30
const MAX_PAGE = 20
const MAX_DIMENSION = 4000
const MAX_QUERY_LENGTH = 120

function json(body: unknown, init?: ResponseInit) {
  const status = init?.status ?? 200
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      // Only successful lookups are cacheable. Caching a 502 at the edge would
      // pin a transient upstream failure in front of every visitor.
      'Cache-Control': status >= 400 ? 'no-store' : 'public, max-age=300',
      ...init?.headers,
    },
  })
}

/**
 * Parse a positive integer query parameter, clamped to `max`. Returns
 * `undefined` for absent or non-numeric values so the caller's default wins —
 * `Number('abc')` is `NaN`, which used to flow straight into the upstream URL.
 */
function clampedInt(
  value: string | null,
  max: number,
  min = 1,
): number | undefined {
  if (value === null) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

/**
 * Server-side proxy for stock image searches. Keeps Pexels/Unsplash API keys
 * server-side only — they are NEVER exposed to the client bundle.
 *
 * Every call spends third-party API quota, so it is IP rate limited and every
 * numeric parameter is clamped before it reaches the upstream provider
 * (`perPage=100000` previously became a ~50 000-item upstream fetch).
 */
export async function createStockImageSearchResponse(
  request: Request,
): Promise<Response> {
  const limited = rateLimitByIp(request, stockImageHits, 60)
  if (limited) return limited

  const url = new URL(request.url)
  const query = (url.searchParams.get('q') ?? '')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)

  if (!query) {
    return json({ results: [] })
  }

  try {
    const results: StockImageResult[] = await searchStockImages({
      query,
      w: clampedInt(url.searchParams.get('w'), MAX_DIMENSION),
      h: clampedInt(url.searchParams.get('h'), MAX_DIMENSION),
      page: clampedInt(url.searchParams.get('page'), MAX_PAGE),
      perPage: clampedInt(url.searchParams.get('perPage'), MAX_PER_PAGE),
    })
    return json({ results })
  } catch {
    return json({ results: [] }, { status: 502 })
  }
}
