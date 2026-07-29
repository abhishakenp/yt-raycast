import { describe, expect, it, vi } from 'vitest'

import {
  buildElementDeleteCommand,
  buildImageRemoveCommand,
  buildImageReplaceCommand,
  buildLinkEditCommand,
  buildSectionMoveCommand,
  buildSectionRewriteCommand,
  buildStyleApplyCommand,
  buildTextRewriteCommand,
  buildUndoCommand,
  serializeInlineStyle,
} from './inline-edit-commands'

describe('inline edit persistence commands', () => {
  it('serializes AI object styles to the same CSS declaration shape manual edits persist', () => {
    expect(serializeInlineStyle({ fontSize: 32, fontWeight: 700 })).toBe(
      'font-size: 32px; font-weight: 700',
    )
    expect(
      serializeInlineStyle({
        backgroundImage: 'https://images.pexels.com/photos/1/photo.jpeg',
      }),
    ).toBe(
      'background-image: url("https://images.pexels.com/photos/1/photo.jpeg")',
    )
  })

  it('does not wrap CSS keyword values in url() when clearing a background via the object-style form (regression)', () => {
    // An AI naturally clearing a background via the object-map form (rather
    // than buildImageRemoveCommand's raw-string 'background-image: none')
    // must not persist the broken `url("none")`.
    expect(serializeInlineStyle({ backgroundImage: 'none' })).toBe(
      'background-image: none',
    )
    expect(serializeInlineStyle({ backgroundImage: 'inherit' })).toBe(
      'background-image: inherit',
    )
    expect(serializeInlineStyle({ backgroundImage: 'initial' })).toBe(
      'background-image: initial',
    )
    expect(serializeInlineStyle({ backgroundImage: 'unset' })).toBe(
      'background-image: unset',
    )
    expect(serializeInlineStyle({ backgroundImage: 'revert' })).toBe(
      'background-image: revert',
    )
  })

  it('defaults letter-spacing/word-spacing to em, matching the manual typography panel default unit (regression: numeric convenience form silently used px, a 20x magnitude difference for typical values)', () => {
    // TypographyControlsPanel.tsx defaults letterSpacingUnit/wordSpacingUnit
    // to 'em' and persists e.g. "letter-spacing: 0.05em". Before this fix,
    // an AI calling styleApply({style:{letterSpacing:0.05}}) persisted
    // "letter-spacing: 0.05px" instead — visually negligible, 20x smaller
    // than what the same numeric input means on the manual panel.
    expect(serializeInlineStyle({ letterSpacing: 0.05 })).toBe(
      'letter-spacing: 0.05em',
    )
    expect(serializeInlineStyle({ wordSpacing: 0.1 })).toBe(
      'word-spacing: 0.1em',
    )
  })

  it('builds identical style mutation commands for manual and AI edit inputs', () => {
    const ctx = {
      sessionId: 'session_shared_style',
      anonymousOwnerSecret: 'owner-secret',
      instruction: 'make the title larger',
      sourceAnchor: 'hero-title',
      occurrenceIndex: 0,
    }

    const manual = buildStyleApplyCommand(
      {
        sourceAnchor: 'hero-title',
        style: 'font-size: 32px; font-weight: 700',
        occurrenceIndex: 0,
      },
      ctx,
    )
    const ai = buildStyleApplyCommand(
      {
        sourceAnchor: 'hero-title',
        style: { fontSize: 32, fontWeight: 700 },
        occurrenceIndex: 0,
      },
      ctx,
    )

    expect(ai.args).toEqual(manual.args)
  })

  it('builds text rewrite commands without requiring callers to know Convex', () => {
    const command = buildTextRewriteCommand(
      { afterText: 'Dreamier headline' },
      {
        sessionId: 'session_shared_text',
        selectedText: 'Plain headline',
        occurrenceIndex: 2,
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_shared_text',
      editType: 'text',
      beforeText: 'Plain headline',
      afterText: 'Dreamier headline',
      targetLabel: 'Plain headline',
      occurrenceIndex: 2,
    })
  })

  it('builds image replacement commands for resolved stock or uploaded image URLs', () => {
    const command = buildImageReplaceCommand(
      {
        src: 'https://images.pexels.com/photos/hero.jpeg',
        alt: 'Glass showroom',
        occurrenceIndex: '3',
      },
      {
        sessionId: 'session_shared_image',
        sourceAnchor: 'Original image alt',
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_shared_image',
      editType: 'image',
      beforeText: 'Original image alt',
      afterText: 'https://images.pexels.com/photos/hero.jpeg',
      targetLabel: 'Glass showroom',
      occurrenceIndex: 3,
    })
  })

  it('rejects unresolved stock image queries before persistence', () => {
    expect(() =>
      buildImageReplaceCommand(
        {
          query: 'premium lobby background',
          alt: 'Premium lobby',
        },
        {
          sessionId: 'session_unresolved_image_query',
          sourceAnchor: 'Premium lobby',
        },
      ),
    ).toThrow(/resolved image URL/)
  })

  it('builds section background image replacements as style commands', () => {
    const command = buildImageReplaceCommand(
      {
        targetScope: 'section',
        src: 'https://images.pexels.com/photos/section-bg.jpeg',
      },
      {
        sessionId: 'session_section_background_image',
        sourceAnchor: '[data-openui-var="home_hero"]',
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_section_background_image',
      editType: 'style',
      beforeText: '[data-openui-var="home_hero"]',
      targetLabel: '[data-openui-var="home_hero"]',
      afterText:
        'background-image: url("https://images.pexels.com/photos/section-bg.jpeg"); background-size: cover; background-position: center',
    })
  })

  it('routes an element-scoped background edit to a style command when the selected element is not an <img> (regression: routing was keyed on targetScope alone, not the actual tag)', () => {
    const command = buildImageReplaceCommand(
      {
        // targetScope defaults to 'element' — this is exactly what an AI
        // naturally sends when editing "the selected element's background",
        // which for a <div> is not an <img> src swap.
        src: 'https://images.pexels.com/photos/div-bg.jpeg',
      },
      {
        sessionId: 'session_div_background_image',
        sourceAnchor: 'hero-section',
        selectedTag: 'div',
      },
    )

    expect(command.args).toMatchObject({
      sessionId: 'session_div_background_image',
      editType: 'style',
      afterText:
        'background-image: url("https://images.pexels.com/photos/div-bg.jpeg"); background-size: cover; background-position: center',
    })
  })

  it('still does a real <img> src swap when the selected element is genuinely an <img> (no regression for the working case)', () => {
    const command = buildImageReplaceCommand(
      {
        src: 'https://images.pexels.com/photos/hero.jpeg',
        alt: 'Hero photo',
      },
      {
        sessionId: 'session_real_img_swap',
        sourceAnchor: 'Hero photo',
        selectedTag: 'img',
      },
    )

    expect(command.args).toMatchObject({
      sessionId: 'session_real_img_swap',
      editType: 'image',
      afterText: 'https://images.pexels.com/photos/hero.jpeg',
    })
  })

  it('builds image removal commands as an empty image replacement on the same anchor', () => {
    const command = buildImageRemoveCommand(
      { alt: 'Current hero image' },
      {
        sessionId: 'session_remove_image',
        sourceAnchor: 'Current hero image',
        occurrenceIndex: 1,
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_remove_image',
      editType: 'image',
      beforeText: 'Current hero image',
      afterText: '',
      targetLabel: 'Current hero image',
      occurrenceIndex: 1,
    })
  })

  it('builds section background image removals as durable style overrides, also resetting size/position (regression: manual removeBgImage clears all three, the AI path only cleared background-image)', () => {
    const command = buildImageRemoveCommand(
      { targetScope: 'section' },
      {
        sessionId: 'session_remove_section_background',
        sourceAnchor: '#hero_section',
        occurrenceIndex: 1,
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_remove_section_background',
      editType: 'style',
      beforeText: '#hero_section',
      targetLabel: '#hero_section',
      afterText:
        'background-image: none; background-size: auto; background-position: 0% 0%',
      occurrenceIndex: 1,
    })
  })

  it('builds link edits without forcing AI callers to know the Convex edit shape', () => {
    const source = `links: [{ label: "Learn more", href: "/old" }]`
    const command = buildLinkEditCommand(
      {
        oldHref: '/old',
        href: 'https://example.com/pricing',
        label: 'See pricing',
        openInNewTab: true,
        noindex: 'true',
      },
      {
        sessionId: 'session_link_edit',
        selectedText: 'Learn more',
        currentSource: source,
        occurrenceIndex: 0,
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_link_edit',
      editType: 'ai_rewrite',
      beforeText: source,
      targetLabel: 'link: /old -> https://example.com/pricing',
      occurrenceIndex: 0,
    })
    expect(command.args.afterText).toContain(
      'href: "https://example.com/pricing"',
    )
    expect(command.args.afterText).toContain('label: "See pricing"')
    expect(command.args.afterText).toContain('target: "_blank"')
    expect(command.args.afterText).toContain(
      'rel: "noopener noreferrer nofollow"',
    )
    expect(command.args.afterHtml).toBe(command.args.afterText)
    expect(command.args.instruction).toBe(
      'replace link /old with https://example.com/pricing',
    )
  })

  it('rejects link edits when there is no current source to patch', () => {
    expect(() =>
      buildLinkEditCommand(
        { oldHref: '/old', href: '/new', label: 'New' },
        {
          sessionId: 'session_link_edit',
          selectedText: 'Old',
        },
      ),
    ).toThrow(/current source/)
  })

  it('builds element deletion as the same persistent style override manual delete uses', () => {
    const command = buildElementDeleteCommand(
      { sourceAnchor: 'hero-card', occurrenceIndex: 2 },
      {
        sessionId: 'session_delete_element',
        sourceAnchor: 'fallback-anchor',
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_delete_element',
      editType: 'style',
      beforeText: 'hero-card',
      targetLabel: 'hero-card',
      afterText: 'display: none',
      occurrenceIndex: 2,
    })
  })

  it('builds section move commands with the same reordered OpenUI source manual moves persist', () => {
    const source = `home_hero = Hero({})
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_pricing = Pricing({})
home_pricing_anchor = SectionAnchor("home_pricing", home_pricing)
home = Stack([home_hero_anchor, home_pricing_anchor])`
    const command = buildSectionMoveCommand(
      { varName: 'home_pricing', direction: 'up' },
      {
        sessionId: 'session_move_section',
        instruction: 'move pricing above features',
        currentSource: source,
      },
    )

    expect(command.kind).toBe('createEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_move_section',
      editType: 'ai_rewrite',
      beforeText: source,
      targetLabel: 'reorder home_pricing up',
      instruction: 'reorder home_pricing up',
    })
    expect(command.args.afterHtml).toContain(
      'Stack([home_pricing_anchor, home_hero_anchor])',
    )
    expect(command.args.afterText).toBe(command.args.afterHtml)
  })

  it('rejects section move commands when there is no current OpenUI source to reorder', () => {
    expect(() =>
      buildSectionMoveCommand(
        { varName: 'home_pricing', direction: 'up' },
        { sessionId: 'session_move_section' },
      ),
    ).toThrow(/current OpenUI source/)
  })

  it('builds section rewrite commands for the applySectionEdit mutation, anchored to the selected OpenUI variable (regression: unanchored replacementOpenUiSource wiped the whole document to a blank render)', () => {
    const command = buildSectionRewriteCommand(
      {
        replacementOpenUiSource: 'Hero({ headline: "New" })',
      },
      {
        sessionId: 'session_rewrite_section',
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'rewrite hero',
        openuiVar: 'home_hero',
      },
    )

    expect(command.kind).toBe('applySectionEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_rewrite_section',
      anonymousOwnerSecret: 'owner-secret',
      replacementOpenUiSource: 'Hero({ headline: "New" })',
      sectionVarName: 'home_hero',
      instruction: 'rewrite hero',
    })
  })

  it('rejects a replacementOpenUiSource section rewrite when no OpenUI variable is known to anchor on, rather than risk overwriting the whole document (regression)', () => {
    expect(() =>
      buildSectionRewriteCommand(
        {
          replacementOpenUiSource: 'Hero({ headline: "New" })',
        },
        {
          sessionId: 'session_rewrite_section_no_anchor',
          instruction: 'rewrite hero',
        },
      ),
    ).toThrow(/OpenUI section variable/)
  })

  it('threads the selected section outerHTML through as beforeHtml so an HTML replacementHtml can be spliced, not full-page-replaced (regression)', () => {
    const command = buildSectionRewriteCommand(
      {
        replacementHtml: '<section class="hero">Sharper hero</section>',
      },
      {
        sessionId: 'session_rewrite_html_section',
        anonymousOwnerSecret: 'owner-secret',
        instruction: 'rewrite hero',
        selectionHtml: '<section class="hero">Hero</section>',
      },
    )

    expect(command.kind).toBe('applySectionEdit')
    expect(command.args).toMatchObject({
      sessionId: 'session_rewrite_html_section',
      replacementHtml: '<section class="hero">Sharper hero</section>',
      beforeHtml: '<section class="hero">Hero</section>',
    })
  })

  it('builds an undo command that restores the version immediately before the current one', () => {
    const command = buildUndoCommand(
      {},
      {
        sessionId: 'session_undo',
        anonymousOwnerSecret: 'owner-secret',
        currentPreviewVersion: 7,
      },
    )

    expect(command.kind).toBe('restorePreviewVersion')
    expect(command.args).toEqual({
      sessionId: 'session_undo',
      anonymousOwnerSecret: 'owner-secret',
      version: 6,
    })
  })

  it('rejects undo when there is no known current preview version', () => {
    expect(() =>
      buildUndoCommand({}, { sessionId: 'session_undo_no_version' }),
    ).toThrow(/current preview version/)
  })

  it('rejects undo at the earliest version instead of restoring a nonexistent version 0', () => {
    expect(() =>
      buildUndoCommand(
        {},
        { sessionId: 'session_undo_at_start', currentPreviewVersion: 1 },
      ),
    ).toThrow(/Nothing to undo/)
  })

  it('warns when the legacy capsule-based section move path is used', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const source = `home_hero = Hero({})
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_pricing = Pricing({})
home_pricing_anchor = SectionAnchor("home_pricing", home_pricing)
home = Stack([home_hero_anchor, home_pricing_anchor])`

    buildSectionMoveCommand(
      { varName: 'home_pricing', direction: 'up' },
      { sessionId: 'session_move_warn', currentSource: source },
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      '[ship-fast] Deprecated:',
    )
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      'buildSectionMoveCommand',
    )
  })

  it('warns when the legacy replacementOpenUiSource section rewrite path is used', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    buildSectionRewriteCommand(
      { replacementOpenUiSource: 'Hero({ headline: "New" })' },
      {
        sessionId: 'session_rewrite_warn',
        openuiVar: 'home_hero',
      },
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      '[ship-fast] Deprecated:',
    )
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      'replacementOpenUiSource',
    )
  })

  it('does not warn for the DOM-based replacementHtml section rewrite path', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    buildSectionRewriteCommand(
      { replacementHtml: '<section class="hero">Sharper hero</section>' },
      {
        sessionId: 'session_rewrite_html_no_warn',
        selectionHtml: '<section class="hero">Hero</section>',
      },
    )

    expect(warn).not.toHaveBeenCalled()
  })
})
