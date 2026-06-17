import { build } from 'esbuild'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('openui SSR runtime compatibility', () => {
  it('loads the MessageChannel shim before static React/OpenUI imports', async () => {
    const source = await readFile(
      new URL('./openui-ssr.js', import.meta.url),
      'utf8',
    )
    const importLines = source
      .split('\n')
      .filter((line) => line.startsWith('import '))

    expect(importLines[0]).toBe("import './openui-message-channel-polyfill.js'")
    expect(source).not.toContain('const ensureMessageChannel =')
  })

  it('loads when browser conditions are active without MessageChannel', async () => {
    const bundled = await build({
      bundle: true,
      conditions: ['browser', 'import', 'default'],
      format: 'esm',
      platform: 'browser',
      stdin: {
        contents: `
          import { renderOpenUIToHTML } from './packages/ship-fast-engine/src/openui-ssr.js'
          globalThis.__renderOpenUIToHTMLType = typeof renderOpenUIToHTML
          globalThis.__renderOpenUIToHTMLResult = renderOpenUIToHTML('$page = "Home"\\nroot = Text("Runtime verifier")')
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
    // @ts-expect-error: Test-only marker.
    delete globalThis.__renderOpenUIToHTMLType
    // @ts-expect-error: Test-only marker.
    delete globalThis.__renderOpenUIToHTMLResult
  }, 30000)
})
