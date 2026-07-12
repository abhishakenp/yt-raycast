import { describe, expect, it } from 'vitest'

import {
  createHtmlExportFiles,
  createNextExportFiles,
  createReactExportFiles,
} from './html-export-files'

const previewHtml = `<!doctype html>
<html>
  <head><title>Offline release export</title></head>
  <body>
    <main style="background-image:url('/api/pexels?query=release+hero&w=1600&h=900')">
      <img
        alt="Release hero"
        src="/api/pexels?query=release+hero&w=1600&h=900"
        srcset="/api/pexels?query=release+hero&w=800&h=450 800w, /api/pexels?query=release+hero&w=1600&h=900 1600w"
      />
    </main>
  </body>
</html>`

describe('offline export asset release regressions', () => {
  it.each([
    [
      'HTML index',
      () =>
        createHtmlExportFiles('offline-html', 'html', previewHtml, {
          includeBadge: false,
        })['index.html'],
    ],
    [
      'React index',
      () =>
        createReactExportFiles('offline-react', 'react', previewHtml, {
          includeBadge: false,
        })['index.html'],
    ],
    [
      'Next page',
      () =>
        createNextExportFiles('offline-next', 'next', previewHtml, {
          includeBadge: false,
        })['app/page.tsx'],
    ],
  ])(
    '%s contains no Ship Fast image API runtime dependency',
    (_name, build) => {
      const artifact = build()

      expect(artifact).not.toContain('/api/pexels')
    },
  )
})
