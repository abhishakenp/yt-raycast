import { describe, expect, it } from 'vitest'

import { createDeploymentPreviewResponse } from './deployment-preview-response'

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
  html: '<!DOCTYPE html><html lang="en"><head><title>Craft Beer Brewery - Preview</title><meta name="description" content="Brewery" /></head><body><main id="openui-root" data-openui-ready="source"><h1>Craft Beer Brewery</h1><p>Portland&apos;s Craft Brew Haven</p></main></body></html>',
}

const realOpenUiHandoffPreview = {
  previewVersion: 1,
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  slug: 'a-boutique-coffee-roastery',
  status: 'preview_ready',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
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

const realFailedDeploymentPreview = {
  previewVersion: 1,
  sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
  slug: 'gov-site-in-hindi',
  status: 'preview_ready',
  html: '<!doctype html><html lang="hi"><head><title>Gov Hindi</title></head><body><main id="openui-root" data-openui-ready="source"><h1>Gov Hindi</h1><p>gov site in hindi</p></main></body></html>',
}

describe('createDeploymentPreviewResponse', () => {
  it('serves deployed preview HTML with canonical deployment metadata', async () => {
    const calls: unknown[] = []
    const client = {
      query: async (_ref: any, args: any) => {
        calls.push(args)
        if ('slug' in args) {
          return {
            slug: 'atlas-notes',
            url: 'https://atlas-notes.ship-fast.io',
            status: 'ready',
            previewVersion: 3,
          }
        }
        return {
          sessionId: 'session_123',
          slug: 'atlas-notes',
          status: 'preview_ready',
          previewVersion: 3,
          html: '<html><head><title>Atlas</title></head><body><h1>Atlas</h1></body></html>',
        }
      },
    }

    const response = await createDeploymentPreviewResponse(
      'Atlas Notes',
      new Request('https://ship-fast.test/preview/atlas-notes?utm=1'),
      client,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(response.headers.get('x-ship-fast-deployment')).toBe('atlas-notes')
    expect(response.headers.get('x-ship-fast-preview-version')).toBe('3')
    expect(html).toContain(
      '<link rel="canonical" href="https://atlas-notes.ship-fast.io/" />',
    )
    expect(html).not.toContain('data-ship-fast-export-badge="1"')
    expect(calls).toEqual([{ slug: 'atlas-notes' }, { lookup: 'atlas-notes' }])
  })

  it('returns 404 for missing deployments', async () => {
    const client = {
      query: async (_ref: any, _args: any) => null,
    }

    const response = await createDeploymentPreviewResponse(
      'missing',
      undefined,
      client,
    )

    expect(response.status).toBe(404)
  })

  it('returns a stable unavailable response when deployment lookup fails', async () => {
    const client = {
      query: async () => {
        throw new Error('Convex query failed')
      },
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery'),
      client as any,
    )

    expect(response.status).toBe(503)
    expect(await response.text()).toBe('Deployment preview is unavailable')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('serves a real ready Lakebed deployment preview with canonical metadata', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return realReadyLakebedPreview
      },
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery?utm=1'),
      client,
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-ship-fast-deployment')).toBe(
      'a-craft-beer-brewery',
    )
    expect(response.headers.get('x-ship-fast-preview-version')).toBe('1')
    expect(html).toContain('Craft Beer Brewery - Preview')
    expect(html).toContain(
      '<link rel="canonical" href="https://silver-river-766492ba9a.lakebed.app/" />',
    )
    expect(html).not.toContain('data-ship-fast-export-badge="1"')
  })

  it('does not serve preview HTML for a real failed Lakebed deployment even when the session preview exists', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
        if ('slug' in args) return realFailedLakebedDeployment
        return realFailedDeploymentPreview
      },
    }

    const response = await createDeploymentPreviewResponse(
      'gov-site-in-hindi',
      new Request('https://ship-fast.io/preview/gov-site-in-hindi'),
      client,
    )
    const body = await response.text()

    expect(response.status).toBe(404)
    expect(body).toBe('Deployment not found')
    expect(body).not.toContain('Gov Hindi')
    expect(body).not.toContain('useAuth')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('returns a stable not-ready response instead of crashing when a real ready deployment has malformed preview HTML shape', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
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

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery'),
      client as any,
    )
    const body = await response.text()

    expect(response.status).toBe(202)
    expect(body).toBe('Deployment preview is not ready yet')
    expect(body).not.toContain('Craft Beer Brewery')
    expect(body).not.toContain('object is not iterable')
    expect(body).not.toContain('trim is not a function')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not serve a ready deployment when its public preview HTML is empty', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
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

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery'),
      client,
    )

    expect(response.status).toBe(202)
    expect(await response.text()).toBe('Deployment preview is not ready yet')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not serve OpenUI renderer-error HTML for a ready deployment', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          previewVersion: 1,
          sessionId: realReadyLakebedDeployment.sessionId,
          slug: realReadyLakebedDeployment.slug,
          status: 'preview_ready',
          html: '<!doctype html><html><body><div class="openui-error">Failed to render: te is not a function</div></body></html>',
        }
      },
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery'),
      client,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body.toLowerCase()).not.toContain('openui-error')
    expect(body.toLowerCase()).not.toContain('failed to render')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not serve DB-observed OpenUI handoff HTML for a ready deployment', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
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

    const response = await createDeploymentPreviewResponse(
      realOpenUiHandoffPreview.slug,
      new Request(
        `https://ship-fast.io/preview/${realOpenUiHandoffPreview.slug}`,
      ),
      client,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body).not.toContain('Generated OpenUI source is ready')
    expect(body).not.toContain('ship-fast-openui-source')
    expect(body).not.toContain('Boutique Coffee Roastery')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not serve preview HTML from a different session than the ready deployment', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
        if ('slug' in args) return realReadyLakebedDeployment
        return {
          ...realOpenUiHandoffPreview,
          html: '<!doctype html><html><head><title>Wrong Session</title></head><body><h1>Boutique Coffee Roastery</h1></body></html>',
        }
      },
    }

    const response = await createDeploymentPreviewResponse(
      realReadyLakebedDeployment.slug,
      new Request(
        `https://ship-fast.io/preview/${realReadyLakebedDeployment.slug}`,
      ),
      client,
    )
    const body = await response.text()

    expect(response.status).toBeGreaterThanOrEqual(400)
    expect(body).not.toContain('Boutique Coffee Roastery')
    expect(body).not.toContain('Wrong Session')
    expect(response.headers.get('x-ship-fast-deployment')).toBeNull()
  })

  it('does not serve a preview version newer than the published deployment version', async () => {
    const client = {
      query: async (_ref: any, args: any) => {
        if ('slug' in args) {
          return {
            ...realReadyLakebedDeployment,
            previewVersion: 1,
          }
        }
        return {
          ...realReadyLakebedPreview,
          previewVersion: 2,
          html: '<!doctype html><html><head><title>Unpublished</title></head><body><h1>Unpublished edit</h1></body></html>',
        }
      },
    }

    const response = await createDeploymentPreviewResponse(
      'a-craft-beer-brewery',
      new Request('https://ship-fast.io/preview/a-craft-beer-brewery'),
      client,
    )
    const body = await response.text()

    expect(response.status).toBe(202)
    expect(body).toBe('Deployment preview is not ready yet')
    expect(body).not.toContain('Unpublished edit')
    expect(response.headers.get('x-ship-fast-preview-version')).toBeNull()
  })
})
