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

const sanitizeProviderWarning = (
  warning: unknown,
): { status: number } | null => {
  if (!warning || typeof warning !== 'object') return null
  const status = (warning as { status?: unknown }).status
  if (typeof status !== 'number') return null
  return { status }
}

const loadDefaultBrandProfileResolver =
  async (): Promise<BrandProfileResolver> => {
    const { resolveBrandfetchBrandProfile } =
      await import('@ship-fast/engine/brandfetch.js')

    return resolveBrandfetchBrandProfile
  }

export const createBrandProfileResponse = async (
  request: Request,
  resolver?: BrandProfileResolver,
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
    const resolveBrandProfile =
      resolver ?? (await loadDefaultBrandProfileResolver())
    const result = await resolveBrandProfile({ query, timeoutMs: 5500 })
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
        providerWarning: sanitizeProviderWarning(result.providerWarning),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
        },
      },
    )
  } catch {
    return json(
      {
        ok: false,
        error: 'Brand profile lookup failed.',
      },
      { status: 502 },
    )
  }
}
