import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { search } from './brandfetch'

type BrandfetchSearchHandler = (
  ctx: unknown,
  args: {
    query: string
    cursor: string | null
    pageSize?: number
  },
) => Promise<{
  results: Array<{
    id: string
    name: string
    domain: string | null
    brandId: string | null
    icon: string | null
    logo: string | null
    verified: boolean
  }>
  continueCursor: string | null
  isDone: boolean
}>

const runSearch = (args: Parameters<BrandfetchSearchHandler>[1]) =>
  (
    search as unknown as {
      _handler: BrandfetchSearchHandler
    }
  )._handler({}, args)

const originalFetch = globalThis.fetch
const originalApiKey = process.env.BRANDFETCH_API_KEY

describe('Brandfetch Convex action', () => {
  beforeEach(() => {
    process.env.BRANDFETCH_API_KEY = 'brandfetch-test-key'
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalApiKey === undefined) {
      delete process.env.BRANDFETCH_API_KEY
    } else {
      process.env.BRANDFETCH_API_KEY = originalApiKey
    }
    vi.restoreAllMocks()
  })

  it('fails before network access when the server-side API key is missing', async () => {
    delete process.env.BRANDFETCH_API_KEY

    await expect(runSearch({ query: 'Linear', cursor: null })).rejects.toThrow(
      'BRANDFETCH_API_KEY is not configured.',
    )
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('sends Brandfetch credentials from Convex env and normalizes page results', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 'linear-id',
              name: 'Linear',
              domain: 'linear.app',
              icon: 'https://cdn.brandfetch.io/linear/icon.webp',
              logo: 'https://cdn.brandfetch.io/linear/logo.svg',
              verified: true,
            },
          ],
        }),
        { status: 200 },
      ),
    )

    await expect(
      runSearch({
        query: 'https://linear.app/pricing',
        cursor: '5',
        pageSize: 3,
      }),
    ).resolves.toEqual({
      results: [
        {
          id: 'linear-id',
          name: 'Linear',
          domain: 'linear.app',
          brandId: 'linear-id',
          icon: 'https://cdn.brandfetch.io/linear/icon.webp',
          logo: 'https://cdn.brandfetch.io/linear/logo.svg',
          verified: true,
        },
      ],
      continueCursor: null,
      isDone: true,
    })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0]
    expect(String(url)).toBe(
      'https://api.brandfetch.io/v2/search/linear.app?limit=3&offset=5',
    )
    expect(init).toMatchObject({
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer brandfetch-test-key',
        'X-API-Key': 'brandfetch-test-key',
      },
    })
  })

  it('returns a continuation cursor when Brandfetch fills the requested page', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          { name: 'First', domain: 'first.test' },
          { name: 'Second', domain: 'second.test' },
        ]),
        { status: 200 },
      ),
    )

    await expect(
      runSearch({ query: 'brands', cursor: null, pageSize: 2 }),
    ).resolves.toMatchObject({
      continueCursor: '2',
      isDone: false,
      results: [
        {
          id: 'first.test',
          name: 'First',
          domain: 'first.test',
        },
        {
          id: 'second.test',
          name: 'Second',
          domain: 'second.test',
        },
      ],
    })
  })
})
