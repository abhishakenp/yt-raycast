import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  extractAllComponentNames,
  extractOpenUIRuntimeComponentNames,
  getOpenUIRuntimeLibraryCacheKey,
  loadAiCapsule,
  loadOpenUIRuntimeComponent,
  loadOpenUIRuntimeLibrary,
  type AiCapsuleRecord,
} from './runtime-library'
import { runtimeSectionComponentNameSet } from './generated/runtime-section-component-names'

describe('OpenUI runtime library loading', () => {
  it('extracts only known component calls and always includes the Stack root', () => {
    const names = extractOpenUIRuntimeComponentNames(`
      root = PageSwitch(routes=["Home"], pages=[home])
      anchored = SectionAnchor("home_features", home)
      home = SaasHero(title="Launch")
      body = Text("Ignore UnknownWidget(")
      missing = UnknownWidget()
    `)

    expect(names).toEqual([
      'PageSwitch',
      'SaasHero',
      'SectionAnchor',
      'Stack',
      'Text',
    ])
  })

  it('uses a stable cache key for equivalent component sets', () => {
    expect(
      getOpenUIRuntimeLibraryCacheKey('root = Text("Hi")\npage = Stack([])'),
    ).toBe(
      getOpenUIRuntimeLibraryCacheKey('page = Stack([])\nroot = Text("Hi")'),
    )
  })

  it('loads selected runtime components through generated dynamic loaders', async () => {
    const names = [
      'Stack',
      'Grid',
      'Box',
      'Section',
      'Heading',
      'Text',
    ] as Array<Parameters<typeof loadOpenUIRuntimeComponent>[0]>

    const capsules = await Promise.all(names.map(loadOpenUIRuntimeComponent))
    const library = await loadOpenUIRuntimeLibrary(`
      root = Stack(children=[heading, body])
      heading = Heading(text="Launch")
      body = Text(text="A response-scoped runtime")
    `)

    expect(capsules).toHaveLength(names.length)
    expect(capsules.every((capsule) => capsule.client)).toBe(true)
    expect(
      capsules.every(
        (capsule) => (capsule as { lakebed?: unknown }).lakebed,
      ),
    ).toBe(true)
    expect(library).toBeTruthy()
  })

  it('keeps runtime loaders dynamic and independent from generated source manifests', () => {
    const runtimeLibrarySource = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/runtime-library.ts'),
      'utf8',
    )
    const runtimeLoadersSource = readFileSync(
      join(
        process.cwd(),
        'packages/ship-fast-blocks/src/generated/runtime-component-loaders.ts',
      ),
      'utf8',
    )

    expect(runtimeLibrarySource).toContain(
      './generated/runtime-component-loaders.ts',
    )
    expect(runtimeLibrarySource).not.toContain('./library')
    expect(runtimeLibrarySource).not.toContain('./generated/index')
    expect(runtimeLibrarySource).not.toContain('react-export-sources')
    expect(runtimeLibrarySource).not.toContain('component-spec')
    expect(runtimeLoadersSource).toMatch(/\(\(\)\s*=>\s*import\(/)
    expect(runtimeLoadersSource).toContain('../registry/')
    expect(runtimeLoadersSource).toContain('../capsules/')
    expect(runtimeLoadersSource).not.toContain('../index')
    expect(runtimeLoadersSource).not.toContain('../library')
    expect(runtimeLoadersSource).not.toMatch(
      /(?:from|import\()\s*['"][^'"]*react-export-sources/,
    )
    expect(runtimeLoadersSource).not.toContain('component-spec')
  })

  it('wraps static section capsules with the realtime + editable HOC', async () => {
    // CafeHero is a static section capsule (registry/sections/**).
    expect(runtimeSectionComponentNameSet.has('CafeHero')).toBe(true)

    const capsule = await loadOpenUIRuntimeComponent(
      'CafeHero' as Parameters<typeof loadOpenUIRuntimeComponent>[0],
    )
    const component = capsule.client.component as { displayName?: string }
    expect(component.displayName).toBe('SectionRealtime(CafeHero)')
  })

  it('does NOT wrap structural primitives or page capsules', async () => {
    // Stack is a primitive; it must stay structural (wrapping would break layout).
    expect(runtimeSectionComponentNameSet.has('Stack')).toBe(false)

    const stack = await loadOpenUIRuntimeComponent(
      'Stack' as Parameters<typeof loadOpenUIRuntimeComponent>[0],
    )
    const component = stack.client.component as { displayName?: string }
    expect(component.displayName).not.toBe('SectionRealtime(Stack)')
  })

  it('does NOT wrap site chrome sections as admin-editable data', async () => {
    expect(runtimeSectionComponentNameSet.has('BeautyStoreNavbar')).toBe(true)
    expect(runtimeSectionComponentNameSet.has('BeautyStoreFooter')).toBe(true)

    const [navbar, footer, products] = await Promise.all([
      loadOpenUIRuntimeComponent(
        'BeautyStoreNavbar' as Parameters<typeof loadOpenUIRuntimeComponent>[0],
      ),
      loadOpenUIRuntimeComponent(
        'BeautyStoreFooter' as Parameters<typeof loadOpenUIRuntimeComponent>[0],
      ),
      loadOpenUIRuntimeComponent(
        'BeautyStoreProducts' as Parameters<
          typeof loadOpenUIRuntimeComponent
        >[0],
      ),
    ])

    expect(
      (navbar.client.component as { displayName?: string }).displayName,
    ).not.toBe('SectionRealtime(BeautyStoreNavbar)')
    expect(
      (footer.client.component as { displayName?: string }).displayName,
    ).not.toBe('SectionRealtime(BeautyStoreFooter)')
    expect(
      (products.client.component as { displayName?: string }).displayName,
    ).toBe('SectionRealtime(BeautyStoreProducts)')
  })

  it('keeps the runtime library wired through the section realtime wrapper', () => {
    const runtimeLibrarySource = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/runtime-library.ts'),
      'utf8',
    )
    expect(runtimeLibrarySource).toContain('withSectionRealtime')
    expect(runtimeLibrarySource).toContain('runtimeSectionComponentNameSet')
  })
})

describe('extractAllComponentNames', () => {
  it('extracts all component-like names including unknown ones', () => {
    const names = extractAllComponentNames(`
      hero = SaasHero(title="Hi")
      custom = AICustom_SaasHero_abc({})
      unknown = UnknownWidget()
    `)
    expect(names).toContain('SaasHero')
    expect(names).toContain('AICustom_SaasHero_abc')
    expect(names).toContain('UnknownWidget')
    expect(names).toContain('Stack')
  })
})

describe('loadOpenUIRuntimeLibrary with AI capsules', () => {
  it('loads library without error when AI capsules are provided but not referenced', async () => {
    const aiCapsules: AiCapsuleRecord[] = [
      {
        capsuleName: 'AICustom_Test_v1',
        parentCapsule: 'SaasHero',
        compiledJs: 'export default function C(props) { return null }',
        description: 'test',
      },
    ]
    // The AI capsule is not referenced in the response, so it should be
    // filtered out and the library should load with only static capsules.
    const library = await loadOpenUIRuntimeLibrary(
      'root = Stack([])',
      aiCapsules,
    )
    expect(library).toBeTruthy()
  })

  it('exports loadAiCapsule function for browser-side dynamic import', () => {
    // Blob URL dynamic import only works in browser environments.
    // Verify the function exists and is callable — full integration test
    // runs in the browser via OpenUIViewer.
    expect(typeof loadAiCapsule).toBe('function')
  })
})
