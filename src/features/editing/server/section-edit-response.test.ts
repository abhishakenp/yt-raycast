import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'

import {
  createSectionEditResponse,
  patchOpenUiSourceWithAiCapsule,
} from './section-edit-response'

// We test the exported pure functions plus behavioral invariants that guard
// against regressions which the old AST-structural tests covered indirectly:
//   - esbuild must stay out of the Vite client bundle (dynamic import only)
//   - the route must not eagerly load the heavy section-edit module
//   - the generated capsule helpers must keep exporting the names we depend on
//   - the data-URL capsule smoke-test import path must keep working
// The main handler itself requires Convex + esbuild + LLM mocking which is
// covered by integration tests.

describe('patchOpenUiSourceWithAiCapsule', () => {
  it('replaces capsule reference with AI capsule name when varName is provided', () => {
    const source = `
hero = SaasHero({
  headline: "Welcome",
  ctaLabel: "Get Started"
})
navbar = SaasNavbar({ links: [] })
`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'SaasHero',
      'AICustom_SaasHero_abc123',
      'hero',
    )
    expect(result).toBe(`
hero = AICustom_SaasHero_abc123({
  headline: "Welcome",
  ctaLabel: "Get Started"
})
navbar = SaasNavbar({ links: [] })
`)
  })

  it('replaces all references when varName is not provided', () => {
    const source = `hero = SaasHero({})
footer = SaasHero({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'SaasHero',
      'AICustom_SaasHero_xyz',
    )
    expect(result).toBe(`hero = AICustom_SaasHero_xyz({})
footer = AICustom_SaasHero_xyz({})`)
  })

  it('handles capsule names with special regex characters', () => {
    const source = `hero = My.Capsule({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'My.Capsule',
      'AICustom_MyCapsule',
      'hero',
    )
    expect(result).toBe('hero = AICustom_MyCapsule({})')
  })

  it('does not modify source when capsule name is not found', () => {
    const source = `hero = SaasHero({})`
    const result = patchOpenUiSourceWithAiCapsule(
      source,
      'NonExistent',
      'AICustom_NonExistent',
      'hero',
    )
    expect(result).toBe(source)
  })
})

describe('section-edit-response behavioral invariants', () => {
  it('returns a stable public error when the generation view lookup fails', async () => {
    const response = await createSectionEditResponse(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
      new Request(
        'https://ship-fast.test/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make Pineapple Saison feel more seasonal',
            selection: {
              elementPath: 'main section:nth-of-type(2)',
              tag: 'section',
              outerHTML: '<section><h2>Our Brew Selection</h2></section>',
              openuiComponent: 'RestaurantMenu',
              openuiVar: 'home_menu',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => {
            throw new Error(
              'ConvexError: section edit lookup failed for k574ms14ma9f94keq30r7dq24x89n1k2 Craft Beer Brewery',
            )
          },
          mutation: async () => {
            throw new Error('unexpected mutation')
          },
        },
        generate: async () => {
          throw new Error('model should not run before lookup succeeds')
        },
      },
    )
    const body = await response.json()

    expect(body).toEqual({ error: 'Unable to edit section.' })
    expect(JSON.stringify(body)).not.toContain(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
    expect(JSON.stringify(body)).not.toContain('ConvexError')
    expect(JSON.stringify(body)).not.toContain('Craft Beer Brewery')
    expect(response.status).toBe(503)
  })

  it('does not eagerly load esbuild at module import time', async () => {
    // esbuild (and its native fsevents dep) must only be loaded when a capsule
    // is actually compiled, never when section-edit-response is first imported.
    // If someone flips `await import('esbuild')` to a static `import esbuild`,
    // the mock factory below runs during module evaluation and the test fails.
    const esbuildLoaded = vi.fn()
    vi.doMock('esbuild', () => {
      esbuildLoaded()
      return {
        build: vi.fn(async () => ({
          outputFiles: [{ contents: new Uint8Array() }],
        })),
        transform: vi.fn(),
      }
    })
    vi.resetModules()
    try {
      await import('./section-edit-response')
      expect(esbuildLoaded).not.toHaveBeenCalled()
    } finally {
      vi.doUnmock('esbuild')
      vi.resetModules()
    }
  })

  it('route handler does not eagerly import section-edit-response', async () => {
    // The route must dynamically import the heavy section-edit module inside
    // the POST handler so esbuild/Convex are not pulled into every page load.
    // If someone hoists the import to the top of the route file, the mock
    // factory below runs during route module evaluation and the test fails.
    const sectionEditLoaded = vi.fn()
    vi.doMock('@/features/editing/server/section-edit-response', () => {
      sectionEditLoaded()
      return {
        createSectionEditResponse: vi.fn(),
        patchOpenUiSourceWithAiCapsule: vi.fn(),
      }
    })
    vi.resetModules()
    try {
      await import('@/routes/api/sessions.$sessionId.section-edit')
      expect(sectionEditLoaded).not.toHaveBeenCalled()
    } finally {
      vi.doUnmock('@/features/editing/server/section-edit-response')
      vi.resetModules()
    }
  })

  it('@ship-fast/blocks/generated exports the capsule helpers needed by section-edit-response', async () => {
    // section-edit-response dynamically imports findSimilarCapsules and the
    // react export sources from the generated barrel. If the generated package
    // stops exporting any of these, capsule editing breaks at runtime.
    const generated = await import('@ship-fast/blocks/generated')
    expect(typeof generated.findSimilarCapsules).toBe('function')
    expect(typeof generated.reactExportSourcesBase64).toBe('string')
    expect(generated.reactExportSourcesBase64.length).toBeGreaterThan(0)
    expect(typeof generated.reactExportSourcesEncoding).toBe('string')
    expect(generated.reactExportSourcesEncoding.length).toBeGreaterThan(0)
  })

  it('a compiled TSX capsule can be imported via data URL', async () => {
    // Mirrors smokeTestCapsule: compile TSX with esbuild, rewrite external
    // React imports to global references, import the result via a data: URL,
    // and verify it renders. If the data-URL import pattern breaks, capsule
    // smoke tests fail silently in production.
    const esbuild = await import('esbuild')
    const tsxSource = `
export default function TestCapsule() {
  return React.createElement('div', null, 'Hello from capsule')
}
`
    const result = await esbuild.build({
      stdin: { contents: tsxSource, loader: 'tsx' },
      bundle: true,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      write: false,
      external: ['react', 'react/jsx-runtime'],
    })
    const output = result.outputFiles[0]
    expect(output).toBeDefined()
    let compiledJs = new TextDecoder().decode(output!.contents)
    // Same rewrites section-edit-response applies so the compiled JS can run
    // without an import map (React comes from globalThis).
    compiledJs = compiledJs
      .replace(
        /import\s+React\s+from\s+["']react["'];?\s*/g,
        'const React = globalThis.React;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react\/jsx-runtime["'];?\s*/g,
        'const { $1 } = globalThis.__jsxRuntime;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react["'];?\s*/g,
        'const { $1 } = globalThis.React;',
      )

    const React = await import('react')
    const jsxRuntime = await import('react/jsx-runtime')
    const smokeGlobals = globalThis as typeof globalThis & {
      React?: typeof React
      __jsxRuntime?: typeof jsxRuntime
    }
    smokeGlobals.React = React
    smokeGlobals.__jsxRuntime = jsxRuntime

    const dataUrl = `data:text/javascript;base64,${Buffer.from(compiledJs).toString('base64')}`
    const mod = await import(/* @vite-ignore */ dataUrl)
    expect(typeof mod.default).toBe('function')

    const { renderToStaticMarkup } = await import('react-dom/server')
    const html = renderToStaticMarkup(mod.default({}))
    expect(html).toContain('Hello from capsule')
  })
})
