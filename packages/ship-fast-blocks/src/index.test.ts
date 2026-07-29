import { describe, expect, it } from 'vitest'

// Root barrel — the eager full library.
import * as rootExports from './index.ts'
// Lightweight subpaths declared in package.json `exports`.
import * as runtimeExports from './runtime.ts'
import * as themeExports from './theme.ts'
import * as componentNamesExports from './component-names.ts'

describe('@ship-fast/blocks root exports', () => {
  it('exports the eager library, component names, and renderer from the barrel', () => {
    expect(rootExports.library).toBeTruthy()
    expect(Array.isArray(rootExports.componentNames)).toBe(true)
    expect(rootExports.componentNames).toContain('Stack')
    expect(rootExports.componentNames).toContain('Heading')
    expect(rootExports.componentNames).toContain('Button')
    expect(rootExports.componentNames).toContain('SplitHero')
    expect(typeof rootExports.Renderer).toBeDefined()
    expect(rootExports.openUIComponentOpenPatternSource).toBeTruthy()
  })

  it('re-exports theme presets and apply functions from the barrel', () => {
    expect(rootExports.defaultPresets).toBeTruthy()
    expect(typeof rootExports.applyThemeVars).toBe('function')
    expect(typeof rootExports.resolveThemeStyles).toBe('function')
  })
})

describe('@ship-fast/blocks/runtime subpath', () => {
  it('exports the runtime loaders and renderer primitives', () => {
    expect(typeof runtimeExports.loadOpenUIRuntimeLibrary).toBe('function')
    expect(typeof runtimeExports.loadOpenUIRuntimeComponent).toBe('function')
    expect(typeof runtimeExports.extractOpenUIRuntimeComponentNames).toBe(
      'function',
    )
    expect(typeof runtimeExports.getOpenUIRuntimeLibraryCacheKey).toBe(
      'function',
    )
    expect(typeof runtimeExports.Renderer).toBeDefined()
    expect(typeof runtimeExports.QueryClient).toBeDefined()
  })

  it('does NOT export the eager full library or component-name manifest', () => {
    // The runtime subpath must stay independent from the eager barrel: it
    // should not surface the full component registry or the name manifest.
    expect('library' in runtimeExports).toBe(false)
    expect('componentNames' in runtimeExports).toBe(false)
    expect('openUIComponentOpenPatternSource' in runtimeExports).toBe(false)
    expect('registry' in runtimeExports).toBe(false)
  })
})

describe('@ship-fast/blocks/theme subpath', () => {
  it('exports theme presets and the DOM apply functions', () => {
    expect(themeExports.defaultPresets).toBeTruthy()
    expect(Object.keys(themeExports.defaultPresets).length).toBeGreaterThan(0)
    expect(typeof themeExports.applyThemeVars).toBe('function')
    expect(typeof themeExports.resolveThemeStyles).toBe('function')
    expect(typeof themeExports.clearThemeVars).toBe('function')
    expect(typeof themeExports.isKnownTheme).toBe('function')
    expect(Array.isArray(themeExports.THEME_CATALOG)).toBe(true)
    expect(themeExports.THEME_VAR_KEYS.length).toBeGreaterThan(0)
  })

  it('does NOT pull in the eager full library or runtime loaders', () => {
    expect('library' in themeExports).toBe(false)
    expect('componentNames' in themeExports).toBe(false)
    expect('loadOpenUIRuntimeLibrary' in themeExports).toBe(false)
    expect('Renderer' in themeExports).toBe(false)
  })
})

describe('@ship-fast/blocks/component-names subpath', () => {
  it('exports the generated component-name manifest', () => {
    expect(Array.isArray(componentNamesExports.componentNames)).toBe(true)
    expect(componentNamesExports.componentNames).toContain('Stack')
    expect(componentNamesExports.componentNames).toContain('Heading')
    expect(componentNamesExports.componentNames).toContain('Button')
  })

  it('does NOT pull in the eager full library or runtime loaders', () => {
    expect('library' in componentNamesExports).toBe(false)
    expect('Renderer' in componentNamesExports).toBe(false)
    expect('loadOpenUIRuntimeLibrary' in componentNamesExports).toBe(false)
  })
})
