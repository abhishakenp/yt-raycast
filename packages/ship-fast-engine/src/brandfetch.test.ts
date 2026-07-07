import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  materializeBrandfetchLogoToWorkspace,
  resolveBrandfetchBrandProfile,
} from './brandfetch.js'

const workspaces: string[] = []
const originalFetch = globalThis.fetch
const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])

const makeWorkspace = () => {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-brandfetch-'))
  workspaces.push(workspace)
  return workspace
}

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
  for (const workspace of workspaces.splice(0)) {
    rmSync(workspace, { recursive: true, force: true })
  }
})

describe('Brandfetch profile resolution', () => {
  it('combines the best search match with the largest brand logo and palette', async () => {
    const calls: string[] = []
    globalThis.fetch = vi
      .fn()
      .mockImplementationOnce(async (url) => {
        calls.push(String(url))
        return Response.json(
          {
            results: [
              {
                name: 'Linear',
                domain: 'linear.app',
                brandId: 'brand_linear',
                verified: true,
              },
            ],
          },
          { status: 200 },
        )
      })
      .mockImplementationOnce(async (url) => {
        calls.push(String(url))
        return Response.json(
          {
            logos: [
              {
                formats: [
                  {
                    src: 'https://cdn.brandfetch.io/linear/logo-small.png',
                    format: 'png',
                    width: 64,
                    height: 64,
                  },
                  {
                    src: 'https://cdn.brandfetch.io/linear/logo.svg',
                    format: 'svg',
                    width: 24,
                    height: 24,
                  },
                ],
              },
            ],
            colors: [
              { type: 'primary', hex: '#5E6AD2' },
              { type: 'secondary', hex: '#111827' },
              { type: 'accent', hex: '#A5B4FC' },
            ],
          },
          { status: 200 },
        )
      })

    await expect(
      resolveBrandfetchBrandProfile({ query: 'Linear', timeoutMs: 1000 }),
    ).resolves.toMatchObject({
      ok: true,
      match: {
        name: 'Linear',
        domain: 'linear.app',
        officialUrl: 'https://linear.app',
      },
      logo: {
        kind: 'remote',
        src: 'https://cdn.brandfetch.io/linear/logo.svg',
        type: 'svg',
        provider: 'brandfetch',
      },
      palette: {
        primary: '#5E6AD2',
        secondary: '#111827',
        accent: '#A5B4FC',
        provider: 'brandfetch',
      },
      confidence: 1,
    })
    expect(calls[0]).toContain('/v2/search/Linear')
    expect(calls[0]).toContain('limit=1')
    expect(calls[1]).toBe(
      'https://api.brandfetch.io/v2/brands/domain/linear.app',
    )
  })

  it('falls back to search icon metadata when the brand endpoint fails', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          {
            results: [
              {
                name: 'Acme',
                domain: 'acme.test',
                icon: 'https://cdn.brandfetch.io/acme/icon.webp',
                qualityScore: 0.7,
              },
            ],
          },
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({ message: 'rate limited' }, { status: 429 }),
      )

    await expect(
      resolveBrandfetchBrandProfile({ query: 'Acme', timeoutMs: 1000 }),
    ).resolves.toMatchObject({
      ok: true,
      logo: {
        kind: 'remote',
        src: 'https://cdn.brandfetch.io/acme/icon.webp',
        provider: 'brandfetch-search',
      },
      providerWarning: {
        status: 429,
        error: 'rate limited',
      },
    })
  })
})

describe('Brandfetch logo materialization', () => {
  it('uses SVG data URIs directly without fetching', async () => {
    const fetchMock = vi.fn()
    globalThis.fetch = fetchMock
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><title>X</title></svg>'

    await expect(
      materializeBrandfetchLogoToWorkspace(
        makeWorkspace(),
        {
          kind: 'remote',
          src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
          alt: 'Acme logo',
          provider: 'brandfetch',
          confidence: 0.92,
        },
        { timeoutMs: 1000 },
      ),
    ).resolves.toEqual({
      kind: 'svg',
      svg,
      alt: 'Acme',
      provider: 'brandfetch',
      confidence: 0.92,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('downloads raster logos into the generated workspace', async () => {
    const workspace = makeWorkspace()
    globalThis.fetch = vi.fn(async () => {
      return new Response(pngBytes, {
        status: 200,
        headers: { 'content-type': 'image/png' },
      })
    })

    await expect(
      materializeBrandfetchLogoToWorkspace(
        workspace,
        {
          kind: 'remote',
          src: 'https://cdn.brandfetch.io/acme/logo.png',
          alt: 'Acme logo',
          provider: 'brandfetch',
          confidence: 0.8,
        },
        { timeoutMs: 1000 },
      ),
    ).resolves.toMatchObject({
      kind: 'remote',
      src: './brand-logo.png',
      alt: 'Acme',
      provider: 'brandfetch',
      confidence: 0.8,
    })
    expect(existsSync(join(workspace, 'brand-logo.png'))).toBe(true)
    expect(readFileSync(join(workspace, 'brand-logo.png'))).toEqual(
      Buffer.from(pngBytes),
    )
  })

  it('returns a safe inline fallback SVG when the remote download fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response('not found', { status: 404 })
    })

    const result = await materializeBrandfetchLogoToWorkspace(
      makeWorkspace(),
      {
        kind: 'remote',
        src: 'https://cdn.brandfetch.io/acme/missing.svg',
        alt: 'Acme <script> logo',
        provider: 'brandfetch',
        confidence: 0.9,
      },
      { timeoutMs: 1000 },
    )

    expect(result).toMatchObject({
      kind: 'svg',
      alt: 'Acme <script>',
      provider: 'brandfetch-fallback',
      confidence: 0.55,
    })
    expect(result.svg).toContain('Acme &lt;script&gt;')
    expect(result.svg).not.toContain('Acme <script>')
  })
})
