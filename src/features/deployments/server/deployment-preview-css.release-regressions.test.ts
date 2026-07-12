import { JSDOM } from 'jsdom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  query: vi.fn(),
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({ query: routeMocks.query }),
}))

import { createDeploymentPreviewResponse } from './deployment-preview-response'

describe('deployment preview CSS release gate', () => {
  beforeEach(() => {
    routeMocks.query.mockReset()
  })

  it('serves precompiled utility CSS with a class-rich public preview', async () => {
    async function deploymentQuery(
      _reference: unknown,
      args: Record<string, unknown>,
    ) {
      return 'slug' in args
        ? {
            previewVersion: 1,
            sessionId: 'release-css-session',
            slug: 'release-css-preview',
            status: 'ready',
            url: 'https://release-css-preview.example',
          }
        : {
            previewVersion: 1,
            sessionId: 'release-css-session',
            slug: 'release-css-preview',
            status: 'preview_ready',
            html: '<!doctype html><html><head><title>Release CSS Preview</title></head><body><main id="openui-root" class="bg-red-500 p-4 text-white"><h1>Styled release preview</h1></main></body></html>',
          }
    }
    routeMocks.query.mockImplementation(deploymentQuery)

    const response = await createDeploymentPreviewResponse(
      'release-css-preview',
      new Request('https://ship-fast.test/preview/release-css-preview'),
    )
    const html = await response.text()
    const dom = new JSDOM(html)

    try {
      const styleText = [...dom.window.document.querySelectorAll('style')]
        .map((style) => style.textContent ?? '')
        .join('\n')

      expect(response.status).toBe(200)
      expect(styleText.length).toBeGreaterThan(1_000)
      expect(styleText).toMatch(/\.bg-red-500\b/)
      expect(styleText).toMatch(/\.p-4\b/)
      expect(styleText).toMatch(/\.text-white\b/)
    } finally {
      dom.window.close()
    }
  })
})
