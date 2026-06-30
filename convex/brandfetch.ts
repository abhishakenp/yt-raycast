import { v } from 'convex/values'
import { action } from './_generated/server'

const BRANDFETCH_API_URL = 'https://api.brandfetch.io/v2/search'
const DEFAULT_PAGE_SIZE = 5
const MAX_PAGE_SIZE = 5
const MAX_QUERY_LENGTH = 160

type RawBrandfetchResult = Record<string, unknown>

type BrandfetchLogoResult = {
  id: string
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
  verified: boolean
}

const textValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const normalizeQuery = (value: string): string =>
  value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .slice(0, MAX_QUERY_LENGTH)

const normalizeCursor = (value: string | null): number => {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const getBrandfetchHeaders = () => {
  const key = String(process.env.BRANDFETCH_API_KEY ?? '').trim()
  if (!key) {
    throw new Error('BRANDFETCH_API_KEY is not configured.')
  }
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${key}`,
    'X-API-Key': key,
  }
}

const rawResults = (data: unknown): RawBrandfetchResult[] => {
  if (Array.isArray(data)) return data as RawBrandfetchResult[]
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { results?: unknown }).results)
  ) {
    return (data as { results: RawBrandfetchResult[] }).results
  }
  return []
}

const normalizeResult = (
  item: RawBrandfetchResult,
  index: number,
): BrandfetchLogoResult | null => {
  const brand = item.brand as RawBrandfetchResult | undefined
  const company = item.company as RawBrandfetchResult | undefined
  const name =
    textValue(item.name) || textValue(brand?.name) || textValue(company?.name)
  const domain =
    textValue(item.domain) ||
    textValue(brand?.domain) ||
    textValue(company?.domain)
  const brandId = textValue(item.brandId) || textValue(item.id)
  const icon = textValue(item.icon) || textValue(item.image)
  const logo = textValue(item.logo) || icon
  if (!name && !domain && !logo) return null

  return {
    id: brandId || domain || `${name || 'brand'}-${index}`,
    name: name || domain || 'Unknown brand',
    domain: domain || null,
    brandId: brandId || null,
    icon: icon || logo || null,
    logo: logo || icon || null,
    verified: Boolean(item.verified),
  }
}

export const search = action({
  args: {
    query: v.string(),
    cursor: v.union(v.string(), v.null()),
    pageSize: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const query = normalizeQuery(args.query)
    if (query.length < 2) {
      return { results: [], continueCursor: null, isDone: true }
    }

    const start = normalizeCursor(args.cursor)
    const pageSize = Math.max(
      1,
      Math.min(MAX_PAGE_SIZE, Math.floor(args.pageSize ?? DEFAULT_PAGE_SIZE)),
    )
    const url = new URL(`${BRANDFETCH_API_URL}/${encodeURIComponent(query)}`)
    url.searchParams.set('limit', String(pageSize))
    if (start > 0) url.searchParams.set('offset', String(start))

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBrandfetchHeaders(),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const error =
        textValue((data as { error?: unknown } | null)?.error) ||
        textValue((data as { message?: unknown } | null)?.message) ||
        response.statusText ||
        'Brandfetch search failed.'
      throw new Error(error)
    }

    const normalized = rawResults(data)
      .map(normalizeResult)
      .filter((item): item is BrandfetchLogoResult => item !== null)

    const results = normalized
    const nextCursor = start + results.length
    return {
      results,
      continueCursor: results.length === pageSize ? String(nextCursor) : null,
      isDone: results.length < pageSize,
    }
  },
})
