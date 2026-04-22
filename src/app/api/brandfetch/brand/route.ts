import { NextResponse } from 'next/server'

const DEFAULT_TIMEOUT_MS = 6500

const getHeaders = () => {
  const key = String(process.env.BRANDFETCH_API_KEY || '').trim()
  const headers: HeadersInit = { Accept: 'application/json' }
  if (!key) return headers
  return { ...headers, Authorization: `Bearer ${key}`, 'X-API-Key': key }
}

const safeJson = async (res: Response) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawDomain = String(url.searchParams.get('domain') || '').trim()
  if (!rawDomain) return NextResponse.json({ ok: false, error: 'Missing domain.' }, { status: 400 })

  const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(
      `https://api.brandfetch.io/v2/brands/domain/${encodeURIComponent(domain)}`,
      {
        method: 'GET',
        headers: getHeaders(),
        signal: controller.signal,
      },
    )
    const data = await safeJson(res)
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: String(
            data?.error || data?.message || res.statusText || 'Brandfetch request failed',
          ),
        },
        { status: 502 },
      )
    }
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Brandfetch request failed'
    return NextResponse.json(
      { ok: false, error: message || 'Brandfetch request failed' },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
