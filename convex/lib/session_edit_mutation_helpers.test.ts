import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

let activeTest: ReturnType<typeof convexTest> | null = null

const sessionEditConvexTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  activeTest = t
  return t
}

afterEach(async () => {
  if (activeTest) {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 10))
      await activeTest.finishInProgressScheduledFunctions()
    }
    activeTest = null
  }
})

async function createReadySession(
  t: ReturnType<typeof sessionEditConvexTest>,
  prompt = 'Original headline',
) {
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_${prompt.toLowerCase().replace(/\W+/g, '_')}`,
    anonymousClientId: `anon_${prompt.toLowerCase().replace(/\W+/g, '_')}`,
    anonymousOwnerSecret: 'owner-secret',
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `<html><body><main><h1>${prompt}</h1></main></body></html>`,
    openUiSource: `$page = "Home"\nroot = Text("${prompt}")`,
    siteSpecJson: JSON.stringify({
      hero: { headline: prompt },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return sessionId
}

describe('session edit mutation helpers', () => {
  it('patches canonical artifacts (homeModule.source + siteSpec) on text edits so they survive reload', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t)

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'Original headline',
        afterText: 'Updated headline',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    const preview = await t.query(api.sessions.getPublicPreview, {
      lookup: sessionId,
    })
    const view = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })

    // Preview html is updated.
    expect(preview?.html).toContain('Updated headline')
    // Canonical source MUST be patched — the Dashboard renders from
    // homeModule.source, so an unpatched source makes the edit vanish on
    // reload (regression introduced by the master/develop reconcile).
    expect(view?.homeModule?.source).toContain('Updated headline')
    expect(view?.homeModule?.source).not.toContain('Original headline')
    // siteSpec is patched too (replaceFirstJsonText path).
    expect(view?.siteSpec?.specJson).toContain('Updated headline')
    expect(view?.siteSpec?.specJson).not.toContain('Original headline')
  })

  it('text edit survives a reload: re-reading homeModule.source after edit still contains the new text', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Reload headline')

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Reload headline',
      afterText: 'Reloaded headline',
    })

    // Simulate a page reload: the Dashboard re-fetches the generation view
    // and renders from homeModule.source. The edited text must still be there.
    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Reloaded headline')
    expect(reloaded?.homeModule?.source).not.toContain('Reload headline')

    // A second sequential edit must patch the already-patched source (guards
    // against the !!!!!! regression where the second edit couldn't find the
    // original text because the source had been left stale).
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Reloaded headline',
      afterText: 'Reloaded twice headline',
    })
    const reloaded2 = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded2?.homeModule?.source).toContain('Reloaded twice headline')
  })

  it('persists translated inline edits as locale translations without rewriting canonical source text', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Original English headline')

    await t.mutation(api.sessions.setPreferredLanguage, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      preferredLanguage: 'hi',
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'hi',
      entries: [
        {
          text: 'Original English headline',
          translation: 'मूल अंग्रेज़ी शीर्षक',
        },
      ],
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'मूल अंग्रेज़ी शीर्षक',
        afterText: 'अपडेट किया गया शीर्षक',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Original English headline')
    expect(reloaded?.homeModule?.source).not.toContain('अपडेट किया गया शीर्षक')
    expect(reloaded?.siteSpec?.specJson).toContain('Original English headline')
    expect(reloaded?.siteSpec?.specJson).not.toContain('अपडेट किया गया शीर्षक')
    expect(reloaded?.latestPreview?.html).toContain('Original English headline')

    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'hi',
        texts: ['Original English headline'],
        sessionId,
      }),
    ).resolves.toEqual(['अपडेट किया गया शीर्षक'])
  })

  it('allows a second inline edit after a translated edit has been saved and reloaded', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Original English headline')

    await t.mutation(api.sessions.setPreferredLanguage, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      preferredLanguage: 'hi',
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'hi',
      entries: [
        {
          text: 'Original English headline',
          translation: 'मूल अंग्रेज़ी शीर्षक',
        },
      ],
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'मूल अंग्रेज़ी शीर्षक',
      afterText: 'पहला हिंदी संपादन',
    })

    const afterReload = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(afterReload?.homeModule?.source).toContain(
      'Original English headline',
    )
    expect(afterReload?.homeModule?.source).not.toContain('पहला हिंदी संपादन')
    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'hi',
        texts: ['Original English headline'],
        sessionId,
      }),
    ).resolves.toEqual(['पहला हिंदी संपादन'])

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'पहला हिंदी संपादन',
        afterText: 'दूसरा हिंदी संपादन',
      }),
    ).resolves.toMatchObject({
      previewVersion: 3,
      saved: true,
    })

    const afterSecondReload = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(afterSecondReload?.homeModule?.source).toContain(
      'Original English headline',
    )
    expect(afterSecondReload?.homeModule?.source).not.toContain(
      'दूसरा हिंदी संपादन',
    )
    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'hi',
        texts: ['Original English headline'],
        sessionId,
      }),
    ).resolves.toEqual(['दूसरा हिंदी संपादन'])
  })

  it('patches only the selected repeated occurrence when translated text maps back to canonical source', async () => {
    const t = sessionEditConvexTest()
    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Repeated glass page',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_repeated_glass_page',
      anonymousClientId: 'anon_repeated_glass_page',
      anonymousOwnerSecret: 'owner-secret',
    })

    await t.action(internal.sessions.completeGeneration, {
      sessionId,
      html: [
        '<html><body>',
        '<header>Polished Glass</header>',
        '<main><h1>Polished Glass</h1></main>',
        '<footer>Polished Glass</footer>',
        '</body></html>',
      ].join(''),
      openUiSource: [
        '$page = "Home"',
        'header = Text("Polished Glass")',
        'hero = Text("Polished Glass")',
        'footer = Text("Polished Glass")',
        'root = Stack([header, hero, footer])',
      ].join('\n'),
      siteSpecJson: JSON.stringify({
        nav: { brand: 'Polished Glass' },
        hero: { headline: 'Polished Glass' },
        footer: { brand: 'Polished Glass' },
      }),
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    })
    await t.mutation(api.sessions.setPreferredLanguage, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      preferredLanguage: 'hi',
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'hi',
      entries: [
        {
          text: 'Polished Glass',
          translation: 'पॉलिश किया हुआ',
        },
      ],
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'पॉलिश किया हुआ',
      afterText: 'एजेंट सत्यापन शीर्षक',
      occurrenceIndex: 1,
    })

    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain(
      'header = Text("Polished Glass")',
    )
    expect(reloaded?.homeModule?.source).toContain(
      'hero = Text("एजेंट सत्यापन शीर्षक")',
    )
    expect(reloaded?.homeModule?.source).toContain(
      'footer = Text("Polished Glass")',
    )
    expect(reloaded?.latestPreview?.html).toContain(
      'data-openui-var="header">Polished Glass</p>',
    )
    expect(reloaded?.latestPreview?.html).toContain(
      'data-openui-var="hero">एजेंट सत्यापन शीर्षक</p>',
    )
    expect(reloaded?.latestPreview?.html).toContain(
      'data-openui-var="footer">Polished Glass</p>',
    )
  })

  it('patches Lakebed session data so realtime section state cannot replay stale text after reload', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Standard Glass')

    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'MarketingAgencyPricing:home_pricing',
      patch: {
        plans: [
          {
            name: 'Standard Glass',
            audience: 'Small businesses',
          },
        ],
      },
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Pricing plan',
      beforeText: 'Standard Glass',
      afterText: 'Custom Glass',
    })

    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        capsule: 'MarketingAgencyPricing:home_pricing',
      }),
    ).resolves.toMatchObject({
      plans: [
        {
          name: 'Custom Glass',
          audience: 'Small businesses',
        },
      ],
    })
  })

  it('patches AI capsule compiled source when the edited text is rendered by a custom capsule', async () => {
    const t = sessionEditConvexTest()
    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'AI capsule boutique page',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_ai_capsule_inline_text',
      anonymousClientId: 'anon_ai_capsule_inline_text',
      anonymousOwnerSecret: 'owner-secret',
    })

    const capsuleName = 'AICustom_FashionStoreHero_home_hero'
    await t.mutation(internal.sessions.completeGenerationInternal, {
      sessionId,
      html: [
        '<!DOCTYPE html><html lang="en"><head><title>AI Capsule Preview</title></head><body>',
        '<main id="openui-root" data-openui-ready="source">',
        '<p>AI capsule shell loaded.</p>',
        '</main></body></html>',
      ].join(''),
      openUiSource: [
        '$page = "Home"',
        `home_hero = ${capsuleName}("New Collection")`,
        'root = home_hero',
      ].join('\n'),
      siteSpecJson: JSON.stringify({
        brand: 'Hello Kitty',
        hero: { capsule: capsuleName },
      }),
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    })
    await t.mutation(internal.sessions.upsertAiCapsule, {
      sessionId,
      capsuleName,
      parentCapsule: 'FashionStoreHero',
      compiledJs:
        'export default function Hero(props){const heroTop = props.headingTop ?? "The Quiet"; const heroBottom = props.headingBottom ?? "Luxury Edit"; return <h1>{heroTop}<br />{heroBottom}</h1>}',
      description: 'AI capsule hero',
    })
    await t.mutation(internal.sessions.upsertAiCapsule, {
      sessionId,
      capsuleName: `AICustom_${capsuleName}_v2`,
      parentCapsule: capsuleName,
      compiledJs:
        'export default function Hero(){return <h1>{["The Quiet", <br />, "Luxury Edit"]}</h1>}',
      description: 'Nested AI capsule hero',
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'The QuietLuxury Edit',
        afterText: 'Deep QA Inline Headline',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    const capsules = await t.query(api.sessions.listAiCapsules, { sessionId })

    expect(reloaded?.latestPreview?.html).toContain('AI capsule shell loaded.')
    expect(reloaded?.homeModule?.source).toContain(capsuleName)
    expect(capsules).toHaveLength(2)
    for (const capsule of capsules) {
      expect(capsule.compiledJs).toContain('Deep QA Inline Headline')
      expect(capsule.compiledJs).not.toContain('"The Quiet"')
      expect(capsule.compiledJs).not.toContain('"Luxury Edit"')
    }
  })

  it('patches translated Lakebed section data when selected text is mapped back to canonical source text', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Original English headline')

    await t.mutation(api.sessions.setPreferredLanguage, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      preferredLanguage: 'hi',
    })
    await t.mutation(api.translationCache.setBatch, {
      locale: 'hi',
      entries: [
        {
          text: 'Original English headline',
          translation: 'मूल अंग्रेज़ी शीर्षक',
        },
      ],
    })
    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'MarketingAgencyHero:home_hero',
      patch: {
        heading: 'मूल अंग्रेज़ी शीर्षक',
      },
    })

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'मूल अंग्रेज़ी शीर्षक',
      afterText: 'अपडेट किया गया शीर्षक',
    })

    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        capsule: 'MarketingAgencyHero:home_hero',
      }),
    ).resolves.toMatchObject({
      heading: 'अपडेट किया गया शीर्षक',
    })
  })

  it('accepts a text edit whose text exists ONLY in Lakebed sessionData (gov-portal boards/tenders) instead of throwing TEXT_NOT_FOUND', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Gov portal home')

    // Library-capsule content (board members, tenders, directory rows) is
    // seeded into sessionData and rendered via Lakebed live queries. It never
    // appears in preview.html (SSR renders with inert Lakebed stubs) nor in
    // homeModule.source (which only carries the capsule call).
    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'GovPortal',
      patch: {
        boardMembers: [
          {
            name: 'Sri. Sudhir Tripathi, IAS',
            designation: 'Chief Secretary GOJ and Director TVNL',
          },
        ],
      },
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Board member name',
        beforeText: 'Sri. Sudhir Tripathi, IAS',
        afterText: 'Sri. Renamed Director, IAS',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    // The Lakebed row is patched — the capsule re-renders live from it.
    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        capsule: 'GovPortal',
      }),
    ).resolves.toMatchObject({
      boardMembers: [
        {
          name: 'Sri. Renamed Director, IAS',
          designation: 'Chief Secretary GOJ and Director TVNL',
        },
      ],
    })

    // Canonical artifacts are untouched (the text never lived there).
    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Gov portal home')
    expect(reloaded?.homeModule?.source).not.toContain('Renamed Director')
  })

  it('accepts a text edit found in preview.html and sessionData but absent from the generated source (second gate)', async () => {
    const t = sessionEditConvexTest()
    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Gate two page',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_gate_two_page',
      anonymousClientId: 'anon_gate_two_page',
      anonymousOwnerSecret: 'owner-secret',
    })
    await t.action(internal.sessions.completeGeneration, {
      sessionId,
      // "Shared banner" is in the rendered preview html (so the FIRST gate
      // passes) but not in the OpenUI source or siteSpec — only sessionData
      // carries it, exercising the second (artifact) gate's fallback.
      html: '<html><body><h1>Gate two page</h1><p>Shared banner</p></body></html>',
      openUiSource: '$page = "Home"\nroot = Text("Gate two page")',
      siteSpecJson: JSON.stringify({ hero: { headline: 'Gate two page' } }),
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    })
    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'GovPortalNotice:home_notice',
      patch: { banner: 'Shared banner' },
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Notice banner',
        beforeText: 'Shared banner',
        afterText: 'Updated banner',
      }),
    ).resolves.toMatchObject({
      previewVersion: 2,
      saved: true,
    })

    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        capsule: 'GovPortalNotice:home_notice',
      }),
    ).resolves.toMatchObject({ banner: 'Updated banner' })
  })

  it('does NOT corrupt a longer sessionData leaf when the unfound text is merely its substring (capsule-hardcoded strings)', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Substring guard page')

    // "Board of Directors" is hardcoded inside the GovPortalLeadership capsule
    // (pickLang fallback) — it exists in NO store. The sessionData heading
    // "Leadership & Board of Directors" merely CONTAINS it. The fallback gate
    // must not substring-splice the heading; it must keep failing loudly.
    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'GovPortalLeadership:company_lead',
      patch: { heading: 'Leadership & Board of Directors' },
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Board heading',
        beforeText: 'Board of Directors',
        afterText: 'Board of Directorate',
      }),
    ).rejects.toThrow(/TEXT_NOT_FOUND|not found/)

    await expect(
      t.query(api.lakebed.getSessionData, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        capsule: 'GovPortalLeadership:company_lead',
      }),
    ).resolves.toMatchObject({
      heading: 'Leadership & Board of Directors',
    })
  })

  it('still throws TEXT_NOT_FOUND when the text exists in no store at all', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'No match page')

    await t.mutation(api.lakebed.mergeSessionData, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      capsule: 'GovPortal',
      patch: { boardMembers: [{ name: 'Some Director' }] },
    })

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Nowhere text',
        beforeText: 'Text that exists in no store whatsoever',
        afterText: 'Replacement',
      }),
    ).rejects.toThrow(/TEXT_NOT_FOUND|not found/)
  })

  it('records edit history with target label and occurrence metadata', async () => {
    const t = sessionEditConvexTest()
    const sessionId = await createReadySession(t, 'Repeated headline')

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: 'Repeated headline',
      afterText: 'Edited repeated headline',
      occurrenceIndex: 0,
    })

    await expect(
      t.query(api.sessions.listEdits, { lookup: sessionId }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          editType: 'text',
          targetLabel: 'Hero headline',
          beforeText: 'Repeated headline',
          afterText: 'Edited repeated headline',
          occurrenceIndex: 0,
          previewVersion: 2,
        }),
      ]),
    )
  })

  it('rejects edits from callers that do not own the session', async () => {
    const t = sessionEditConvexTest()
    const sessionId: Id<'sessions'> = await createReadySession(
      t,
      'Protected headline',
    )

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'wrong-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: 'Protected headline',
        afterText: 'Tampered headline',
      }),
    ).rejects.toThrow(/FORBIDDEN|do not own/)
  })
})
