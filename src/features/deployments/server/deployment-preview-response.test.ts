import { describe, expect, it } from 'vitest'

import { createDeploymentPreviewResponse } from './deployment-preview-response'

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
})
