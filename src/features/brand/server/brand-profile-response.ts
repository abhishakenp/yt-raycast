import { resolveBrandfetchBrandProfile } from '@ship-fast/engine/brandfetch.js'

type BrandProfileResult = {
  ok?: boolean
  status?: number
  error?: string
  match?: unknown
  logo?: unknown
  palette?: unknown
  confidence?: number
  providerWarning?: unknown
}

type BrandProfileResolver = (input: {
  query: string
  timeoutMs?: number
}) => Promise<BrandProfileResult>

const MAX_BRAND_QUERY_LENGTH = 160

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const normalizeBrandQuery = (request: Request): string => {
  const url = new URL(request.url)
  const query =
    url.searchParams.get('query') ??
    url.searchParams.get('q') ??
    url.searchParams.get('domain') ??
    ''

  return query
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .slice(0, MAX_BRAND_QUERY_LENGTH)
}

const providerStatus = (value: number | undefined): number =>
  value !== undefined && value >= 400 && value < 500 ? value : 502

export const createBrandProfileResponse = async (
  request: Request,
  resolver: BrandProfileResolver = resolveBrandfetchBrandProfile,
): Promise<Response> => {
  const query = normalizeBrandQuery(request)

  if (query.length < 2) {
    return json(
      {
        ok: false,
        error: 'Brand query is required.',
      },
      { status: 422 },
    )
  }

  try {
    const result = await resolver({ query, timeoutMs: 5500 })
    if (result.ok !== true) {
      return json(
        {
          ok: false,
          error: result.error ?? 'Brand profile lookup failed.',
          status: result.status ?? null,
        },
        { status: providerStatus(result.status) },
      )
    }

    return json(
      {
        ok: true,
        query,
        match: result.match ?? null,
        logo: result.logo ?? null,
        palette: result.palette ?? null,
        confidence: result.confidence ?? null,
        providerWarning: result.providerWarning ?? null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Brand profile lookup failed.',
      },
      { status: 502 },
    )
  }
}
