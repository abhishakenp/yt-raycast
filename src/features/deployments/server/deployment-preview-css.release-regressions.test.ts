import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  query: vi.fn(),
}))

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({ query: routeMocks.query }),
}))

import { createDeploymentPreviewResponse } from './deployment-preview-response'

const styledArtifactHtml =
  '<!doctype html><html><head><title>Release CSS Preview</title><style>.bg-red-500{background-color:#ef4444}.p-4{padding:1rem}.text-white{color:#fff}</style></head><body><main id="openui-root" class="bg-red-500 p-4 text-white"><h1>Styled release preview</h1></main></body></html>'

describe('deployment preview CSS release gate', () => {
  beforeEach(() => {
    routeMocks.query.mockReset()
    vi.restoreAllMocks()
  })

  it('serves the html export artifact which has Tailwind CSS baked in during build', async () => {
    routeMocks.query.mockResolvedValue({
      slug: 'release-css-preview',
      url: 'https://release-css-preview.example',
      status: 'ready',
      previewVersion: 1,
      sessionId: 'release-css-session',
      artifact: {
        status: 'ready',
        generatorRevision: 'html-export-v2',
        contentType: 'text/html; charset=utf-8',
        storageUrl: 'https://cdn.convex.cloud/release-css.html',
      },
    })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(styledArtifactHtml, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )

    const response = await createDeploymentPreviewResponse(
      'release-css-preview',
      new Request('https://ship-fast.test/preview/release-css-preview'),
    )
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('bg-red-500')
    expect(html).toContain('p-4')
    expect(html).toContain('text-white')
    expect(html).not.toContain('data-ship-fast-preview-tailwind-css')
    expect(html).not.toContain('/styles/preview-tailwind.css')
  })
})
