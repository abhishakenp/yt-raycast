import { describe, expect, it, vi } from 'vitest'

import { createInlineEditClientTools } from './inline-edit-client-tools'

describe('createInlineEditClientTools', () => {
  it('uses an imperative Convex client for style edits without React hooks', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 7 }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_tools',
      anonymousOwnerSecret: 'owner-secret',
      instruction: 'make hero green',
      sourceAnchor: 'hero',
    })

    const styleTool = tools.find((tool) => tool.name === 'styleApply')
    const result = await styleTool?.execute?.({
      targetScope: 'section',
      style: { backgroundColor: 'green', color: 'white' },
    })

    expect(result).toEqual({ saved: true, previewVersion: 7 })
    expect(mutation).toHaveBeenCalledTimes(1)
    const call = mutation.mock.calls[0] as unknown as [unknown, unknown]
    expect(call[1]).toMatchObject({
      sessionId: 'session_client_tools',
      anonymousOwnerSecret: 'owner-secret',
      editType: 'style',
      beforeText: 'hero',
      afterText: 'background-color: green; color: white',
      instruction: 'make hero green',
    })
  })

  it('uses the same shared textRewrite definition for client text edits', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 8 }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_text_tools',
      selectedText: 'Plain headline',
    })

    const textTool = tools.find((tool) => tool.name === 'textRewrite')
    await textTool?.execute?.({
      afterText: 'Dreamier headline',
    })

    expect(mutation).toHaveBeenCalledTimes(1)
    const call = mutation.mock.calls[0] as unknown as [unknown, unknown]
    expect(call[1]).toMatchObject({
      sessionId: 'session_client_text_tools',
      editType: 'text',
      beforeText: 'Plain headline',
      afterText: 'Dreamier headline',
      targetLabel: 'Plain headline',
    })
  })

  it('exposes image replace and image remove as imperative client tools', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 9 }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_image_tools',
      sourceAnchor: 'Hero image alt',
      occurrenceIndex: 0,
    })

    await tools
      .find((tool) => tool.name === 'imageReplace')
      ?.execute?.({
        src: 'https://images.pexels.com/photos/replacement.jpeg',
        alt: 'Replacement hero image',
      })
    await tools
      .find((tool) => tool.name === 'imageRemove')
      ?.execute?.({
        alt: 'Hero image alt',
      })

    const payloads = mutation.mock.calls.map(
      (call) => (call as unknown as [unknown, Record<string, unknown>])[1],
    )
    expect(payloads).toEqual([
      expect.objectContaining({
        sessionId: 'session_client_image_tools',
        editType: 'image',
        beforeText: 'Hero image alt',
        afterText: 'https://images.pexels.com/photos/replacement.jpeg',
        targetLabel: 'Replacement hero image',
        occurrenceIndex: 0,
      }),
      expect.objectContaining({
        sessionId: 'session_client_image_tools',
        editType: 'image',
        beforeText: 'Hero image alt',
        afterText: '',
        targetLabel: 'Hero image alt',
        occurrenceIndex: 0,
      }),
    ])
  })

  it('uses style mutations for section background image client tools', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 12 }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_background_tools',
      sourceAnchor: '[data-openui-var="home_hero"]',
    })

    await tools
      .find((tool) => tool.name === 'imageReplace')
      ?.execute?.({
        targetScope: 'section',
        src: 'https://images.pexels.com/photos/hero-bg.jpeg',
      })
    await tools
      .find((tool) => tool.name === 'imageRemove')
      ?.execute?.({
        targetScope: 'section',
      })

    const payloads = mutation.mock.calls.map(
      (call) => (call as unknown as [unknown, Record<string, unknown>])[1],
    )
    expect(payloads).toEqual([
      expect.objectContaining({
        sessionId: 'session_client_background_tools',
        editType: 'style',
        beforeText: '[data-openui-var="home_hero"]',
        afterText:
          'background-image: url("https://images.pexels.com/photos/hero-bg.jpeg"); background-size: cover; background-position: center',
      }),
      expect.objectContaining({
        sessionId: 'session_client_background_tools',
        editType: 'style',
        beforeText: '[data-openui-var="home_hero"]',
        afterText:
          'background-image: none; background-size: auto; background-position: 0% 0%',
      }),
    ])
  })

  it('resolves stock-image queries before client image replacement mutations', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 13 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: 'https://images.pexels.com/photos/resolved-image.jpeg',
      source: 'pexels' as const,
      query: 'resolved hero',
    }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_query_image_tools',
      sourceAnchor: 'Hero image alt',
      resolveStockImage,
    })

    await tools
      .find((tool) => tool.name === 'imageReplace')
      ?.execute?.({
        query: 'resolved hero',
        alt: 'Resolved hero',
        width: 900,
        height: 500,
      })

    expect(resolveStockImage).toHaveBeenCalledWith({
      query: 'resolved hero',
      alt: 'Resolved hero',
      w: 900,
      h: 500,
    })
    const call = mutation.mock.calls[0] as unknown as [
      unknown,
      Record<string, unknown>,
    ]
    expect(call[1]).toMatchObject({
      sessionId: 'session_client_query_image_tools',
      editType: 'image',
      beforeText: 'Hero image alt',
      afterText: 'https://images.pexels.com/photos/resolved-image.jpeg',
      targetLabel: 'Resolved hero',
    })
    expect(call[1].afterText).not.toBe('resolved hero')
  })

  it('resolves stock-image queries before client section background mutations', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 14 }))
    const resolveStockImage = vi.fn(async () => ({
      imageUrl: 'https://images.pexels.com/photos/resolved-section-bg.jpeg',
      source: 'pexels' as const,
      query: 'resolved section background',
    }))
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_query_background_tools',
      sourceAnchor: '[data-openui-var="home_hero"]',
      resolveStockImage,
    })

    await tools
      .find((tool) => tool.name === 'imageReplace')
      ?.execute?.({
        targetScope: 'section',
        query: 'resolved section background',
        alt: 'Resolved section background',
      })

    expect(resolveStockImage).toHaveBeenCalledWith({
      query: 'resolved section background',
      alt: 'Resolved section background',
      w: 800,
      h: 600,
    })
    const call = mutation.mock.calls[0] as unknown as [
      unknown,
      Record<string, unknown>,
    ]
    expect(call[1]).toMatchObject({
      sessionId: 'session_client_query_background_tools',
      editType: 'style',
      beforeText: '[data-openui-var="home_hero"]',
      afterText:
        'background-image: url("https://images.pexels.com/photos/resolved-section-bg.jpeg"); background-size: cover; background-position: center',
    })
    expect(call[1].afterText).not.toContain('resolved section background')
  })

  it('exposes link edits as imperative client tools', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 10 }))
    const currentSource = `links: [{ label: "Learn more", href: "/old" }]`
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_link_tools',
      selectedText: 'Learn more',
      linkHref: '/old',
      getSource: async () => currentSource,
    })

    await tools
      .find((tool) => tool.name === 'linkEdit')
      ?.execute?.({
        href: 'https://example.com/contact',
        label: 'Contact us',
        openInNewTab: true,
      })

    const call = mutation.mock.calls[0] as unknown as [
      unknown,
      Record<string, unknown>,
    ]
    expect(call[1]).toMatchObject({
      sessionId: 'session_client_link_tools',
      editType: 'ai_rewrite',
      beforeText: currentSource,
      targetLabel: 'link: /old -> https://example.com/contact',
    })
    expect(call[1].afterText).toContain('href: "https://example.com/contact"')
    expect(call[1].afterText).toContain('label: "Contact us"')
    expect(call[1].afterText).toContain('target: "_blank"')
    expect(call[1].afterHtml).toBe(call[1].afterText)
    expect(call[1].instruction).toBe(
      'replace link /old with https://example.com/contact',
    )
  })

  it('exposes delete, section move, and section rewrite as imperative client tools', async () => {
    const mutation = vi.fn(async () => ({ saved: true, previewVersion: 11 }))
    const currentSource = `home_hero = Hero({})
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_pricing = Pricing({})
home_pricing_anchor = SectionAnchor("home_pricing", home_pricing)
home = Stack([home_hero_anchor, home_pricing_anchor])`
    const tools = createInlineEditClientTools({
      convex: { mutation },
      sessionId: 'session_client_structural_tools',
      sourceAnchor: 'hero-card',
      instruction: 'make structural edits',
      getSource: async () => currentSource,
    })

    await tools
      .find((tool) => tool.name === 'elementDelete')
      ?.execute?.({
        occurrenceIndex: 2,
      })
    await tools
      .find((tool) => tool.name === 'sectionMove')
      ?.execute?.({
        varName: 'home_pricing',
        direction: 'up',
      })
    await tools
      .find((tool) => tool.name === 'sectionRewrite')
      ?.execute?.({
        replacementHtml: '<section>New hero</section>',
      })

    const payloads = mutation.mock.calls.map(
      (call) => (call as unknown as [unknown, Record<string, unknown>])[1],
    )
    expect(payloads).toEqual([
      expect.objectContaining({
        sessionId: 'session_client_structural_tools',
        editType: 'style',
        beforeText: 'hero-card',
        afterText: 'display: none',
        occurrenceIndex: 2,
      }),
      expect.objectContaining({
        sessionId: 'session_client_structural_tools',
        editType: 'ai_rewrite',
        beforeText: currentSource,
        targetLabel: 'reorder home_pricing up',
        afterHtml: expect.stringContaining(
          'Stack([home_pricing_anchor, home_hero_anchor])',
        ),
        afterText: expect.stringContaining(
          'Stack([home_pricing_anchor, home_hero_anchor])',
        ),
        instruction: 'reorder home_pricing up',
      }),
      expect.objectContaining({
        sessionId: 'session_client_structural_tools',
        replacementHtml: '<section>New hero</section>',
        instruction: 'make structural edits',
      }),
    ])
  })
})
