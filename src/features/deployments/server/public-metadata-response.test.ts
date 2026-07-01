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
