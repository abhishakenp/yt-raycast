import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildLakebedAnonymousDeployRequest,
  deployLakebedProjectFiles,
} from './lakebed-deploy-service'
import { buildStaticLakebedProjectFiles } from './lakebed-static-project-builder'

type AnonymousDeployBody = {
  artifact?: {
    deployTarget?: unknown
  }
  clientBundle?: unknown
}

function parseAnonymousDeployBody(body: string): AnonymousDeployBody {
  return JSON.parse(body) as AnonymousDeployBody
}

function decodeClientBundle(body: string): string {
  const parsed = parseAnonymousDeployBody(body)
  expect(typeof parsed.clientBundle).toBe('string')
  return Buffer.from(String(parsed.clientBundle), 'base64').toString('utf8')
}

function expectNoStockProviderCredentialsOrProxy(artifact: string) {
  expect(artifact).not.toContain('PEXELS_API_KEY')
  expect(artifact).not.toContain('VITE_PEXELS_API_KEY')
  expect(artifact).not.toContain('api.pexels.com')
  expect(artifact).not.toContain('/api/pexels')
  expect(artifact).not.toContain('ship-fast.io/api/pexels')
}

const originalPexelsKey = process.env.PEXELS_API_KEY
const originalVitePexelsKey = process.env.VITE_PEXELS_API_KEY
const originalUnsplashKey = process.env.UNSPLASH_ACCESS_KEY
const originalViteUnsplashKey = process.env.VITE_UNSPLASH_ACCESS_KEY

beforeEach(() => {
  delete process.env.PEXELS_API_KEY
  delete process.env.VITE_PEXELS_API_KEY
  delete process.env.UNSPLASH_ACCESS_KEY
  delete process.env.VITE_UNSPLASH_ACCESS_KEY
})

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalPexelsKey === undefined) {
    delete process.env.PEXELS_API_KEY
  } else {
    process.env.PEXELS_API_KEY = originalPexelsKey
  }
  if (originalVitePexelsKey === undefined) {
    delete process.env.VITE_PEXELS_API_KEY
  } else {
    process.env.VITE_PEXELS_API_KEY = originalVitePexelsKey
  }
  if (originalUnsplashKey === undefined) {
    delete process.env.UNSPLASH_ACCESS_KEY
  } else {
    process.env.UNSPLASH_ACCESS_KEY = originalUnsplashKey
  }
  if (originalViteUnsplashKey === undefined) {
    delete process.env.VITE_UNSPLASH_ACCESS_KEY
  } else {
    process.env.VITE_UNSPLASH_ACCESS_KEY = originalViteUnsplashKey
  }
})

describe('buildStaticLakebedProjectFiles', () => {
  const realBreweryDeployment = {
    previewVersion: 1,
    provider: 'lakebed',
    sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    slug: 'a-craft-beer-brewery',
    status: 'ready',
    url: 'https://silver-river-766492ba9a.lakebed.app',
  } as const

  const realBreweryPreviewHtml =
    '<!doctype html><html lang="lt"><head><title>Craft Beer Brewery - Preview</title><script src="/scripts/tailwind-browser.js"></script></head><body><main id="openui-root" data-openui-ready="source"><h1>Portland&apos;s Craft Brew Haven</h1><img alt="Pineapple Saison" src="/api/pexels?query=pineapple-saison&w=1200&h=800"><script type="application/json" id="ship-fast-openui-source">"home_hero = RestaurantHero(\\"Craft Beer Brewery\\")"</script></main></body></html>'

  it('builds a DB-observed brewery preview into a deployable static Lakebed payload', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source: realBreweryPreviewHtml,
      siteSpecJson: JSON.stringify({
        projectName: 'Craft Beer Brewery',
        sessionId: realBreweryDeployment.sessionId,
        theme: 'darkmatter',
      }),
    })
    const deployRequest = await buildLakebedAnonymousDeployRequest(
      project.files,
    )

    expect(project.projectName).toBe('Craft Beer Brewery')
    expect(project.fileCount).toBe(Object.keys(project.files).length)
    expect(deployRequest.artifact.deployTarget).toBe('anonymous-source')
    expect(deployRequest.artifact.server.schema).toEqual({})
    expect(deployRequest.sourceFileCount).toBeGreaterThanOrEqual(7)
    expect(deployRequest.clientBundleBytes).toBeGreaterThan(0)
    expect(deployRequest.serverBundleBytes).toBeGreaterThan(0)
    const clientBundle = decodeClientBundle(deployRequest.requestBody)
    expect(clientBundle).toContain('Portland&apos;s Craft Brew Haven')
    expect(clientBundle).toContain(
      'https://picsum.photos/seed/pineapple-saison/1200/800',
    )
    expect(clientBundle).not.toContain('/api/pexels')
    expect(clientBundle).not.toContain('ship-fast-openui-source')
    expect(clientBundle).not.toContain('RestaurantHero(')
  })

  it('posts the generated static project as an anonymous Lakebed app payload', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source: realBreweryPreviewHtml,
      siteSpecJson: JSON.stringify({
        projectName: 'Craft Beer Brewery',
        sessionId: realBreweryDeployment.sessionId,
      }),
    })
    const requests: Array<{ body: string; url: string }> = []
    const result = await deployLakebedProjectFiles({
      api: 'https://lakebed.test',
      files: project.files,
      fetchImpl: (async (url, init) => {
        requests.push({ body: String(init?.body ?? ''), url: String(url) })
        return Response.json({
          deployId: 'dep_oNs9Kux_Dvn7JGNM',
          url: realBreweryDeployment.url,
          updatedAt: '2026-07-02T00:00:00.000Z',
        })
      }) as typeof fetch,
    })
    const posted = parseAnonymousDeployBody(requests[0]?.body ?? '{}')
    const clientBundle = decodeClientBundle(requests[0]?.body ?? '{}')

    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('https://lakebed.test/v1/anonymous-deploys')
    expect(posted.artifact?.deployTarget).toBe('anonymous-source')
    expect(clientBundle).toContain('Craft Beer Brewery - Preview')
    expect(clientBundle).not.toContain('/scripts/tailwind-browser.js')
    expect(clientBundle).not.toContain('/api/pexels')
    expect(result).toMatchObject({
      deployId: 'dep_oNs9Kux_Dvn7JGNM',
      url: realBreweryDeployment.url,
      sourceFileCount: project.fileCount,
    })
  })

  it('rewrites generated preview image API URLs in the deployable payload', async () => {
    process.env.PEXELS_API_KEY = 'pexels-key'
    const resolvedPexelsUrl =
      'https://images.pexels.com/photos/7195588/pexels-photo-7195588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const fetchMock = vi.fn(async () =>
      Response.json({
        photos: [
          {
            src: {
              medium: `${resolvedPexelsUrl}&size=medium`,
              large: resolvedPexelsUrl,
              large2x: `${resolvedPexelsUrl}&size=large2x`,
              original: `${resolvedPexelsUrl}&size=original`,
            },
          },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Images</title><style>.hero{background-image:url("/api/pexels?query=glass+polished+showcase+installations&w=800&h=600&seed=Showcase+of+polished+glass+installations")}</style></head><body><img alt="Showcase of polished glass installations" src="/api/pexels?query=glass+polished+showcase+installations&w=800&h=600&seed=Showcase+of+polished+glass+installations"></body></html>',
    })
    const deployRequest = await buildLakebedAnonymousDeployRequest(
      project.files,
    )
    const clientBundle = decodeClientBundle(deployRequest.requestBody)

    const calls = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit | undefined]
    >
    expect(String(calls[0]?.[0])).toBe(
      'https://api.pexels.com/v1/search?query=glass+polished+showcase+installations&per_page=15&orientation=landscape',
    )
    expect(calls[0]?.[1]).toEqual({
      headers: { Authorization: 'pexels-key' },
    })
    expect(clientBundle).toContain(resolvedPexelsUrl)
    expectNoStockProviderCredentialsOrProxy(clientBundle)
    expect(clientBundle).not.toContain('picsum.photos')
  })

  it('replaces ShipFast-local Tailwind runtime in the deployable payload', async () => {
    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Styled</title><script src="/scripts/tailwind-browser.js"></script></head><body class="bg-background text-foreground"><div class="border-border bg-card text-card-foreground">Styled</div></body></html>',
    })
    const deployRequest = await buildLakebedAnonymousDeployRequest(
      project.files,
    )
    const clientBundle = decodeClientBundle(deployRequest.requestBody)

    expect(clientBundle).toContain('https://cdn.tailwindcss.com')
    expect(clientBundle).toContain('bg-background')
    expect(clientBundle).not.toContain('/scripts/tailwind-browser.js')
    expect(clientBundle).not.toContain('tailwind.config')
  })
})
