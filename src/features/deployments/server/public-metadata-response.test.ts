import { describe, expect, it } from 'vitest'

import {
  createPublicMetadataResponse,
  getDeploymentSlugFromRequest,
} from './public-metadata-response'

const realReadyLakebedDeployment = {
  previewVersion: 1,
  provider: 'lakebed',
  sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  slug: 'a-craft-beer-brewery',
  status: 'ready',
  url: 'https://silver-river-766492ba9a.lakebed.app',
}

const realReadyLakebedPreview = {
  previewVersion: 1,
  sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  slug: 'a-craft-beer-brewery',
  status: 'preview_ready',
  html: '<!DOCTYPE html><html lang="en"><head><title>Craft Beer Brewery - Preview</title><meta name="description" content="Brewery" /><meta property="og:site_name" content="Craft Beer Brewery" /></head><body><main id="openui-root" data-openui-ready="source"><h1>Craft Beer Brewery</h1><p>Portland&apos;s Craft Brew Haven</p></main></body></html>',
}

const realOpenUiHandoffPreview = {
  previewVersion: 1,
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  slug: 'a-boutique-coffee-roastery',
  status: 'preview_ready',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title><meta name="description" content="Boutique Coffee Roastery" /></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
}

const realFailedLakebedDeployment = {
  provider: 'lakebed',
  sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
  slug: 'gov-site-in-hindi',
  status: 'failed',
  url: 'https://gov-site-in-hindi.ship-fast.io',
  errorMessage:
    'Build failed with 3 errors:\nlakebed-source:client/section-kit/SignInButton.tsx:3:9: ERROR: No matching export in "lakebed-source:client/lib/lakebed.ts" for import "useAuth"',
}

describe('public metadata responses', () => {
  it('serves app-level llms.txt on the base domain', async () => {
    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://ship-fast.io/llms.txt'),
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(body).toContain('# Ship Fast')
    expect(body).toContain('Public gallery: /gallery')
  })

  it('serves app-level sitemap.xml with public app pages', async () => {
    const response = await createPublicMetadataResponse(
      'sitemap',
      new Request('https://ship-fast.io/sitemap.xml'),
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/xml')
    expect(body).toContain('<loc>https://ship-fast.io/</loc>')
    expect(body).toContain('<loc>https://ship-fast.io/gallery</loc>')
  })

  it('infers deployment slugs from public subdomain hosts', () => {
    expect(
      getDeploymentSlugFromRequest(
        new Request('https://atlas-notes.ship-fast.io/robots.txt'),
      ),
    ).toBe('atlas-notes')
    expect(
      getDeploymentSlugFromRequest(
        new Request('https://ship-fast.io/robots.txt'),
      ),
    ).toBeUndefined()
    expect(
      getDeploymentSlugFromRequest(
        new Request('https://www.ship-fast.io/robots.txt'),
      ),
    ).toBeUndefined()
  })

  it('infers deployment slugs from forwarded hosts behind a proxy', () => {
    expect(
      getDeploymentSlugFromRequest(
        new Request('https://internal.vercel.app/robots.txt', {
          headers: {
            'x-forwarded-host':
              'a-craft-beer-brewery.ship-fast.io, internal.vercel.app',
          },
        }),
      ),
    ).toBe('a-craft-beer-brewery')
  })

  it('serves deployment llms.txt from the published preview', async () => {
    const calls: unknown[] = []
    const client = {
      query: async (_ref: unknown, args: any) => {
        calls.push(args)
        if ('slug' in args) {
          return {
            slug: 'atlas-notes',
            status: 'ready',
            url: 'https://atlas-notes.ship-fast.io',
          }
        }
        return {
          previewVersion: 4,
          html: '<html><head><title>Atlas Notes</title><meta name="description" content="Shared launch docs for operators."></head><body><h1>Atlas</h1></body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://atlas-notes.ship-fast.io/llms.txt'),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-ship-fast-deployment')).toBe('atlas-notes')
    expect(response.headers.get('x-ship-fast-preview-version')).toBe('4')
    expect(body).toContain('# Atlas Notes')
    expect(body).toContain('Shared launch docs for operators.')
    expect(body).toContain('Site URL: https://atlas-notes.ship-fast.io/')
    expect(calls).toEqual([{ slug: 'atlas-notes' }, { lookup: 'atlas-notes' }])
  })

  it('serves deployment sitemap.xml for explicit preview metadata routes', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) {
          return {
            slug: 'atlas-notes',
            status: 'ready',
            url: 'https://atlas-notes.ship-fast.io',
          }
        }
        return {
          previewVersion: 2,
          html: '<html><head><title>Atlas</title></head><body></body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'sitemap',
      new Request('https://ship-fast.io/preview/atlas-notes/sitemap.xml'),
      { slug: 'Atlas Notes', client },
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(body).toContain('<loc>https://atlas-notes.ship-fast.io/</loc>')
  })

  it('serves llms.txt for a real ready Lakebed deployment using its stored preview metadata', async () => {
    const calls: unknown[] = []
    const client = {
      query: async (_ref: unknown, args: any) => {
        calls.push(args)
        if ('slug' in args) return realReadyLakebedDeployment
        return realReadyLakebedPreview
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-ship-fast-deployment')).toBe(
      'a-craft-beer-brewery',
    )
    expect(response.headers.get('x-ship-fast-preview-version')).toBe('1')
    expect(body).toContain('# Craft Beer Brewery - Preview')
    expect(body).toContain('Brewery')
    expect(body).toContain(
      'Site URL: https://silver-river-766492ba9a.lakebed.app/',
    )
    expect(body.toLowerCase()).not.toContain('openui-error')
    expect(calls).toEqual([
      { slug: 'a-craft-beer-brewery' },
      { lookup: 'a-craft-beer-brewery' },
    ])
  })

  it('returns stable unavailable metadata when deployment lookup fails', async () => {
    const client = {
      query: async () => {
        throw new Error('Convex query failed')
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client },
    )

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Deployment metadata is unavailable')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not expose real failed Lakebed deployment metadata or build errors', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) return realFailedLakebedDeployment
        return {
          previewVersion: 1,
          html: '<html><head><title>Gov Site</title></head><body>Hindi government site</body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'robots',
      new Request('https://gov-site-in-hindi.ship-fast.io/robots.txt'),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBe(404)
    expect(body).toBe('Deployment metadata not found')
    expect(body).not.toContain('No matching export')
    expect(body).not.toContain('useAuth')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not publish metadata for a ready deployment whose preview HTML is empty', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          previewVersion: 1,
          sessionId: realReadyLakebedDeployment.sessionId,
          slug: realReadyLakebedDeployment.slug,
          status: 'preview_ready',
          html: '',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client },
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment metadata is not ready yet')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('returns stable not-ready metadata instead of crashing when a real ready deployment has malformed preview HTML shape', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          previewVersion: 1,
          sessionId: realReadyLakebedDeployment.sessionId,
          slug: realReadyLakebedDeployment.slug,
          status: 'preview_ready',
          html: {
            body: realReadyLakebedPreview.html,
            source: 'DB-observed preview row was not serialized as a string',
          },
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client: client },
    )
    const body = await response.text()

    expect(response.status).toBe(202)
    expect(body).toBe('Deployment metadata is not ready yet')
    expect(body).not.toContain('Craft Beer Brewery')
    expect(body).not.toContain('object is not iterable')
    expect(body).not.toContain('trim is not a function')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not publish metadata generated from OpenUI renderer-error HTML', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          previewVersion: 1,
          sessionId: realReadyLakebedDeployment.sessionId,
          slug: realReadyLakebedDeployment.slug,
          status: 'preview_ready',
          html: '<!doctype html><html><head><title>Broken</title></head><body><div class="openui-error">Failed to render: te is not a function</div></body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body.toLowerCase()).not.toContain('openui-error')
    expect(body.toLowerCase()).not.toContain('failed to render')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not publish metadata generated from DB-observed OpenUI handoff HTML', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) {
          return {
            ...realReadyLakebedDeployment,
            sessionId: realOpenUiHandoffPreview.sessionId,
            slug: realOpenUiHandoffPreview.slug,
            url: 'https://silver-river-1fa25d328e.lakebed.app',
          }
        }
        return realOpenUiHandoffPreview
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request(
        `https://${realOpenUiHandoffPreview.slug}.ship-fast.io/llms.txt`,
      ),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body).not.toContain('Generated OpenUI source is ready')
    expect(body).not.toContain('ship-fast-openui-source')
    expect(body).not.toContain('Boutique Coffee Roastery')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not publish metadata from a preview belonging to a different session than the ready deployment', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          ...realOpenUiHandoffPreview,
          html: '<!doctype html><html><head><title>Wrong Session</title><meta name="description" content="Coffee roastery"></head><body><h1>Boutique Coffee Roastery</h1></body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request(
        `https://${realReadyLakebedDeployment.slug}.ship-fast.io/llms.txt`,
      ),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body).not.toContain('Boutique Coffee Roastery')
    expect(body).not.toContain('Coffee roastery')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not publish metadata from a preview newer than the deployment version', async () => {
    const client = {
      query: async (_ref: unknown, args: any) => {
        if ('slug' in args) {
          return {
            ...realReadyLakebedDeployment,
            previewVersion: 1,
          }
        }
        return {
          previewVersion: 2,
          sessionId: realReadyLakebedDeployment.sessionId,
          slug: realReadyLakebedDeployment.slug,
          status: 'preview_ready',
          html: '<!doctype html><html><head><title>Unpublished</title><meta name="description" content="Unpublished edit"></head><body><h1>Unpublished edit</h1></body></html>',
        }
      },
    }

    const response = await createPublicMetadataResponse(
      'llms',
      new Request('https://a-craft-beer-brewery.ship-fast.io/llms.txt'),
      { client },
    )
    const body = await response.text()

    expect(response.status).toBe(202)
    expect(body).toBe('Deployment metadata is not ready yet')
    expect(body).not.toContain('Unpublished edit')
    expect(response.headers.get('x-ship-fast-preview-version')).toBeNull()
  })

  it('does not fall back to app metadata for unknown deployment subdomains', async () => {
    const client = { query: async () => null }

    const response = await createPublicMetadataResponse(
      'robots',
      new Request('https://missing.ship-fast.io/robots.txt'),
      { client },
    )

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Deployment metadata not found')
  })
})
