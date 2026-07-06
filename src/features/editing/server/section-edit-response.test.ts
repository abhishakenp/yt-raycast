import { describe, expect, it, vi } from 'vitest'

import {
  createSectionEditResponse,
  patchOpenUiSourceWithAiCapsule,
} from './section-edit-response'

type MutationCallPayload = Record<string, unknown>
type InlineEditGenerateWithToolsMock = ReturnType<typeof vi.fn>

const generateWithCodeModeProgram = (typescriptCode: string) =>
  vi.fn(
    async (
      _model,
      _system,
      _user,
      tools: Array<{
        name: string
        execute?: (input: { typescriptCode: string }) => Promise<unknown>
      }>,
    ) => {
      const codeModeTool = tools.find(
        (tool) => tool.name === 'execute_typescript',
      )
      if (!codeModeTool?.execute) throw new Error('execute_typescript missing')
      return codeModeTool.execute({ typescriptCode })
    },
  )

const expectOnlyCodeModeTool = (
  generateWithTools: InlineEditGenerateWithToolsMock,
) => {
  const tools = (
    generateWithTools.mock.calls as unknown as Array<
      [
        string,
        string,
        string,
        Array<{ name: string; execute?: unknown; inputSchema?: unknown }>,
      ]
    >
  )[0][3]
  expect(tools.map((tool) => tool.name)).toEqual(['execute_typescript'])
  expect(typeof tools[0]?.execute).toBe('function')
}

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
    const source = 'hero = Card({ child: Card({}) })'
    expect(
      patchOpenUiSourceWithAiCapsule(source, 'Card', 'AICustom_Card_abc'),
    ).toBe('hero = AICustom_Card_abc({ child: AICustom_Card_abc({}) })')
  })

  it('does not modify source when capsule name is not found', () => {
    const source = 'hero = Hero({})'
    expect(
      patchOpenUiSourceWithAiCapsule(source, 'Pricing', 'AICustom_Pricing'),
    ).toBe(source)
  })
})

describe('createSectionEditResponse', () => {
  it('returns a stable public error when the generation view lookup fails', async () => {
    const response = await createSectionEditResponse(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
      new Request(
        'https://ship-fast.test/api/sessions/k574ms14ma9f94keq30r7dq24x89n1k2/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make the hero more premium',
            selection: {
              elementPath: 'main h1',
              tag: 'h1',
              textContent: 'Craft Beer Brewery',
              outerHTML: '<h1>Craft Beer Brewery</h1>',
              boundingBox: { x: 0, y: 0, width: 200, height: 80 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => {
            throw new Error('ConvexError: sensitive details')
          },
          mutation: async () => {
            throw new Error('not reached')
          },
        },
      },
    )

    const body = await response.json()
    expect(response.status).toBe(503)
    expect(body).toEqual({ error: 'Unable to edit section.' })
    expect(JSON.stringify(body)).not.toContain('ConvexError')
    expect(JSON.stringify(body)).not.toContain('Craft Beer Brewery')
  })

  it('executes compound AI Code Mode edits through canonical inline edit tools', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ saved: true, previewVersion: 34 })
      .mockResolvedValueOnce({ saved: true, previewVersion: 35 })
    const generateWithTools = generateWithCodeModeProgram(`
      await external_styleApply({
        sourceAnchor: 'hero-title',
        style: { fontSize: 32, fontWeight: 700, color: '#2563eb' },
        occurrenceIndex: 0
      })
      await external_textRewrite({
        beforeText: 'Plain headline',
        afterText: 'Dreamier headline',
        occurrenceIndex: 0
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_compound',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_compound/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'make text larger and more dreamy',
            selection: {
              elementPath: 'main h1',
              tag: 'h1',
              textContent: 'Plain headline',
              outerHTML: '<h1 class="hero-title">Plain headline</h1>',
              boundingBox: { x: 0, y: 0, width: 400, height: 80 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                '<html><body><main><h1 class="hero-title">Plain headline</h1></main></body></html>',
            },
            latestPreview: {
              html: '<html><body><main><h1 class="hero-title">Plain headline</h1></main></body></html>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payloads = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    ).map((call) => call[1])

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 2,
      previewVersion: 35,
    })
    expectOnlyCodeModeTool(generateWithTools)
    expect(payloads).toEqual([
      expect.objectContaining({
        sessionId: 'session_code_mode_compound',
        anonymousOwnerSecret: 'owner-secret',
        editType: 'style',
        beforeText: 'hero-title',
        afterText: 'font-size: 32px; font-weight: 700; color: #2563eb',
        occurrenceIndex: 0,
      }),
      expect.objectContaining({
        sessionId: 'session_code_mode_compound',
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        beforeText: 'Plain headline',
        afterText: 'Dreamier headline',
        occurrenceIndex: 0,
      }),
    ])
  })

  it('uses a tool-only Code Mode prompt for OpenUI component selections before capsule fallback', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 52 }))
    const generate = vi.fn(async () => {
      throw new Error('fallback capsule generation should not run')
    })
    const generateWithTools = vi.fn(
      async (
        _model,
        system: string,
        _user,
        tools: Array<{
          name: string
          execute?: (input: { typescriptCode: string }) => Promise<unknown>
        }>,
      ) => {
        if (
          system.includes('Return the complete TSX module') ||
          !system.includes('For visual styling requests, call styleApply')
        ) {
          return { text: 'no tool calls', toolCalls: [] }
        }
        const codeModeTool = tools.find(
          (tool) => tool.name === 'execute_typescript',
        )
        if (!codeModeTool?.execute)
          throw new Error('execute_typescript missing')
        return codeModeTool.execute({
          typescriptCode: `
            await external_styleApply({
              sourceAnchor: 'inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90',
              style: { backgroundColor: 'yellow', borderRadius: 4 },
              occurrenceIndex: 0
            })
            return { ok: true }
          `,
        })
      },
    )

    const response = await createSectionEditResponse(
      'session_openui_component_tool_first',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_component_tool_first/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'make this button yellow and more rectangular',
            selection: {
              tag: 'button',
              elementPath: 'div#home_hero button:nth-of-type(1)',
              textContent: 'Get a Free Quote',
              outerHTML:
                '<button type="button" class="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90">Get a Free Quote</button>',
              boundingBox: { x: 49, y: 599.75, width: 216.7, height: 50 },
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiComponent: 'MarketingAgencyHero',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = MarketingAgencyHero({})\npage = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main><div id="home_hero"><button class="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90">Get a Free Quote</button></div></main>',
            },
          }),
          mutation,
        },
        generate,
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 1,
      previewVersion: 52,
    })
    expect(generate).not.toHaveBeenCalled()
    expect(payload).toMatchObject({
      editType: 'style',
      afterText: 'background-color: yellow; border-radius: 4px',
      occurrenceIndex: 0,
    })
  })

  it('treats edited HTML fragment sessions as HTML when Code Mode has no matching tool edit', async () => {
    const fragment =
      '<h1 class="hero-title">Dreamy Pastel Whisper of Stars</h1>'
    const replacementHtml =
      '<!doctype html><html><body><h1 class="hero-title">Dreamier Pastel Whisper of Stars</h1></body></html>'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 46 }))
    const generateWithTools = vi.fn(async () => ({
      text: 'no tool calls',
      toolCalls: [],
    }))
    const generate = vi.fn(async () => replacementHtml)

    const response = await createSectionEditResponse(
      'session_html_fragment_section_edit',
      new Request(
        'https://ship-fast.test/api/sessions/session_html_fragment_section_edit/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'rewrite the whole tiny section',
            selection: {
              elementPath: 'h1.hero-title',
              tag: 'h1',
              textContent: 'Dreamy Pastel Whisper of Stars',
              outerHTML: fragment,
              boundingBox: { x: 40, y: 120, width: 520, height: 80 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: fragment,
            },
            latestPreview: {
              html: fragment,
            },
          }),
          mutation,
        },
        generate,
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0]?.[1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({ mode: 'html', previewVersion: 46 })
    expect(generateWithTools).toHaveBeenCalledTimes(1)
    expect(generate).toHaveBeenCalledTimes(1)
    expect(payload).toMatchObject({
      sessionId: 'session_html_fragment_section_edit',
      replacementHtml,
      instruction: 'rewrite the whole tiny section',
    })
  })

  it('uses Code Mode imageReplace for OpenUI component image selections before capsule fallback', async () => {
    const resolvedImageUrl =
      'https://images.pexels.com/photos/424242/pexels-photo-424242.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 53 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: resolvedImageUrl,
      source: 'pexels' as const,
      query: 'premium product showcase',
    }))
    const generate = vi.fn(async () => {
      throw new Error('fallback capsule generation should not run')
    })
    const generateWithTools = vi.fn(
      async (
        _model,
        system: string,
        _user,
        tools: Array<{
          name: string
          execute?: (input: { typescriptCode: string }) => Promise<unknown>
        }>,
      ) => {
        if (!system.includes('image')) {
          return { text: 'no image tool guidance', toolCalls: [] }
        }
        const codeModeTool = tools.find(
          (tool) => tool.name === 'execute_typescript',
        )
        if (!codeModeTool?.execute)
          throw new Error('execute_typescript missing')
        return codeModeTool.execute({
          typescriptCode: `
            await external_imageReplace({
              query: 'premium product showcase',
              alt: 'Premium product showcase',
              width: 900,
              height: 500,
              occurrenceIndex: 0
            })
            return { ok: true }
          `,
        })
      },
    )

    const response = await createSectionEditResponse(
      'session_openui_component_image_tool_first',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_component_image_tool_first/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'replace this image with a premium product showcase',
            selection: {
              tag: 'img',
              elementPath: 'div#home_hero img:nth-of-type(1)',
              textContent: '',
              outerHTML:
                '<img alt="Current product hero" src="/api/pexels?query=old+hero&w=900&h=500" />',
              boundingBox: { x: 49, y: 180, width: 900, height: 500 },
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiComponent: 'MarketingAgencyHero',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = MarketingAgencyHero({ imageAlt: "Current product hero" })\npage = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main><div data-openui-var="home_hero"><img alt="Current product hero" src="/api/pexels?query=old+hero&w=900&h=500" /></div></main>',
            },
          }),
          mutation,
        },
        generate,
        generateWithTools,
        resolveStockImage,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 1,
      previewVersion: 53,
    })
    expect(generate).not.toHaveBeenCalled()
    expect(resolveStockImage).toHaveBeenCalledWith({
      query: 'premium product showcase',
      alt: 'Premium product showcase',
      w: 900,
      h: 500,
    })
    expect(payload).toMatchObject({
      sessionId: 'session_openui_component_image_tool_first',
      anonymousOwnerSecret: 'owner-secret',
      editType: 'image',
      beforeText: 'Current product hero',
      afterText: resolvedImageUrl,
      targetLabel: 'Premium product showcase',
      occurrenceIndex: 0,
    })
    expect(payload.afterText).not.toContain('/api/pexels')
    expect(payload.afterText).not.toContain('picsum.photos')
  })

  it('anchors AI style edits to the selected OpenUI element when the model omits sourceAnchor', async () => {
    const buttonClass =
      'inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 53 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_styleApply({
        style: { backgroundColor: 'yellow', borderRadius: 4 },
        occurrenceIndex: 0
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_selected_element_anchor',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_selected_element_anchor/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'make this button yellow and more rectangular',
            selection: {
              tag: 'button',
              elementPath: 'div#home_hero button:nth-of-type(1)',
              textContent: 'Get a Free Quote',
              outerHTML: `<button type="button" class="${buttonClass}">Get a Free Quote</button>`,
              boundingBox: { x: 49, y: 599.75, width: 216.7, height: 50 },
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiComponent: 'MarketingAgencyHero',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = MarketingAgencyHero({})\npage = Stack([home_hero])',
            },
            latestPreview: {
              html: `<main><div data-openui-var="home_hero"><button class="${buttonClass}">Get a Free Quote</button></div></main>`,
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: buttonClass,
      targetLabel: buttonClass,
      afterText: 'background-color: yellow; border-radius: 4px',
      occurrenceIndex: 0,
    })
    expect(payload.beforeText).not.toBe('home_hero')
  })

  it('normalizes generic AI style anchors to the selected OpenUI element', async () => {
    const buttonClass =
      'inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 54 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_styleApply({
        sourceAnchor: 'button',
        style: { backgroundColor: '#FFD700', borderRadius: 4 },
        occurrenceIndex: 0
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_generic_style_anchor',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_generic_style_anchor/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make this button yellow and more rectangular',
            selection: {
              tag: 'button',
              elementPath: 'div#home_hero button:nth-of-type(1)',
              textContent: 'Get a Free Quote',
              outerHTML: `<button type="button" class="${buttonClass}">Get a Free Quote</button>`,
              boundingBox: { x: 49, y: 599.75, width: 216.7, height: 50 },
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiComponent: 'MarketingAgencyHero',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = MarketingAgencyHero({})\npage = Stack([home_hero])',
            },
            latestPreview: {
              html: `<main><div data-openui-var="home_hero"><button class="${buttonClass}">Get a Free Quote</button></div></main>`,
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: buttonClass,
      targetLabel: buttonClass,
      afterText: 'background-color: #FFD700; border-radius: 4px',
      occurrenceIndex: 0,
    })
    expect(payload.beforeText).not.toBe('button')
  })

  it('applies AI section-scoped styles to the section anchor instead of the selected child', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 55 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_styleApply({
        targetScope: 'section',
        style: { backgroundColor: '#123456', color: 'white' }
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_section_style_scope',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_section_style_scope/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make this whole section dark',
            selection: {
              tag: 'button',
              elementPath: 'div#home_hero button:nth-of-type(1)',
              textContent: 'Get a Free Quote',
              outerHTML: '<button class="hero-cta">Get a Free Quote</button>',
              boundingBox: { x: 49, y: 599.75, width: 216.7, height: 50 },
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = Hero({ cta: "Get a Free Quote" })\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main><section data-openui-var="home_hero"><button class="hero-cta">Get a Free Quote</button></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-openui-var="home_hero"]',
      targetLabel: '[data-openui-var="home_hero"]',
      afterText: 'background-color: #123456; color: white',
    })
    expect(payload.beforeText).not.toBe('hero-cta')
  })

  it('applies AI section-scoped deletion to the section anchor instead of the selected child', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 56 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_elementDelete({
        targetScope: 'section'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_section_delete_scope',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_section_delete_scope/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'delete this whole section',
            selection: {
              tag: 'h2',
              elementPath: 'div#home_pricing h2:nth-of-type(1)',
              textContent: 'Pricing',
              outerHTML: '<h2 class="pricing-title">Pricing</h2>',
              boundingBox: { x: 49, y: 599.75, width: 216.7, height: 50 },
              sectionAnchor: '[data-openui-var="home_pricing"]',
              openuiVar: 'home_pricing',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_pricing = Pricing({ title: "Pricing" })\nroot = Stack([home_pricing])',
            },
            latestPreview: {
              html: '<main><section data-openui-var="home_pricing"><h2 class="pricing-title">Pricing</h2></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-openui-var="home_pricing"]',
      targetLabel: '[data-openui-var="home_pricing"]',
      afterText: 'display: none',
    })
    expect(payload.beforeText).not.toBe('pricing-title')
  })

  it('applies AI page-scoped styles to the page anchor when the selected child has page metadata', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 57 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_styleApply({
        targetScope: 'page',
        style: {
          backgroundImage: 'linear-gradient(135deg, #0f172a, #22d3ee)',
          color: 'white'
        }
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_page_style_scope',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_page_style_scope/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make the whole page background a cool gradient',
            selection: {
              tag: 'h1',
              elementPath: 'main section h1',
              textContent: 'Gallery',
              outerHTML: '<h1 class="hero-title">Gallery</h1>',
              boundingBox: { x: 48, y: 80, width: 420, height: 72 },
              pageLabel: 'Home',
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = Hero({ title: "Gallery" })\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main data-sf-export-page="Home"><section data-openui-var="home_hero"><h1 class="hero-title">Gallery</h1></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-sf-export-page="Home"]',
      targetLabel: '[data-sf-export-page="Home"]',
      afterText:
        'background-image: linear-gradient(135deg, #0f172a, #22d3ee); color: white',
    })
    expect(payload.beforeText).not.toBe('[data-openui-var="home_hero"]')
    expect(payload.beforeText).not.toBe('hero-title')
  })

  it('applies AI page-scoped deletion to the page anchor instead of the selected section', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 58 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_elementDelete({
        targetScope: 'page'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_openui_page_delete_scope',
      new Request(
        'https://ship-fast.test/api/sessions/session_openui_page_delete_scope/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'hide the whole page',
            selection: {
              tag: 'p',
              elementPath: 'main section p',
              textContent: 'Intro copy',
              outerHTML: '<p class="hero-copy">Intro copy</p>',
              boundingBox: { x: 48, y: 180, width: 420, height: 30 },
              pageLabel: 'Home',
              sectionAnchor: '#hero_section',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = Hero({ copy: "Intro copy" })\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main data-sf-export-page="Home"><section id="hero_section"><p class="hero-copy">Intro copy</p></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-sf-export-page="Home"]',
      targetLabel: '[data-sf-export-page="Home"]',
      afterText: 'display: none',
    })
    expect(payload.beforeText).not.toBe('#hero_section')
    expect(payload.beforeText).not.toBe('hero-copy')
  })

  it('resolves AI stock-image queries before persisting image replacement commands', async () => {
    const currentSrc = '/api/pexels?query=glass+display&w=800&h=600'
    const resolvedImageUrl =
      'https://images.pexels.com/photos/8865217/pexels-photo-8865217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 26 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: resolvedImageUrl,
      source: 'pexels' as const,
      query: 'luxury glass display detail',
    }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_imageReplace({
        sourceAnchor: 'Glass display',
        query: 'luxury glass display detail',
        alt: 'Glass display',
        width: 800,
        height: 600,
        occurrenceIndex: 0
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_stock_image',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_stock_image/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'replace this image with a better glass display photo',
            selection: {
              elementPath: 'main img',
              tag: 'img',
              textContent: '',
              outerHTML: `<img alt="Glass display" src="${currentSrc}" />`,
              boundingBox: { x: 0, y: 0, width: 800, height: 600 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: `<html><body><main><img alt="Glass display" src="${currentSrc}" /></main></body></html>`,
            },
            latestPreview: {
              html: `<html><body><main><img alt="Glass display" src="${currentSrc}" /></main></body></html>`,
            },
          }),
          mutation,
        },
        generateWithTools,
        resolveStockImage,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 1,
      previewVersion: 26,
    })
    expect(resolveStockImage).toHaveBeenCalledWith({
      query: 'luxury glass display detail',
      alt: 'Glass display',
      w: 800,
      h: 600,
    })
    expect(payload).toMatchObject({
      editType: 'image',
      beforeText: 'Glass display',
      afterText: resolvedImageUrl,
      occurrenceIndex: 0,
    })
    expect(payload.afterText).not.toContain('/api/pexels')
    expect(payload.afterText).not.toContain('picsum.photos')
  })

  it('applies AI section-scoped image replacement as a background style on the section anchor', async () => {
    const resolvedImageUrl =
      'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 27 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: resolvedImageUrl,
      source: 'pexels' as const,
      query: 'editorial ceramic studio',
    }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_imageReplace({
        targetScope: 'section',
        query: 'editorial ceramic studio',
        alt: 'Editorial ceramic studio'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_section_background_image',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_section_background_image/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'make this whole section use a ceramic studio image',
            selection: {
              elementPath: 'main section h2',
              tag: 'h2',
              textContent: 'Workshops',
              outerHTML: '<h2 class="section-title">Workshops</h2>',
              boundingBox: { x: 48, y: 120, width: 320, height: 54 },
              sectionAnchor: '[data-openui-var="home_workshops"]',
              openuiVar: 'home_workshops',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_workshops = Workshops({ title: "Workshops" })\nroot = Stack([home_workshops])',
            },
            latestPreview: {
              html: '<main><section data-openui-var="home_workshops"><h2 class="section-title">Workshops</h2></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
        resolveStockImage,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(resolveStockImage).toHaveBeenCalledWith({
      query: 'editorial ceramic studio',
      alt: 'Editorial ceramic studio',
      w: 1200,
      h: 600,
    })
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-openui-var="home_workshops"]',
      targetLabel: '[data-openui-var="home_workshops"]',
      afterText: expect.stringContaining(
        `background-image: url("${resolvedImageUrl}")`,
      ),
    })
    expect(payload.afterText).toContain('background-size: cover')
    expect(payload.afterText).toContain('background-position: center')
    expect(payload.afterText).not.toContain('/api/pexels')
    expect(payload.afterText).not.toContain('picsum.photos')
  })

  it('routes a default element-scoped imageReplace to a background style when the selected element is a <div>, not an <img> (regression: routing was keyed on targetScope alone)', async () => {
    const resolvedImageUrl =
      'https://images.pexels.com/photos/999/pexels-photo-999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 30 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: resolvedImageUrl,
      source: 'pexels' as const,
      query: 'moody forest backdrop',
    }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_imageReplace({
        query: 'moody forest backdrop',
        alt: 'Moody forest backdrop'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_div_background_not_img_swap',
      new Request(
        'https://ship-fast.test/api/sessions/session_div_background_not_img_swap/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'give this section a forest background',
            selection: {
              elementPath: 'main section div',
              tag: 'div',
              textContent: '',
              outerHTML: '<div class="hero-panel"></div>',
              boundingBox: { x: 0, y: 0, width: 800, height: 400 },
              sectionAnchor: '.hero-panel',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: 'home_hero = Hero({})\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main><section><div class="hero-panel"></div></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
        resolveStockImage,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      afterText: expect.stringContaining(
        `background-image: url("${resolvedImageUrl}")`,
      ),
    })
  })

  it('applies AI page-scoped image replacement as a background style on the page anchor', async () => {
    const resolvedImageUrl =
      'https://images.pexels.com/photos/7654321/pexels-photo-7654321.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 28 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: resolvedImageUrl,
      source: 'pexels' as const,
      query: 'minimal gallery wall',
    }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_imageReplace({
        targetScope: 'page',
        query: 'minimal gallery wall',
        alt: 'Minimal gallery wall'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_page_background_image',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_page_background_image/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction:
              'make the whole page background a minimal gallery wall',
            selection: {
              elementPath: 'main section h1',
              tag: 'h1',
              textContent: 'Gallery',
              outerHTML: '<h1 class="hero-title">Gallery</h1>',
              boundingBox: { x: 48, y: 80, width: 420, height: 72 },
              pageLabel: 'Home',
              sectionAnchor: '[data-openui-var="home_hero"]',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_hero = Hero({ title: "Gallery" })\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main data-sf-export-page="Home"><section data-openui-var="home_hero"><h1 class="hero-title">Gallery</h1></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
        resolveStockImage,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '[data-sf-export-page="Home"]',
      targetLabel: '[data-sf-export-page="Home"]',
      afterText: expect.stringContaining(
        `background-image: url("${resolvedImageUrl}")`,
      ),
    })
    expect(payload.beforeText).not.toBe('[data-openui-var="home_hero"]')
  })

  it('applies AI section-scoped image removal as a durable background-image override', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 29 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_imageRemove({
        targetScope: 'section'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_section_background_remove',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_section_background_remove/section-edit',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: 'remove the background image from this section',
            selection: {
              elementPath: 'main section p',
              tag: 'p',
              textContent: 'Featured work',
              outerHTML: '<p class="eyebrow">Featured work</p>',
              boundingBox: { x: 48, y: 120, width: 260, height: 32 },
              sectionAnchor: '#portfolio_hero',
              openuiVar: 'home_portfolio',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                'home_portfolio = PortfolioHero({ eyebrow: "Featured work" })\nroot = Stack([home_portfolio])',
            },
            latestPreview: {
              html: '<main><section id="portfolio_hero"><p class="eyebrow">Featured work</p></section></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(payload).toMatchObject({
      editType: 'style',
      beforeText: '#portfolio_hero',
      targetLabel: '#portfolio_hero',
      afterText:
        'background-image: none; background-size: auto; background-position: 0% 0%',
    })
    expect(payload.afterText).not.toBe('')
    expect(payload.beforeText).not.toBe('eyebrow')
  })

  it('executes non-style inline edit tools through AI Code Mode', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ saved: true, previewVersion: 61 })
      .mockResolvedValueOnce({ saved: true, previewVersion: 62 })
      .mockResolvedValueOnce({ saved: true, previewVersion: 63 })
      .mockResolvedValueOnce({ saved: true, previewVersion: 64 })
    const openUiSource = `home_hero = Hero({})
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_nav = Nav({ links: [{ label: "Learn more", href: "/old" }] })
home_nav_anchor = SectionAnchor("home_nav", home_nav)
home_pricing = Pricing({})
home_pricing_anchor = SectionAnchor("home_pricing", home_pricing)
home = Stack([home_hero_anchor, home_nav_anchor, home_pricing_anchor])`
    const generateWithTools = generateWithCodeModeProgram(`
      await external_linkEdit({
        href: 'https://example.com/pricing',
        label: 'See pricing',
        openInNewTab: true,
        noindex: true,
        occurrenceIndex: 0
      })
      await external_elementDelete({
        sourceAnchor: 'old-badge',
        occurrenceIndex: 1
      })
      await external_imageRemove({
        sourceAnchor: 'Legacy hero image',
        alt: 'Legacy hero image',
        occurrenceIndex: 0
      })
      await external_sectionMove({
        varName: 'home_pricing',
        direction: 'up'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_code_mode_all_inline_tools',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_all_inline_tools/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction:
              'update link, hide the old badge, remove legacy image, move pricing up',
            selection: {
              elementPath: 'main a.cta-link',
              tag: 'a',
              textContent: 'Learn more',
              outerHTML: '<a class="cta-link" href="/old">Learn more</a>',
              boundingBox: { x: 0, y: 0, width: 120, height: 40 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: openUiSource,
            },
            latestPreview: {
              html: '<main><a class="cta-link" href="/old">Learn more</a><span class="old-badge">Old</span><img alt="Legacy hero image" src="/legacy.jpg" /></main>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payloads = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    ).map((call) => call[1])

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 4,
      previewVersion: 64,
    })
    expect(payloads).toEqual([
      expect.objectContaining({
        editType: 'ai_rewrite',
        beforeText: openUiSource,
        afterText: expect.stringContaining(
          'href: "https://example.com/pricing"',
        ),
        afterHtml: expect.stringContaining(
          'href: "https://example.com/pricing"',
        ),
        targetLabel: 'link: /old -> https://example.com/pricing',
        occurrenceIndex: 0,
      }),
      expect.objectContaining({
        editType: 'style',
        beforeText: 'old-badge',
        afterText: 'display: none',
        occurrenceIndex: 1,
      }),
      expect.objectContaining({
        editType: 'image',
        beforeText: 'Legacy hero image',
        afterText: '',
        targetLabel: 'Legacy hero image',
        occurrenceIndex: 0,
      }),
      expect.objectContaining({
        editType: 'ai_rewrite',
        targetLabel: 'reorder home_pricing up',
        afterHtml: expect.stringContaining(
          'Stack([home_hero_anchor, home_pricing_anchor, home_nav_anchor])',
        ),
        instruction: 'reorder home_pricing up',
      }),
    ])
    expect(String(payloads[3].afterHtml)).toContain(
      'href: "https://example.com/pricing"',
    )
    expect(payloads[0].instruction).toBe(
      'replace link /old with https://example.com/pricing',
    )
  })

  it('executes sectionRewrite through AI Code Mode when the model needs to rebuild the selected section', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 99 }))
    const generateWithTools = vi.fn(
      async (
        _model,
        system: string,
        _user,
        tools: Array<{
          name: string
          execute?: (input: { typescriptCode: string }) => Promise<unknown>
        }>,
      ) => {
        if (!system.includes('section rewrite operations')) {
          return { text: 'no rewrite tool guidance', toolCalls: [] }
        }
        const codeModeTool = tools.find(
          (tool) => tool.name === 'execute_typescript',
        )
        if (!codeModeTool?.execute)
          throw new Error('execute_typescript missing')
        return codeModeTool.execute({
          typescriptCode: `
            await external_sectionRewrite({
              replacementOpenUiSource: 'home_hero = Hero({ title: "Sharper hero" })'
            })
            return { ok: true }
          `,
        })
      },
    )

    const response = await createSectionEditResponse(
      'session_code_mode_rewrite_rejected',
      new Request(
        'https://ship-fast.test/api/sessions/session_code_mode_rewrite_rejected/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'rebuild the section',
            selection: {
              elementPath: 'main section',
              tag: 'section',
              textContent: 'Hero',
              outerHTML: '<section class="hero">Hero</section>',
              boundingBox: { x: 0, y: 0, width: 800, height: 400 },
              openuiComponent: 'Hero',
              openuiVar: 'home_hero',
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source:
                '<html><body><main><section class="hero">Hero</section></main></body></html>',
            },
            latestPreview: {
              html: '<html><body><main><section class="hero">Hero</section></main></body></html>',
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]

    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({
      mode: 'tools',
      applied: 1,
      previewVersion: 99,
    })
    expect(payload).toMatchObject({
      sessionId: 'session_code_mode_rewrite_rejected',
      anonymousOwnerSecret: 'owner-secret',
      replacementOpenUiSource: 'home_hero = Hero({ title: "Sharper hero" })',
      // Anchored to the selected OpenUI variable — see regression coverage in
      // inline-edit-commands.test.ts and session_section_edit_helpers.test.ts
      // for why an unanchored replacementOpenUiSource is unsafe.
      sectionVarName: 'home_hero',
      instruction: 'rebuild the section',
    })
  })

  it('anchors a sectionRewrite HTML fragment to the selected section so it splices instead of replacing the whole page (regression)', async () => {
    const fullDocument =
      '<html><body><nav>Site Nav</nav><main><section class="hero">Hero</section></main><footer>Site Footer</footer></body></html>'
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 41 }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_sectionRewrite({
        replacementHtml: '<section class="hero">Sharper Hero</section>'
      })
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_html_section_rewrite',
      new Request(
        'https://ship-fast.test/api/sessions/session_html_section_rewrite/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'make the hero punchier',
            selection: {
              elementPath: 'main section',
              tag: 'section',
              textContent: 'Hero',
              outerHTML: '<section class="hero">Hero</section>',
              boundingBox: { x: 0, y: 0, width: 800, height: 400 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: { source: fullDocument },
            latestPreview: { html: fullDocument },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    expect(response.ok, JSON.stringify(body)).toBe(true)

    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]
    expect(payload).toMatchObject({
      sessionId: 'session_html_section_rewrite',
      replacementHtml: '<section class="hero">Sharper Hero</section>',
      beforeHtml: '<section class="hero">Hero</section>',
    })
  })

  it('executes undoLastEdit through AI Code Mode, restoring the version immediately before the current one (feature: AI-invokable undo, previously manual-only)', async () => {
    const mutation = vi.fn(async () => ({
      sessionId: 'session_ai_undo',
      previewVersion: 9,
      saved: true,
    }))
    const generateWithTools = generateWithCodeModeProgram(`
      await external_undoLastEdit({})
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_ai_undo',
      new Request(
        'https://ship-fast.test/api/sessions/session_ai_undo/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'undo that last change',
            selection: {
              elementPath: 'main section h1',
              tag: 'h1',
              textContent: 'Headline',
              outerHTML: '<h1>Headline</h1>',
              boundingBox: { x: 0, y: 0, width: 400, height: 60 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: 'home_hero = Hero({})\nroot = Stack([home_hero])',
            },
            latestPreview: {
              html: '<main><h1>Headline</h1></main>',
              version: 10,
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({ mode: 'tools', applied: 1 })

    const payload = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    )[0][1]
    expect(payload).toEqual({
      sessionId: 'session_ai_undo',
      anonymousOwnerSecret: 'owner-secret',
      version: 9,
    })
  })

  it('computes undoLastEdit against the version produced by an EARLIER tool call in the same code-mode session, not the stale version read at session start (regression: currentPreviewVersion was captured once and never updated, unlike workingSource)', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({
        sessionId: 'session_ai_undo_chained',
        previewVersion: 11,
        saved: true,
      })
      .mockResolvedValueOnce({
        sessionId: 'session_ai_undo_chained',
        previewVersion: 12,
        saved: true,
      })
    const generateWithTools = generateWithCodeModeProgram(`
      await external_textRewrite({ afterText: 'New headline' })
      await external_undoLastEdit({})
      return { ok: true }
    `)

    const response = await createSectionEditResponse(
      'session_ai_undo_chained',
      new Request(
        'https://ship-fast.test/api/sessions/session_ai_undo_chained/section-edit',
        {
          method: 'POST',
          headers: { 'x-anonymous-owner-secret': 'owner-secret' },
          body: JSON.stringify({
            instruction: 'change the headline then undo it',
            selection: {
              elementPath: 'main section h1',
              tag: 'h1',
              textContent: 'Headline',
              outerHTML: '<h1>Headline</h1>',
              boundingBox: { x: 0, y: 0, width: 400, height: 60 },
            },
          }),
        },
      ),
      {
        client: {
          query: async () => ({
            homeModule: {
              source: 'home_hero = Hero({})\nroot = Stack([home_hero])',
            },
            // Session starts at v10 — the session-start value that must NOT
            // be used for the undo call after textRewrite bumps it to v11.
            latestPreview: {
              html: '<main><h1>Headline</h1></main>',
              version: 10,
            },
          }),
          mutation,
        },
        generateWithTools,
      },
    )

    const body = await response.json()
    expect(response.ok, JSON.stringify(body)).toBe(true)
    expect(body).toMatchObject({ mode: 'tools', applied: 2 })

    const payloads = (
      mutation.mock.calls as unknown as Array<[unknown, MutationCallPayload]>
    ).map((call) => call[1])
    // textRewrite ran against v10 and produced v11; undoLastEdit must target
    // v11-1=10 (undoing the textRewrite it just ran alongside), not
    // v10-1=9 (which would also wipe out whatever produced v10).
    expect(payloads[1]).toMatchObject({ version: 10 })
  })
})
