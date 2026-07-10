import { build } from 'esbuild'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

declare global {
  var __renderOpenUIToHTMLType: string | undefined

  var __renderOpenUIToHTMLResult: string | undefined
}

describe('openui SSR runtime compatibility', () => {
  it('loads when browser conditions are active without MessageChannel', async () => {
    const bundled = await build({
      bundle: true,
      conditions: ['browser', 'import', 'default'],
      format: 'esm',
      platform: 'browser',
      stdin: {
        contents: `
          import { renderOpenUIToHTML } from './packages/ship-fast-engine/src/openui-ssr'
          globalThis.__renderOpenUIToHTMLType = typeof renderOpenUIToHTML
          globalThis.__renderOpenUIToHTMLResult = await renderOpenUIToHTML('$page = "Home"\\nroot = Text("Runtime verifier")')
        `,
        loader: 'js',
        resolveDir: process.cwd(),
      },
      write: false,
    })

    const originalMessageChannel = globalThis.MessageChannel
    // @ts-expect-error: This intentionally simulates Convex's runtime global set.
    delete globalThis.MessageChannel

    try {
      const tempDir = await mkdtemp(join(tmpdir(), 'openui-ssr-runtime-'))
      const tempFile = join(tempDir, `bundle-${Date.now()}.mjs`)

      try {
        await writeFile(tempFile, bundled.outputFiles[0].text)
        await import(pathToFileURL(tempFile).href)
      } finally {
        await rm(tempDir, { force: true, recursive: true })
      }
    } finally {
      if (originalMessageChannel === undefined) {
        // @ts-expect-error: Restore the missing global shape.
        delete globalThis.MessageChannel
      } else {
        globalThis.MessageChannel = originalMessageChannel
      }
    }

    expect(globalThis.__renderOpenUIToHTMLType).toBe('function')
    expect(globalThis.__renderOpenUIToHTMLResult).not.toContain('openui-error')
    expect(globalThis.__renderOpenUIToHTMLResult).toContain('Runtime verifier')
    delete globalThis.__renderOpenUIToHTMLType
    delete globalThis.__renderOpenUIToHTMLResult
  }, 60000)
})
