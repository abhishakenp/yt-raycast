import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import { buildOpenUIExport } from './openui-export-builder'

const htmlFragmentSource =
  '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers choose perfect toys.</p></main>'

const unzipTextFiles = (body: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [
      name,
      strFromU8(value),
    ]),
  )

describe('static HTML fragment exports', () => {
  it('packages rendered HTML fragments as static ZIPs instead of parsing page text as OpenUI', async () => {
    const result = await buildOpenUIExport({
      source: htmlFragmentSource,
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(result.contentType).toBe('application/zip')
    expect(files['index.html']).toBe(htmlFragmentSource)
    expect(Object.values(files).join('\n')).not.toContain(
      'OpenUI source has unresolved references',
    )
  })
})
