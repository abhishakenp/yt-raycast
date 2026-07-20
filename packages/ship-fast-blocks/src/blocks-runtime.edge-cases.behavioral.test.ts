// @vitest-environment jsdom

/**
 * Behavioral edge-case coverage for the OpenUI blocks runtime, capsules,
 * theme presets, theme application, Medusa integrations, image search query
 * blending, and route navigation. Runs under jsdom so the theme-apply DOM
 * assertions work; the pure-logic suites are environment-agnostic and run
 * happily under jsdom too. No jest-dom matchers are used.
 *
 * Philosophy: assert EXPECTED/CORRECT behavior. If the code is buggy, the
 * test MUST fail — never pin broken behavior. Tests observe public behavior
 * only (no source-code structure assertions).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { z } from 'zod/v4'
import { Renderer } from '@openuidev/react-lang'

import {
  extractOpenUIRuntimeComponentNames,
  getOpenUIRuntimeLibraryCacheKey,
  loadOpenUIRuntimeComponent,
  loadOpenUIRuntimeLibrary,
  type AiCapsuleRecord,
} from './runtime-library.ts'
import { defineCapsule, isCapsule } from './capsules/openui.ts'
import { sanitizeProps } from './capsules/sanitize-props.ts'
import {
  THEME_CATALOG,
  THEME_NAMES,
  THEME_VAR_KEYS,
  applyThemeVars,
  clearThemeVars,
  isKnownTheme,
  resolveThemeStyles,
  themeLabel,
} from './theme-apply.ts'
import {
  defaultPresets,
  themeStylePropsSchema,
  type ThemeStyles,
} from './theme-presets.ts'
import {
  OpenUIIntegrationProviders,
  OpenUIMedusaContext,
  provisionMedusaIntegration,
  type OpenUIIntegrationConfig,
} from './integrations.tsx'
import {
  buildImageSearchQuery,
  extractDomainHint,
  type ImageContext,
} from './lib/image-search-query.ts'
import { parseRouteTarget, resolveRouteTarget } from './lib/route-context.tsx'

// ─── Shared helpers ────────────────────────────────────────────────────────

function MedusaProbe() {
  const ctx = React.useContext(OpenUIMedusaContext)
  return React.createElement(
    'div',
    { 'data-testid': 'medusa-probe' },
    JSON.stringify(ctx),
  )
}

function readProbe(container: HTMLElement): Record<string, unknown> {
  return JSON.parse(container.textContent ?? '{}')
}

// The optional style tokens that not every preset defines (fonts, shadow
// matrix, letter-spacing, spacing, radius). THEME_VAR_KEYS (44) minus these 12
// === the 32 core design tokens every preset MUST define in both light/dark.
const OPTIONAL_STYLE_KEYS = new Set([
  'font-sans',
  'font-serif',
  'font-mono',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
  'radius',
])

const CORE_THEME_KEYS = THEME_VAR_KEYS.filter(
  (key) => !OPTIONAL_STYLE_KEYS.has(key),
)

// ─── Runtime ───────────────────────────────────────────────────────────────

describe('runtime', () => {
  describe('loadOpenUIRuntimeLibrary', () => {
    it('1. loads a library and exposes renderer functions for each component', async () => {
      const library = await loadOpenUIRuntimeLibrary(`
        root = Stack(children=[heading, body])
        heading = Heading(text="Launch")
        body = Text(text="A response-scoped runtime")
      `)

      expect(library).toBeTruthy()
      // The library carries a components map; each entry exposes a renderer fn.
      expect(typeof library).toBe('object')
      const components = (
        library as unknown as {
          components: Record<string, { component: unknown }>
        }
      ).components
      expect(components).toBeTruthy()
      expect(typeof components.Stack?.component).toBe('function')
      expect(typeof components.Heading?.component).toBe('function')
      expect(typeof components.Text?.component).toBe('function')
      expect((library as unknown as { root: string }).root).toBe('Stack')
    })
  })

  describe('extractOpenUIRuntimeComponentNames', () => {
    it('2. extracts known component calls from OpenUI source and always seeds Stack', () => {
      const names = extractOpenUIRuntimeComponentNames(`
        root = PageSwitch(routes=["Home"], pages=[home])
        home = SaasHero(title="Launch")
        body = Text("Ignore UnknownWidget(")
        missing = UnknownWidget()
      `)

      // Only known runtime component names are kept; unknown ones are dropped.
      expect(names).toContain('Stack')
      expect(names).toContain('PageSwitch')
      expect(names).toContain('SaasHero')
      expect(names).toContain('Text')
      expect(names).not.toContain('UnknownWidget')
      // Result is sorted for stable cache keys.
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })
  })

  describe('getOpenUIRuntimeLibraryCacheKey', () => {
    it('3. is stable for equivalent source + capsules and diverges when either changes', () => {
      const src = 'root = Stack([])\nbody = Text("Hi")'
      expect(getOpenUIRuntimeLibraryCacheKey(src)).toBe(
        getOpenUIRuntimeLibraryCacheKey(src),
      )
      // Reordering statements does not change the extracted (sorted) name set.
      expect(
        getOpenUIRuntimeLibraryCacheKey('root = Stack([])\nbody = Text("Hi")'),
      ).toBe(
        getOpenUIRuntimeLibraryCacheKey('body = Text("Hi")\nroot = Stack([])'),
      )

      const capsuleA: AiCapsuleRecord = {
        capsuleName: 'AICustom_A',
        parentCapsule: 'SaasHero',
        compiledJs: '',
        description: '',
      }
      const capsuleB: AiCapsuleRecord = {
        capsuleName: 'AICustom_B',
        parentCapsule: 'SaasHero',
        compiledJs: '',
        description: '',
      }
      expect(getOpenUIRuntimeLibraryCacheKey(src, [capsuleA])).not.toBe(
        getOpenUIRuntimeLibraryCacheKey(src, [capsuleB]),
      )
      expect(getOpenUIRuntimeLibraryCacheKey(src, [capsuleA])).not.toBe(
        getOpenUIRuntimeLibraryCacheKey(src, []),
      )
    })
  })

  describe('loadOpenUIRuntimeComponent', () => {
    it('4. returns a loader promise resolving to a capsule with a renderer function', async () => {
      const result = loadOpenUIRuntimeComponent(
        'Stack' as Parameters<typeof loadOpenUIRuntimeComponent>[0],
      )
      expect(typeof result.then).toBe('function') // promise / loader returned
      const capsule = await result
      expect(capsule.client).toBeTruthy()
      expect(typeof capsule.client.component).toBe('function')
      expect((capsule as { lakebed?: unknown }).lakebed).toBeTruthy()
    })
  })

  describe('AI capsule rendering', () => {
    it('inherits positional props through AI capsule parent chains', async () => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(
        [
          'data:text/javascript,',
          encodeURIComponent(`
            export default function C(props) {
              return globalThis.React.createElement(
                'p',
                { 'data-testid': 'ai-capsule' },
                String(props.text || '')
              )
            }
          `),
        ].join(''),
      )
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const source = 'root = AICustom_AICustom_Text_body_body("Inherited text")'
      const library = await loadOpenUIRuntimeLibrary(source, [
        {
          capsuleName: 'AICustom_Text_body',
          parentCapsule: 'Text',
          compiledJs: 'export default function C(props) { return null }',
          description: 'First AI edit',
        },
        {
          capsuleName: 'AICustom_AICustom_Text_body_body',
          parentCapsule: 'AICustom_Text_body',
          compiledJs: 'export default function C(props) { return null }',
          description: 'Second AI edit',
        },
      ])

      const { container } = render(
        React.createElement(Renderer, {
          response: source,
          library,
        }),
      )

      expect(
        container.querySelector('[data-testid="ai-capsule"]')?.textContent,
      ).toBe('Inherited text')

      vi.restoreAllMocks()
    })

    it('passes OpenUI args into legacy double-prefixed AI capsule aliases', async () => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(
        [
          'data:text/javascript,',
          encodeURIComponent(`
            export default function C(props) {
              return globalThis.React.createElement(
                'section',
                { 'data-testid': 'ai-capsule' },
                String(props.title || '') + '|' + String(props.subtitle || '')
              )
            }
          `),
        ].join(''),
      )
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const source = `
        root = AICustom_AICustom_FashionStoreHero_home_hero_home_hero({
          title: "Editorial launch",
          subtitle: "Quiet luxury"
        })
      `
      const library = await loadOpenUIRuntimeLibrary(source, [
        {
          capsuleName: 'AICustom_FashionStoreHero_home_hero',
          parentCapsule: 'MissingDynamicParent',
          compiledJs: 'export default function C(props) { return null }',
          description: 'AI-edited fashion store hero',
        },
      ])

      const { container } = render(
        React.createElement(Renderer, {
          response: source,
          library,
        }),
      )

      expect(
        container.querySelector('[data-testid="ai-capsule"]')?.textContent,
      ).toBe('Editorial launch|Quiet luxury')

      vi.restoreAllMocks()
    })

    it('renders a multi-page marketing agency source with an AI hero capsule and non-English props', async () => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(
        [
          'data:text/javascript,',
          encodeURIComponent(`
            export default function C(props) {
              return globalThis.React.createElement(
                'section',
                { 'data-testid': 'ai-marketing-hero' },
                [
                  globalThis.React.createElement('p', { key: 'eyebrow' }, 'AI live edit verified 0705'),
                  globalThis.React.createElement('h1', { key: 'heading' }, String(props.headingBefore || '')),
                  globalThis.React.createElement('p', { key: 'highlight' }, String(props.highlight || ''))
                ]
              )
            }
          `),
        ].join(''),
      )
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const source = `
        home_navbar = MarketingAgencyNavbar("Glass Polished", ["Home","Services","Pricing"])
        home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
        home_hero = AICustom_MarketingAgencyHero_home_hero("प्रीमियम ग्लास सॉल्यूशंस", "हिंदी पक्का सत्यापन", "", "From sleek storefronts to sophisticated interiors.", "Get a Free Quote", "View Portfolio", ["ISO Certified","10,000+ Projects"], "Showcase of polished glass installations", "99%", "Customer Satisfaction")
        home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
        home_stats = MarketingAgencyStats([{"value":"99%","label":"Customer Satisfaction"}])
        home_stats_anchor = SectionAnchor("home_stats", home_stats, "scroll-mt-28")
        home = Stack([home_navbar_anchor, home_hero_anchor, home_stats_anchor])
        services = Stack([home_navbar_anchor, home_stats_anchor])
        pricing = Stack([home_navbar_anchor, home_stats_anchor])
        root = PageSwitch(["Home","Services","Pricing"], [home, services, pricing], "", {"Home":"Home","Services":"Services","Pricing":"Pricing"})
      `
      const library = await loadOpenUIRuntimeLibrary(source, [
        {
          capsuleName: 'AICustom_MarketingAgencyHero_home_hero',
          parentCapsule: 'MarketingAgencyHero',
          compiledJs: 'export default function C(props) { return null }',
          description: 'AI-edited marketing agency hero',
        },
      ])

      const { container } = render(
        React.createElement(Renderer, {
          response: source,
          library,
        }),
      )

      expect(
        container.querySelector('[data-testid="ai-marketing-hero"]')
          ?.textContent,
      ).toContain('AI live edit verified 0705')
      expect(container.textContent).toContain('हिंदी पक्का सत्यापन')

      vi.restoreAllMocks()
    })
  })

  describe('section capsule wrapping', () => {
    it('5. stamps capsule identity attrs (data-openui-component / data-openui-var) on the rendered root', () => {
      const capsule = defineCapsule({
        name: 'TestSection',
        description: 'edge-case test capsule',
        props: z.object({ text: z.string() }),
        component: ({ props }) => React.createElement('div', null, props.text),
      })

      // The capsule's client renderer wraps the user component and stamps
      // data attrs on the root element so the inspector can map DOM -> capsule.
      const output = capsule.client.component({
        props: { text: 'hello' },
        statementId: 'hero_block',
      } as Parameters<
        typeof capsule.client.component
      >[0]) as React.ReactElement<Record<string, unknown>>

      expect(output).toBeTruthy()
      expect(output.props['data-openui-component']).toBe('TestSection')
      expect(output.props['data-openui-var']).toBe('hero_block')
      // Original children/content preserved through the clone.
      expect(output.props.children).toBe('hello')
    })
  })
})

// ─── Capsules ──────────────────────────────────────────────────────────────

describe('capsules', () => {
  describe('defineCapsule', () => {
    it('6. creates a valid capsule definition with client + lakebed + OpenUI metadata', () => {
      const capsule = defineCapsule({
        name: 'EdgeCaseCapsule',
        description: 'a capsule',
        props: z.object({ title: z.string() }),
        component: ({ props }) =>
          React.createElement('span', null, props.title),
      })

      expect(capsule.client).toBeTruthy()
      expect(capsule.lakebed).toBeTruthy()
      // OpenUI defined-component metadata is spread onto the capsule.
      expect(capsule.client.name).toBe('EdgeCaseCapsule')
      expect(typeof capsule.client.component).toBe('function')
      expect(capsule.client.props).toBeTruthy()
      // The capsule is recognized by isCapsule.
      expect(isCapsule(capsule)).toBe(true)
    })
  })

  describe('sanitizeProps', () => {
    it('7. drops undefined optional fields, preserves null for nullable fields, keeps valid values', () => {
      const schema = z.object({
        name: z.string(),
        nickname: z.string().optional(),
        tagline: z.string().nullable(),
      })

      const out = sanitizeProps(
        {
          name: 'Ada',
          nickname: undefined,
          tagline: null,
        },
        schema,
      ) as Record<string, unknown>

      expect(out.name).toBe('Ada')
      expect('nickname' in out).toBe(false) // undefined optional -> removed
      expect(out.tagline).toBe(null) // nullable null -> preserved
    })

    it('8. sanitizes nested objects and arrays recursively', () => {
      const schema = z.object({
        title: z.string(),
        items: z
          .array(
            z.object({
              label: z.string(),
              count: z.number().optional(),
            }),
          )
          .optional(),
      })

      const out = sanitizeProps(
        {
          title: 'List',
          items: [
            { label: 'a', count: undefined },
            { label: 'b', count: 2 },
          ],
        },
        schema,
      ) as { title: string; items: Array<Record<string, unknown>> }

      expect(out.title).toBe('List')
      expect(out.items).toHaveLength(2)
      // undefined optional nested field is removed; valid value preserved.
      expect('count' in out.items[0]).toBe(false)
      expect(out.items[1].count).toBe(2)
    })
  })

  describe('isCapsule', () => {
    it('9. returns true for a valid capsule and false for a plain object', () => {
      const capsule = defineCapsule({
        name: 'IsCapsuleProbe',
        description: '',
        props: z.object({}),
        component: () => React.createElement('div'),
      })
      expect(isCapsule(capsule)).toBe(true)

      expect(isCapsule({})).toBe(false)
      expect(isCapsule({ client: 'not-a-component' })).toBe(false)
      expect(isCapsule(null)).toBe(false)
      expect(isCapsule(undefined)).toBe(false)
    })
  })

  describe('withLakebed (defineCapsule Lakebed client wiring)', () => {
    it('10. wraps the component so its renderer receives a Lakebed client runtime', async () => {
      // withLakebed must be an exported wrapper from the capsules module. If
      // the export is missing that is a BUG — this test must FAIL.
      const mod = await import('./capsules/openui.ts')
      const withLakebed = (mod as { withLakebed?: unknown }).withLakebed
      expect(typeof withLakebed).toBe('function')

      // The wrapper hands a Lakebed client runtime to the component renderer.
      let capturedLakebed: unknown = null
      const capsule = defineCapsule({
        name: 'LakebedWrapped',
        description: '',
        props: z.object({}),
        component: ({ lakebed }) => {
          capturedLakebed = lakebed
          return React.createElement('div')
        },
      })

      capsule.client.component({
        props: {},
        statementId: 'x',
      } as Parameters<typeof capsule.client.component>[0])

      // The Lakebed client factory is invoked inside the wrapper and the
      // resulting runtime is handed to the user's component.
      expect(capturedLakebed).toBeTruthy()
      expect(typeof (capturedLakebed as { useData?: unknown }).useData).toBe(
        'function',
      )
      expect(typeof (capturedLakebed as { useQuery?: unknown }).useQuery).toBe(
        'function',
      )
    })
  })
})

// ─── Theme presets ─────────────────────────────────────────────────────────

describe('theme presets', () => {
  it('11. every preset (30+) conforms to the themeStylePropsSchema shape (string tokens only)', () => {
    const presetNames = Object.keys(defaultPresets)
    expect(presetNames.length).toBeGreaterThanOrEqual(30)

    const partialSchema = themeStylePropsSchema.partial()
    const allowedKeys = new Set(THEME_VAR_KEYS)
    for (const [name, preset] of Object.entries(defaultPresets)) {
      for (const mode of ['light', 'dark'] as const) {
        const variant = preset.styles[mode] ?? {}
        // Every declared key is a known THEME_VAR_KEY.
        for (const key of Object.keys(variant)) {
          expect(
            allowedKeys.has(key),
            `${name}.${mode} unknown key ${key}`,
          ).toBe(true)
        }
        // Every present value is a string (schema contract).
        for (const [key, value] of Object.entries(variant)) {
          expect(typeof value, `${name}.${mode}.${key} must be string`).toBe(
            'string',
          )
        }
        // Validates against the partial schema (all present keys are strings).
        const parsed = partialSchema.safeParse(variant)
        expect(parsed.success, `${name}.${mode} schema parse`).toBe(true)
      }
    }
  })

  it('12. every preset defines all 32 core THEME_VAR_KEYS in both light and dark mode', () => {
    // The core tokens == THEME_VAR_KEYS (44) minus the 12 optional style
    // tokens (fonts, shadow matrix, letter-spacing, spacing, radius) that only
    // some presets define. The remaining 32 are required in every preset/mode.
    expect(CORE_THEME_KEYS.length).toBe(32)

    for (const [name, preset] of Object.entries(defaultPresets)) {
      for (const mode of ['light', 'dark'] as const) {
        const variant = preset.styles[mode] ?? {}
        for (const key of CORE_THEME_KEYS) {
          expect(
            variant[key as keyof typeof variant],
            `${name}.${mode} missing core token ${key}`,
          ).toBeTruthy()
        }
      }
    }
  })

  it('13. isKnownTheme rejects unknown themes and themeLabel falls back', () => {
    const known = THEME_NAMES[0]!
    expect(isKnownTheme(known)).toBe(true)
    expect(isKnownTheme('not-a-real-theme')).toBe(false)
    expect(isKnownTheme(123)).toBe(false)
    expect(isKnownTheme(null)).toBe(false)
    expect(isKnownTheme(undefined)).toBe(false)

    expect(themeLabel(known)).toBe(defaultPresets[known].label ?? known)
    expect(themeLabel('nope')).toBe('Default')
    expect(themeLabel(null)).toBe('Default')
    expect(themeLabel(undefined)).toBe('Default')
  })

  it('14. THEME_CATALOG lists every preset with a vibe description', () => {
    expect(THEME_CATALOG.length).toBe(THEME_NAMES.length)
    const catalogNames = new Set(THEME_CATALOG.map((e) => e.name))
    for (const name of THEME_NAMES) {
      expect(catalogNames.has(name), `catalog missing ${name}`).toBe(true)
    }
    for (const entry of THEME_CATALOG) {
      expect(typeof entry.name).toBe('string')
      expect(entry.name.length).toBeGreaterThan(0)
      expect(typeof entry.label).toBe('string')
      expect(entry.label.length).toBeGreaterThan(0)
      // Vibe description is present and non-trivial.
      expect(typeof entry.description).toBe('string')
      expect(entry.description.length).toBeGreaterThan(3)
    }
  })
})

// ─── Theme apply ───────────────────────────────────────────────────────────

describe('theme apply', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = ''
    document.documentElement.className = ''
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('15. resolveThemeStyles returns CSS vars object for known theme and null for unknown', () => {
    const known = THEME_NAMES[0]!
    const styles = resolveThemeStyles(known)
    expect(styles).not.toBeNull()
    expect(styles!.light.background).toBeTruthy()
    expect(styles!.dark.background).toBeTruthy()

    expect(resolveThemeStyles('nope')).toBeNull()
    expect(resolveThemeStyles('')).toBeNull()
    expect(resolveThemeStyles(null)).toBeNull()
    expect(resolveThemeStyles(undefined)).toBeNull()
  })

  it('16. applyThemeVars injects CSS custom properties from the light preset onto the root', () => {
    const known = THEME_NAMES[0]!
    const styles = resolveThemeStyles(known) as ThemeStyles
    const root = document.documentElement
    applyThemeVars(root, styles, false)

    expect(root.style.getPropertyValue('--background')).toBe(
      styles.light.background,
    )
    expect(root.style.getPropertyValue('--primary')).toBe(styles.light.primary)
    expect(root.style.getPropertyValue('--ring')).toBe(styles.light.ring)
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')
  })

  it('17. dark mode overlays dark vars and adds the .dark class', () => {
    const known = THEME_NAMES[0]!
    const styles = resolveThemeStyles(known) as ThemeStyles
    const root = document.documentElement
    applyThemeVars(root, styles, true)

    expect(root.style.getPropertyValue('--background')).toBe(
      styles.dark.background,
    )
    expect(root.style.getPropertyValue('--primary')).toBe(styles.dark.primary)
    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.colorScheme).toBe('dark')
  })

  it('18. clearThemeVars removes every managed CSS custom property', () => {
    const known = THEME_NAMES[0]!
    const styles = resolveThemeStyles(known) as ThemeStyles
    const root = document.documentElement
    applyThemeVars(root, styles, false)
    expect(root.style.getPropertyValue('--background')).not.toBe('')

    clearThemeVars(root)
    for (const key of THEME_VAR_KEYS) {
      expect(root.style.getPropertyValue(`--${key}`)).toBe('')
    }
  })
})

// ─── Integrations ──────────────────────────────────────────────────────────

describe('integrations', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('19. OpenUIIntegrationProviders provides a Medusa context to children', () => {
    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        {
          medusa: { enabled: false, config: {} },
          sessionId: null,
        },
        React.createElement(MedusaProbe),
      ),
    )
    const value = readProbe(container)
    expect(value.enabled).toBe(false)
    expect(value.status).toBe('disabled')
    expect(value.backendUrl).toBeNull()
    expect(value.storefrontUrl).toBeNull()
  })

  it('20. pickMedusaBackendUrl prefers backendUrl over adminBaseUrl and trims whitespace', () => {
    const config: OpenUIIntegrationConfig = {
      backendUrl: '  https://api.example.com  ',
      adminBaseUrl: 'https://admin.example.com',
    }
    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        { medusa: { enabled: true, config }, sessionId: null },
        React.createElement(MedusaProbe),
      ),
    )
    const value = readProbe(container)
    expect(value.backendUrl).toBe('https://api.example.com')
  })

  it('21. pickMedusaStorefrontUrl surfaces the correct storefront URL', async () => {
    // pickMedusaStorefrontUrl must be an exported helper from the integrations
    // module. If the export is missing that is a BUG — this test must FAIL.
    const mod = await import('./integrations.tsx')
    const pickMedusaStorefrontUrl = (
      mod as { pickMedusaStorefrontUrl?: unknown }
    ).pickMedusaStorefrontUrl
    expect(typeof pickMedusaStorefrontUrl).toBe('function')

    const config: OpenUIIntegrationConfig = {
      adminBaseUrl: 'https://admin.example.com',
      storefrontUrl: '  https://shop.example.com  ',
    }
    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        { medusa: { enabled: true, config }, sessionId: null },
        React.createElement(MedusaProbe),
      ),
    )
    const value = readProbe(container)
    expect(value.storefrontUrl).toBe('https://shop.example.com')
  })

  it('22. provisionMedusaIntegration provisions merged config from the server response', async () => {
    // provisionMedusaIntegration must be an exported function from the
    // integrations module. If the export is missing that is a BUG — this test
    // must FAIL.
    const mod = await import('./integrations.tsx')
    const provisionMedusaIntegration = (
      mod as { provisionMedusaIntegration?: unknown }
    ).provisionMedusaIntegration
    expect(typeof provisionMedusaIntegration).toBe('function')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        enabled: true,
        config: {
          backendUrl: 'https://prov.example.com',
          storefrontUrl: 'https://prov-shop.example.com',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const initialConfig: OpenUIIntegrationConfig = {
      adminBaseUrl: 'https://admin.example.com',
    }
    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        {
          medusa: { enabled: true, config: initialConfig },
          sessionId: 'sess-123',
        },
        React.createElement(MedusaProbe),
      ),
    )

    await waitFor(() => {
      const value = readProbe(container)
      expect(value.status).toBe('ready')
      expect(value.backendUrl).toBe('https://prov.example.com')
      expect(value.storefrontUrl).toBe('https://prov-shop.example.com')
    })

    // The provision call hit the expected session endpoint.
    expect(fetchMock).toHaveBeenCalled()
    const calledUrl = String(fetchMock.mock.calls[0]![0])
    expect(calledUrl).toContain('/api/sessions/sess-123/medusa-config')
  })

  it('23. sanitizeOpenUIIntegrationConfig filters non-string and dangerous fields', () => {
    const raw: Record<string, unknown> = {
      backendUrl: '  https://api.example.com  ',
      storefrontUrl: 'https://shop.example.com',
      adminBaseUrl: 'https://admin.example.com',
      numericPort: 8080, // non-string -> dropped
      nested: { x: 1 }, // non-string -> dropped
      empty: null, // null -> dropped
      flag: true, // non-string -> dropped
      secret: 'kept-string', // string -> kept (sanitizer keeps all strings)
    }
    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        { medusa: { enabled: true, config: raw }, sessionId: null },
        React.createElement(MedusaProbe),
      ),
    )
    const value = readProbe(container)
    const config = value.config as Record<string, unknown>
    expect(config.backendUrl).toBe('https://api.example.com')
    expect(config.storefrontUrl).toBe('https://shop.example.com')
    expect(config.adminBaseUrl).toBe('https://admin.example.com')
    expect(config.secret).toBe('kept-string')
    expect(config.numericPort).toBeUndefined()
    expect(config.nested).toBeUndefined()
    expect(config.empty).toBeUndefined()
    expect(config.flag).toBeUndefined()
  })

  it('24. normalizeProvisionError surfaces a normalized error message from a failed provision', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: '  Medusa is down  ' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(
      React.createElement(
        OpenUIIntegrationProviders,
        {
          medusa: { enabled: true, config: {} },
          sessionId: 'sess-err',
        },
        React.createElement(MedusaProbe),
      ),
    )

    await waitFor(() => {
      const value = readProbe(container)
      expect(value.status).toBe('error')
      // The error string is trimmed and surfaced verbatim from the body.
      expect(value.error).toBe('Medusa is down')
    })
  })

  it('25. provisionMedusaIntegration converts malformed HTML provision output into an error result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!doctype html><h1>Proxy error</h1>', {
        headers: { 'content-type': 'text/html; charset=utf-8' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      provisionMedusaIntegration('sess-html', {
        backendUrl: 'https://api.example.com',
        storefrontUrl: 'https://shop.example.com',
      }),
    ).resolves.toMatchObject({
      backendUrl: 'https://api.example.com',
      storefrontUrl: 'https://shop.example.com',
      ready: false,
      status: 'error',
      error: 'Medusa config check failed',
    })
  })
})

// ─── Image search query ────────────────────────────────────────────────────

describe('image search query', () => {
  it('25. extractDomainHint pulls salient subject tokens from the prompt (restaurant/tech)', () => {
    const foodHint = extractDomainHint({
      prompt: 'a website for a cozy restaurant in the city',
    } as ImageContext)
    expect(foodHint).toContain('restaurant')
    expect(foodHint).not.toContain('website')

    const techHint = extractDomainHint({
      prompt: 'a modern tech startup landing page',
    } as ImageContext)
    expect(techHint).toContain('tech')
    expect(techHint).not.toContain('landing')
  })

  it('26. buildImageSearchQuery blends alt + context, domain-led, capped at 96 chars', () => {
    const ctx: ImageContext = {
      prompt: 'a website for a dental clinic in Mumbai',
      brandContext: 'BrightSmiles',
    }
    const query = buildImageSearchQuery(
      'friendly dentist working with a patient',
      'dentist patient',
      ctx,
    )
    expect(typeof query).toBe('string')
    expect(query.length).toBeLessThanOrEqual(96)
    // Domain leads the merged query.
    expect(query.split(' ')[0]).not.toBe('dentist')
    // Base/alt subject tokens are preserved within the cap.
    expect(query).toMatch(/dentist|patient|dental|brightsmiles/i)
  })

  it('27. avoids per-vertical regex — generic context-based hints for novel verticals', () => {
    // A vertical with no hardcoded branch (pottery) still yields its subject
    // token, proving the hint engine is generic, not an infinite special-case.
    const hint = extractDomainHint({
      prompt: 'a site for a pottery studio in Kyoto',
    } as ImageContext)
    expect(hint).toContain('pottery')
    expect(hint).toContain('kyoto')

    // With no context, the base query is returned unchanged (backward compat).
    expect(
      buildImageSearchQuery('hero image', 'abstract background', undefined),
    ).toBe('abstract background')
    expect(
      buildImageSearchQuery('hero image', 'abstract background', {
        section: 'hero',
      } as ImageContext),
    ).toBe('abstract background')
  })
})

// ─── Route context ─────────────────────────────────────────────────────────

describe('route context', () => {
  it('28. parseRouteTarget resolves "/about" into a page target', () => {
    expect(parseRouteTarget('/about')).toEqual({
      type: 'page',
      page: '/about',
    })
    // And resolveRouteTarget maps it onto a matching route.
    expect(resolveRouteTarget('/about', ['Home', '/about'], {})).toEqual({
      type: 'page',
      page: '/about',
    })
  })

  it('29. semantic CTA mapping resolves "Get started" to a meaningful route', () => {
    // No explicit targetMap entry; the shared semantic vocabulary maps
    // "get started" (contains "start") to a Contact-style route.
    const resolved = resolveRouteTarget('Get started', ['Home', 'Contact'], {})
    expect(resolved).not.toBeNull()
    expect(resolved!.type).toBe('page')
    expect(resolved!.page).toBe('Contact')
  })

  it('30. commerce mutation phrases are not treated as navigation', () => {
    // With no commerce route available, "Add ... to cart" / "Remove ... from
    // cart" must NOT resolve to a page — they are mutations, not navigation.
    expect(
      resolveRouteTarget('Add Hydrating Serum to cart', ['Home'], {}),
    ).toBe(null)
    expect(resolveRouteTarget('Remove item from cart', ['Home'], {})).toBe(null)
  })
})

// ─── Theme var key integrity ───────────────────────────────────────────────

describe('theme var key integrity', () => {
  it('31. all 32 core THEME_VAR_KEYS are present in the theme system (44 total, 32 core)', () => {
    // THEME_VAR_KEYS is the complete set of CSS custom properties the theme
    // runtime manages. The full set is 44; the 12 optional style tokens
    // (fonts, shadow matrix, letter-spacing, spacing, radius) are optional,
    // leaving 32 core design tokens every preset must define.
    expect(THEME_VAR_KEYS.length).toBe(44)
    expect(CORE_THEME_KEYS.length).toBe(32)

    // No duplicate keys in the managed set.
    expect(new Set(THEME_VAR_KEYS).size).toBe(THEME_VAR_KEYS.length)

    // Every optional key is accounted for in the full set.
    for (const key of OPTIONAL_STYLE_KEYS) {
      expect(THEME_VAR_KEYS).toContain(key)
    }

    // The 32 core keys are exactly the full set minus the 12 optional ones.
    expect(new Set(CORE_THEME_KEYS).size).toBe(32)
    for (const key of CORE_THEME_KEYS) {
      expect(OPTIONAL_STYLE_KEYS.has(key)).toBe(false)
    }
  })
})
