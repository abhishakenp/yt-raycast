import { searchStockImages, type StockImageResult } from '@/lib/stock-image'

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      ...init?.headers,
    },
  })
}

/**
 * Server-side proxy for stock image searches. Keeps Pexels/Unsplash API keys
 * server-side only — they are NEVER exposed to the client bundle.
 */
export async function createStockImageSearchResponse(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') ?? ''
  const w = url.searchParams.get('w')
  const h = url.searchParams.get('h')
  const page = url.searchParams.get('page')
  const perPage = url.searchParams.get('perPage')

  if (!query.trim()) {
    return json({ results: [] })
  }

  try {
    const results: StockImageResult[] = await searchStockImages({
      query,
      w: w ? Number(w) : undefined,
      h: h ? Number(h) : undefined,
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
    })
    return json({ results })
  } catch {
    return json({ results: [] }, { status: 502 })
  }
}
