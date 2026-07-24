import { build } from 'esbuild'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, it } from 'vitest'

declare global {
  var __renderOpenUIToHTMLResult: string | undefined
}

describe('debug ssr', () => {
  it('prints the error', async () => {
    const bundled = await build({
      bundle: true,
      conditions: ['browser', 'import', 'default'],
      format: 'esm',
      platform: 'browser',
      stdin: {
        contents: `
          import { renderOpenUIToHTML } from './packages/ship-fast-engine/src/openui-ssr'
          globalThis.__renderOpenUIToHTMLResult = await renderOpenUIToHTML('$page = "Home"\\nroot = Text("Runtime verifier")')
        `,
        loader: 'js',
        resolveDir: process.cwd(),
      },
      write: false,
    })

    const tempDir = await mkdtemp(join(tmpdir(), 'openui-ssr-runtime-'))
    const tempFile = join(tempDir, `bundle-${Date.now()}.mjs`)
    try {
      await writeFile(tempFile, bundled.outputFiles[0].text)
      await import(pathToFileURL(tempFile).href)
    } finally {
      await rm(tempDir, { force: true, recursive: true })
    }
    console.log(
      'RESULT:',
      globalThis.__renderOpenUIToHTMLResult?.substring(0, 500),
    )
  }, 60000)
})
