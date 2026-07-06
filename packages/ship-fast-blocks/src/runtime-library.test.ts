import { afterEach, describe, expect, it, vi } from 'vitest'

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

afterEach(() => {
  vi.restoreAllMocks()
})

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
      capsules.every((capsule) => (capsule as { lakebed?: unknown }).lakebed),
    ).toBe(true)
    expect(library).toBeTruthy()
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

  it('registers legacy double-prefixed AI capsule references under the rendered source name', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(
      'data:text/javascript,export default function C(props) { return null }',
    )
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const aiCapsules: AiCapsuleRecord[] = [
      {
        capsuleName: 'AICustom_FashionStoreHero_home_hero',
        parentCapsule: 'FashionStoreHero',
        compiledJs: 'export default function C(props) { return null }',
        description: 'AI-edited fashion store hero',
      },
    ]

    const library = await loadOpenUIRuntimeLibrary(
      `
        root = Stack(children=[hero])
        hero = AICustom_AICustom_FashionStoreHero_home_hero_home_hero({
          title: "Editorial launch"
        })
      `,
      aiCapsules,
    )

    const components = (
      library as unknown as {
        components: Record<string, { component: unknown }>
      }
    ).components
    expect(
      typeof components.AICustom_AICustom_FashionStoreHero_home_hero_home_hero
        ?.component,
    ).toBe('function')
  })
})
