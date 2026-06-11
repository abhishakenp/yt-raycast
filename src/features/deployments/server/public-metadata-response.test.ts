import { describe, expect, it } from 'vitest'

import {
  createPublicMetadataResponse,
  getDeploymentSlugFromRequest,
} from './public-metadata-response'

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
