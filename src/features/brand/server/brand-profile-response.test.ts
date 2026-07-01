import { describe, expect, it } from 'vitest'

import { createBrandProfileResponse } from './brand-profile-response'

describe('createBrandProfileResponse', () => {
  it('requires a query', async () => {
    const response = await createBrandProfileResponse(
      new Request('https://ship-fast.test/api/brand-profile'),
      async () => ({ ok: true }),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Brand query is required.',
    })
  })

  it('returns a normalized Brandfetch profile payload', async () => {
    const seen: unknown[] = []
    const response = await createBrandProfileResponse(
      new Request(
        'https://ship-fast.test/api/brand-profile?domain=https://linear.app/customers',
      ),
      async (input) => {
        seen.push(input)
        return {
          ok: true,
          match: {
            name: 'Linear',
            domain: 'linear.app',
            officialUrl: 'https://linear.app',
          },
          logo: {
            kind: 'remote',
            src: 'https://cdn.brandfetch.io/linear/logo.svg',
            provider: 'brandfetch',
            alt: 'Linear',
          },
          palette: {
            primary: '#5e6ad2',
            provider: 'brandfetch',
          },
          confidence: 0.95,
        }
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      query: 'linear.app',
      match: {
        name: 'Linear',
        domain: 'linear.app',
      },
      logo: {
        provider: 'brandfetch',
      },
      palette: {
        primary: '#5e6ad2',
      },
      confidence: 0.95,
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('max-age=600')
    expect(seen).toEqual([{ query: 'linear.app', timeoutMs: 5500 }])
  })

  it('passes through Brandfetch search fallback warnings', async () => {
    const response = await createBrandProfileResponse(
      new Request(
        'https://ship-fast.test/api/brand-profile?domain=https://linear.app/customers',
      ),
      async () => ({
        ok: true,
        match: {
          name: 'Linear',
          domain: 'linear.app',
          source: 'brandfetch-search',
        },
        logo: {
          kind: 'remote',
          src: 'https://cdn.brandfetch.io/linear/icon.webp',
          provider: 'brandfetch-search',
          alt: 'Linear',
        },
        palette: null,
        confidence: 0.75,
        providerWarning: {
          status: 403,
          error: 'User is not authorized to access this resource.',
        },
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      query: 'linear.app',
      match: {
        source: 'brandfetch-search',
      },
      logo: {
        provider: 'brandfetch-search',
      },
      providerWarning: {
        status: 403,
      },
    })
  })

  it('keeps a DB-observed Brandfetch search logo while hiding raw provider denial details', async () => {
    const response = await createBrandProfileResponse(
      new Request(
        'https://ship-fast.test/api/brand-profile?query=The%20Beer%20Store',
      ),
      async () => ({
        ok: true,
        match: {
          brandId: 'idwTkaYgXe',
          domain: 'thebeerstore.ca',
          name: 'The Beer Store',
          source: 'brandfetch-search',
        },
        logo: {
          alt: 'The Beer Store',
          kind: 'remote',
          provider: 'brandfetch-search',
          src: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
        },
        palette: null,
        confidence: 0.75,
        providerWarning: {
          status: 403,
          error:
            'User is not authorized to access this resource with an explicit deny in an identity-based policy for k574ms14ma9f94keq30r7dq24x89n1k2',
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      ok: true,
      query: 'The Beer Store',
      match: {
        brandId: 'idwTkaYgXe',
        domain: 'thebeerstore.ca',
        name: 'The Beer Store',
      },
      logo: {
        alt: 'The Beer Store',
        provider: 'brandfetch-search',
        src: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
      },
      providerWarning: {
        status: 403,
      },
    })
    expect(JSON.stringify(body)).not.toContain(
      'explicit deny in an identity-based policy',
    )
    expect(JSON.stringify(body)).not.toContain(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
  })

  it('uses Brandfetch search data when the richer domain endpoint is denied', async () => {
    const originalFetch = globalThis.fetch
    const fetchCalls: string[] = []

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      fetchCalls.push(url)
      if (url.includes('/v2/search/')) {
        return new Response(
          JSON.stringify([
            {
              name: 'Linear',
              domain: 'linear.app',
              icon: 'https://cdn.brandfetch.io/iduDa181eM/w/128/h/128/fallback/lettermark/icon.webp',
              brandId: 'iduDa181eM',
              verified: true,
              qualityScore: 0.91,
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }

      return new Response(
        JSON.stringify({
          message:
            'User is not authorized to access this resource with an explicit deny in an identity-based policy',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }) as typeof fetch

    try {
      const { resolveBrandfetchBrandProfile } =
        await import('@ship-fast/engine/brandfetch.js')
      const resolveProfile = resolveBrandfetchBrandProfile as (input: {
        query: string
        timeoutMs?: number
      }) => Promise<unknown>
      const result = await resolveProfile({
        query: 'linear.app',
        timeoutMs: 1000,
      })

      expect(result).toMatchObject({
        ok: true,
        match: {
          name: 'Linear',
          domain: 'linear.app',
          source: 'brandfetch-search',
        },
        logo: {
          provider: 'brandfetch-search',
        },
        providerWarning: {
          status: 403,
        },
      })
      expect(
        fetchCalls.some((url) => url.includes('/v2/search/linear.app')),
      ).toBe(true)
      expect(
        fetchCalls.some((url) => url.includes('/v2/brands/domain/linear.app')),
      ).toBe(true)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('maps provider lookup failures to actionable JSON errors', async () => {
    const response = await createBrandProfileResponse(
      new Request('https://ship-fast.test/api/brand-profile?query=unknown'),
      async () => ({
        ok: false,
        status: 404,
        error: 'No Brandfetch match found',
      }),
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'No Brandfetch match found',
      status: 404,
    })
  })

  it('returns a stable public error when the brand resolver rejects', async () => {
    const response = await createBrandProfileResponse(
      new Request(
        'https://ship-fast.test/api/brand-profile?query=Craft%20Beer%20Brewery',
      ),
      async () => {
        throw new Error(
          'Brandfetch unavailable for k574ms14ma9f94keq30r7dq24x89n1k2 Craft Beer Brewery',
        )
      },
    )
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body).toEqual({
      ok: false,
      error: 'Brand profile lookup failed.',
    })
    expect(JSON.stringify(body)).not.toContain(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
    expect(JSON.stringify(body)).not.toContain('Craft Beer Brewery')
  })
})
