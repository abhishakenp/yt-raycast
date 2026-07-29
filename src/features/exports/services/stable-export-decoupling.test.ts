import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'

import { buildExportFromStableArtifact } from './stable-export-builder'

const artifact = {
  html: '<!doctype html><html><head><title>Artifact Shop</title></head><body><main><h1>Artifact Shop</h1><p>Final rendered content.</p></main></body></html>',
  siteSpec: { projectName: 'Artifact Shop' },
  lakebedData: { seedData: { posts: [{ title: 'First post' }] } },
}

const unzip = (body: Uint8Array) =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([path, contents]) => [
      path,
      strFromU8(contents),
    ]),
  )

describe('stable artifact exports', () => {
  it('creates a runnable static HTML export from final rendered HTML', async () => {
    const result = await buildExportFromStableArtifact({
      artifact,
      sessionId: 'stable-html',
      target: 'html',
    })

    expect(result.files['index.html']).toContain('<h1>Artifact Shop</h1>')
    expect(result.files['README.md']).toContain('Static website')
  })

  it.each(['react', 'next', 'lakebed'] as const)(
    'creates a %s project without needing generation source',
    async (target) => {
      const result = await buildExportFromStableArtifact({
        artifact,
        sessionId: `stable-${target}`,
        target,
      })

      if (target !== 'lakebed') expect(result.files['package.json']).toBeDefined()
      expect(Object.values(result.files).join('\n')).toContain('Artifact Shop')
      if (target === 'lakebed') {
        expect(result.files['server/index.ts']).toContain('capsule')
        expect(result.files['client/index.tsx']).toContain('export function App')
      }
    },
  )

  it('returns a zip download for non-HTML targets', async () => {
    const result = await buildExportFromStableArtifact({
      artifact,
      sessionId: 'stable-react-download',
      target: 'react',
    })
    const download = await (await import('./stable-export-builder')).buildDownloadFromStableArtifact(
      { artifact, sessionId: 'stable-react-download', target: 'react' },
      result.files,
      result.download,
    )

    expect(download.contentType).toBe('application/zip')
    expect(unzip(download.body as Uint8Array)['package.json']).toBeDefined()
  })
})
