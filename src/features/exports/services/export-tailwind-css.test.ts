import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const originalCwd = process.cwd()
const tempDirs: string[] = []

afterEach(() => {
  process.chdir(originalCwd)
  tempDirs
    .splice(0)
    .forEach((dir) => rmSync(dir, { recursive: true, force: true }))
  vi.resetModules()
})

describe('export Tailwind CSS helpers', () => {
  it('reads font theme declarations from the app stylesheet when available', async () => {
    vi.resetModules()
    const { readAppTailwindBaseThemeCss } =
      await import('./export-tailwind-css.ts')

    expect(readAppTailwindBaseThemeCss()).toContain(
      "--font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;",
    )
  })

  it('does not throw when the packaged export runtime has no app stylesheet', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'ship-fast-export-css-'))
    tempDirs.push(tempDir)
    process.chdir(tempDir)
    vi.resetModules()

    const { readAppLocalCssImports, readAppTailwindBaseThemeCss } =
      await import('./export-tailwind-css.ts')

    expect(readAppLocalCssImports()).toBe('')
    expect(readAppTailwindBaseThemeCss()).toBe('')
  })

  it('uses bundled app stylesheet sources when filesystem CSS is unavailable', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'ship-fast-export-css-'))
    tempDirs.push(tempDir)
    process.chdir(tempDir)
    vi.resetModules()

    const { readAppLocalCssImports, readAppTailwindBaseThemeCss } =
      await import('./export-tailwind-css.ts')
    const sourceMap = {
      'src/styles.css': [
        '@import url("./styles/index.css");',
        '@theme { --font-sans: "Bundled Sans", sans-serif; }',
        '* { box-sizing: border-box; }',
        'html, body, #app, #root, #__root { min-height: 100%; }',
        '#app, #root, #__root { width: 100%; min-width: 0; align-self: stretch; }',
        'body { margin: 0; }',
        '.dashboard-only { color: red; }',
      ].join('\n'),
      'src/styles/index.css':
        'body { display: flex; align-items: center; }\n.genui-preview .p-5 { padding: 1.25rem !important; }\n:root { --dashboard-token: 1; }',
    }

    expect(readAppLocalCssImports(sourceMap)).toContain('--dashboard-token: 1')
    const detachedCss = readAppLocalCssImports(sourceMap, {
      detachedDocument: true,
    })
    expect(detachedCss).toContain('.genui-preview .p-5')
    expect(detachedCss).toContain('--dashboard-token: 1')
    expect(detachedCss).not.toContain('display: flex')
    expect(detachedCss).not.toContain('align-items: center')
    expect(readAppTailwindBaseThemeCss(sourceMap)).toContain(
      '--font-sans: "Bundled Sans", sans-serif;',
    )
    expect(readAppTailwindBaseThemeCss(sourceMap)).toContain(
      '#app, #root, #__root { width: 100%; min-width: 0; align-self: stretch; }',
    )
    expect(readAppTailwindBaseThemeCss(sourceMap)).toContain(
      'body { margin: 0; }',
    )
    expect(readAppTailwindBaseThemeCss(sourceMap)).not.toContain(
      '.dashboard-only',
    )
  })

  it('falls back to theme-token utilities when Tailwind cannot compile in the export runtime', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'ship-fast-export-css-'))
    tempDirs.push(tempDir)
    process.chdir(tempDir)
    vi.resetModules()

    const { buildCompiledTailwindCssForSources } =
      await import('./export-tailwind-css.ts')
    const css = await buildCompiledTailwindCssForSources([
      {
        contents:
          ':root { --color-foreground: var(--foreground); --color-background: var(--background); }',
        extension: 'css',
      },
      {
        contents:
          '<a class="bg-foreground text-background text-foreground/[0.04] text-xs hover:bg-foreground/90 shadow-foreground/20 shadow-none"></a>',
        extension: 'html',
      },
    ])

    expect(css).toContain(
      '.bg-foreground { background-color: var(--foreground); }',
    )
    expect(css).toContain('.text-background { color: var(--background); }')
    expect(css).toContain(
      '.hover\\:bg-foreground\\/90:hover { background-color: color-mix(in oklab, var(--foreground) 90%, transparent); }',
    )
    expect(css).toContain(
      '.text-foreground\\/\\[0\\.04\\] { color: color-mix(in oklab, var(--foreground) 4%, transparent); }',
    )
    expect(css).toContain(
      '.shadow-foreground\\/20 { --tw-shadow-color: color-mix(in oklab, var(--foreground) 20%, transparent); }',
    )
    expect(css).not.toContain('.text-xs { color:')
    expect(css).not.toContain('.shadow-none { --tw-shadow-color:')
  })

  it('does not emit fallback color utilities for tokens absent from source CSS', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'ship-fast-export-css-'))
    tempDirs.push(tempDir)
    process.chdir(tempDir)
    vi.resetModules()

    const { buildCompiledTailwindCssForSources } =
      await import('./export-tailwind-css.ts')
    const css = await buildCompiledTailwindCssForSources([
      {
        contents: ':root { --color-background: var(--background); }',
        extension: 'css',
      },
      {
        contents:
          '<a class="bg-background text-foreground bg-brand-accent"></a>',
        extension: 'html',
      },
    ])

    expect(css).toContain(
      '.bg-background { background-color: var(--background); }',
    )
    expect(css).not.toContain('.text-foreground { color:')
    expect(css).not.toContain('.bg-brand-accent { background-color:')
  })
})
