import { describe, expect, it } from 'vitest'

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

const parseAnonymousDeployBody = (body: string): AnonymousDeployBody =>
  JSON.parse(body) as AnonymousDeployBody

const decodeClientBundle = (body: string): string => {
  const parsed = parseAnonymousDeployBody(body)
  expect(typeof parsed.clientBundle).toBe('string')
  return Buffer.from(String(parsed.clientBundle), 'base64').toString('utf8')
}

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
    const project = await buildStaticLakebedProjectFiles({
      source:
        '<!doctype html><html><head><title>Images</title></head><body><img alt="Max the dog" src="/api/pexels?query=max-the-dog&w=800&h=600"></body></html>',
    })
    const deployRequest = await buildLakebedAnonymousDeployRequest(
      project.files,
    )
    const clientBundle = decodeClientBundle(deployRequest.requestBody)

    expect(clientBundle).toContain(
      'https://picsum.photos/seed/max-the-dog/800/600',
    )
    expect(clientBundle).not.toContain('/api/pexels')
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
