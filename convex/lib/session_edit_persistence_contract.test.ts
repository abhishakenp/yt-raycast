import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')
}

// Track the active convexTest instance so afterEach can drain pending
// scheduled functions (export_artifacts:build is scheduled by
// completeGeneration and otherwise writes after the test's transaction
// context is torn down, causing "Write outside of transaction" errors).
let activeTest: ReturnType<typeof convexTest> | null = null
const scheduledDrainTimeoutMs = 5_000

async function drainScheduledFunctionsWithTimeout(
  t: ReturnType<typeof convexTest>,
) {
  await Promise.race([
    t.finishInProgressScheduledFunctions(),
    new Promise<void>((resolve) =>
      setTimeout(resolve, scheduledDrainTimeoutMs),
    ),
  ])
}

const sessionEditContractTest = () => {
  const t = convexTest(schema, modules)
  registerDebouncer(t)
  activeTest = t
  return t
}

afterEach(async () => {
  if (activeTest) {
    // completeGeneration schedules export_artifacts:build via
    // ctx.scheduler.runAfter(0, ...), which convex-test fires via
    // setTimeout(0). We need to let that timer fire so the scheduled
    // function runs within the convexTest's transaction context, then
    // drain it. Without this, the function fires after the test is torn
    // down, causing "Write outside of transaction" unhandled errors.
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 10))
      await drainScheduledFunctionsWithTimeout(activeTest)
    }
    activeTest = null
  }
})

/**
 * Create a ready session with a REAL engine output fixture as the OpenUI source.
 * This is the critical difference from the existing toy-source tests: we use
 * actual multi-page PageSwitch sources with URLs in targetMaps, nested objects,
 * repeated text across navbar/hero/footer, and non-ASCII content.
 */
async function createReadySessionWithFixture(
  t: ReturnType<typeof sessionEditContractTest>,
  fixtureName: string,
  prompt: string,
  language = 'en',
) {
  const source = loadFixture(fixtureName)
  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt,
    preferredLanguage: language,
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_${fixtureName}`,
    anonymousClientId: `anon_${fixtureName}`,
    anonymousOwnerSecret: 'owner-secret',
  })

  // Render the fixture to HTML via the SSR renderer so the preview has real
  // HTML content (not just the raw OpenUI source).
  const { renderOpenUIToHTML } = await import('@ship-fast/engine/openui-ssr.js')
  const html = await renderOpenUIToHTML(source, undefined, language)

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html,
    openUiSource: source,
    siteSpecJson: JSON.stringify({ projectName: prompt }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return { sessionId, source }
}

/**
 * Extract a high-signal text string from an OpenUI source that we can use as
 * an edit target. We pick text from the hero section's headline (the second
 * positional arg of the first *Hero call), which is realistic — users edit
 * headlines in demos.
 */
function extractHeadlineFromSource(source: string): string | null {
  // Match: hero = XxxHero("...", "Headline text", ...
  const match = source.match(/\w+_hero\s*=\s*\w*Hero\("[^"]*",\s*"([^"]+)"/)
  return match?.[1] ?? null
}

/**
 * Simulate a full page reload: re-fetch the generation view (which the
 * Dashboard uses to render), then re-render the source through SSR to
 * verify the edited content is visible in the rendered HTML.
 */
async function reloadAndRender(
  t: ReturnType<typeof sessionEditContractTest>,
  sessionId: string,
) {
  const reloaded = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const source = reloaded?.homeModule?.source
  const html = reloaded?.latestPreview?.html
  return { reloaded, source, html }
}

describe('inline edit persistence contract (real engine fixtures)', () => {
  // ─────────────────────────────────────────────────────────────────────
  // TEXT EDITS — editType: 'text'
  // These patch homeModule.source via applyPreviewTextEdit. The edit should
  // persist in the source and survive a reload.
  // ─────────────────────────────────────────────────────────────────────

  it('text edit on a real blog source persists through reload', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    const newHeadline = 'Updated Headline for Demo'

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: headline!,
        afterText: newHeadline,
      }),
    ).resolves.toMatchObject({ saved: true })

    // Simulate a page reload: re-fetch the generation view and check
    // homeModule.source — the edited text MUST be there.
    const { reloaded, source: reloadedSource } = await reloadAndRender(
      t,
      sessionId,
    )
    expect(reloadedSource).toContain(newHeadline)

    // The hero line specifically must contain the new headline, not the old one.
    const heroLine = reloadedSource
      ?.split('\n')
      .find((l: string) => l.includes('_hero ='))
    expect(heroLine).toContain(newHeadline)
    expect(heroLine).not.toContain(headline)

    // The preview HTML must also contain the new headline (not just the source).
    expect(reloaded?.latestPreview?.html).toContain(newHeadline)
  })

  it('sequential text edits on a real source find the already-patched text', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'tech-blog',
      'tech blog site',
    )

    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    // First edit
    const firstEdit = 'First Edit Headline'
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: headline!,
      afterText: firstEdit,
    })

    // Second edit — must find the first edit's text in the already-patched source
    const secondEdit = 'Second Edit Headline'
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: firstEdit,
      afterText: secondEdit,
    })

    const { reloaded, source: reloadedSource } = await reloadAndRender(
      t,
      sessionId,
    )
    expect(reloadedSource).toContain(secondEdit)
    expect(reloadedSource).not.toContain(firstEdit)
    expect(reloaded?.latestPreview?.html).toContain(secondEdit)
  })

  it('text edit on a real ecommerce source with URLs in targetMap persists', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'grocery-ecommerce',
      'grocery delivery app',
    )

    // Ecommerce sources may not have a *Hero call — find any quoted string
    // that appears in the source and use it as the edit target.
    const textMatch = source.match(/"([A-Z][^"]{10,60})"/)
    expect(textMatch).toBeTruthy()
    const originalText = textMatch![1]
    const newText = 'Replaced Text For Testing'

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Section text',
        beforeText: originalText,
        afterText: newText,
      }),
    ).resolves.toMatchObject({ saved: true })

    const { reloaded, source: reloadedSource } = await reloadAndRender(
      t,
      sessionId,
    )
    expect(reloadedSource).toContain(newText)
    expect(reloaded?.latestPreview?.html).toContain(newText)
  })

  it('text edit on a non-English (Hindi) source persists', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'wine-shop-hindi',
      'wine shop in hindi',
      'hi',
    )

    // Find any quoted Hindi text in the source
    const textMatch = source.match(/"([^"]{5,80})"/)
    expect(textMatch).toBeTruthy()
    const originalText = textMatch![1]
    const newText = 'Updated Hindi Text'

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Section text',
        beforeText: originalText,
        afterText: newText,
      }),
    ).resolves.toMatchObject({ saved: true })

    const { reloaded, source: reloadedSource } = await reloadAndRender(
      t,
      sessionId,
    )
    expect(reloadedSource).toContain(newText)
    expect(reloaded?.latestPreview?.html).toContain(newText)
  })

  it('edited source still parses and exports after a text edit', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'popcorn-mania',
      'popcorn mania website',
    )

    const headline = extractHeadlineFromSource(source)
    if (!headline) {
      const textMatch = source.match(/"([A-Z][^"]{10,60})"/)
      expect(textMatch).toBeTruthy()
      const originalText = textMatch![1]
      await t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Section text',
        beforeText: originalText,
        afterText: 'Updated Popcorn Text',
      })
    } else {
      await t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: headline,
        afterText: 'Updated Popcorn Headline',
      })
    }

    const { source: reloadedSource } = await reloadAndRender(t, sessionId)
    expect(reloadedSource).toBeTruthy()

    // Parse the patched source — it must not throw.
    const { parseOpenUIForExport } =
      await import('../../src/features/exports/services/openui-export-builder')
    expect(() =>
      parseOpenUIForExport(
        reloadedSource!,
        JSON.stringify({ projectName: 'test' }),
      ),
    ).not.toThrow()
  })

  // ─────────────────────────────────────────────────────────────────────
  // AI REWRITE EDITS — editType: 'ai_rewrite' with afterHtml
  // These use afterHtml (the AI generates new HTML). The current code
  // takes the `else` branch and does NOT patch homeModule.source — it
  // only updates preview.html. This means the edit vanishes on reload
  // because the Dashboard renders from homeModule.source.
  //
  // These tests are EXPECTED TO FAIL until the AI rewrite persistence
  // bug is fixed.
  // ─────────────────────────────────────────────────────────────────────

  it('AI rewrite edit persists in homeModule.source through reload', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    const newHeadline = 'AI Rewritten Headline'
    // AI rewrite provides afterHtml — the AI generates new HTML with the
    // rewritten text. We simulate this by replacing the headline in the
    // rendered HTML.
    const { renderOpenUIToHTML } =
      await import('@ship-fast/engine/openui-ssr.js')
    const originalHtml = await renderOpenUIToHTML(source, undefined, 'en')
    const rewrittenHtml = originalHtml.replaceAll(headline!, newHeadline)

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'ai_rewrite',
        targetLabel: 'Hero headline',
        beforeText: headline!,
        afterText: newHeadline,
        afterHtml: rewrittenHtml,
      }),
    ).resolves.toMatchObject({ saved: true })

    // Simulate a page reload: re-fetch the generation view.
    const { reloaded, source: reloadedSource } = await reloadAndRender(
      t,
      sessionId,
    )

    // BUG: The source is NOT patched for ai_rewrite edits. The edit vanishes
    // on reload because the Dashboard renders from homeModule.source.
    // This assertion will FAIL until the bug is fixed.
    expect(reloadedSource).toContain(newHeadline)
    expect(reloadedSource).not.toContain(headline)

    // The preview HTML should contain the new headline (this passes —
    // the preview is updated even though the source isn't).
    expect(reloaded?.latestPreview?.html).toContain(newHeadline)
  })

  it('AI rewrite edit survives a full reload — source matches preview', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'tech-blog',
      'tech blog site',
    )

    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    const newHeadline = 'AI Rewritten Tech Headline'
    const { renderOpenUIToHTML } =
      await import('@ship-fast/engine/openui-ssr.js')
    const originalHtml = await renderOpenUIToHTML(source, undefined, 'en')
    const rewrittenHtml = originalHtml.replaceAll(headline!, newHeadline)

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'ai_rewrite',
      targetLabel: 'Hero headline',
      beforeText: headline!,
      afterText: newHeadline,
      afterHtml: rewrittenHtml,
    })

    // After reload, re-render the source through SSR and verify the
    // rewritten content is visible. If the source wasn't patched, the
    // SSR re-render will show the OLD content, not the AI rewrite.
    const { source: reloadedSource } = await reloadAndRender(t, sessionId)
    expect(reloadedSource).toBeTruthy()

    const reRenderedHtml = await renderOpenUIToHTML(
      reloadedSource!,
      undefined,
      'en',
    )
    // BUG: This will FAIL because the source was never patched — the
    // re-rendered HTML shows the old headline, not the AI rewrite.
    expect(reRenderedHtml).toContain(newHeadline)
    expect(reRenderedHtml).not.toContain(headline)
  })

  it('sequential AI rewrite edits persist in source', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'popcorn-mania',
      'popcorn mania website',
    )

    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    const { renderOpenUIToHTML } =
      await import('@ship-fast/engine/openui-ssr.js')

    // First AI rewrite
    const firstRewrite = 'First AI Rewrite'
    const originalHtml = await renderOpenUIToHTML(source, undefined, 'en')
    const firstHtml = originalHtml.replaceAll(headline!, firstRewrite)

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'ai_rewrite',
      targetLabel: 'Hero headline',
      beforeText: headline!,
      afterText: firstRewrite,
      afterHtml: firstHtml,
    })

    // Second AI rewrite — must find the first rewrite in the source
    const secondRewrite = 'Second AI Rewrite'
    const { source: sourceAfterFirst } = await reloadAndRender(t, sessionId)
    const htmlAfterFirst = await renderOpenUIToHTML(
      sourceAfterFirst!,
      undefined,
      'en',
    )
    const secondHtml = htmlAfterFirst.replaceAll(firstRewrite, secondRewrite)

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'ai_rewrite',
      targetLabel: 'Hero headline',
      beforeText: firstRewrite,
      afterText: secondRewrite,
      afterHtml: secondHtml,
    })

    // After reload, the source must contain the second rewrite.
    // BUG: This will FAIL because neither AI rewrite patched the source.
    const { source: reloadedSource } = await reloadAndRender(t, sessionId)
    expect(reloadedSource).toContain(secondRewrite)
    expect(reloadedSource).not.toContain(headline)
  })

  // ─────────────────────────────────────────────────────────────────────
  // TEXT EDIT ON REPEATED TEXT — the same text appears in multiple
  // sections across multiple pages. The edit targets a specific
  // occurrence, but the source must be patched at the right location.
  // ─────────────────────────────────────────────────────────────────────

  it('text edit on repeated text patches the correct occurrence in source', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    // "The Ultimate Guide to Autumn Comfort Foods" appears 3 times in the
    // source: hero headline, stories page story grid, authors page story grid.
    const headline = extractHeadlineFromSource(source)
    expect(headline).toBeTruthy()

    // Count occurrences before edit
    const beforeCount = (
      source.match(
        new RegExp(headline!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ) || []
    ).length
    expect(beforeCount).toBeGreaterThan(1)

    const newHeadline = 'Unique Updated Headline'

    // Edit with occurrenceIndex 0 (the hero — first occurrence)
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Hero headline',
      beforeText: headline!,
      afterText: newHeadline,
      occurrenceIndex: 0,
    })

    const { source: reloadedSource } = await reloadAndRender(t, sessionId)

    // The hero line must contain the new headline
    const heroLine = reloadedSource
      ?.split('\n')
      .find((l: string) => l.includes('_hero ='))
    expect(heroLine).toContain(newHeadline)
    expect(heroLine).not.toContain(headline)

    // The other occurrences (story grids) should still have the old text —
    // they weren't the edit target. But the key invariant is: the EDITED
    // occurrence must persist in the source, not just in the preview HTML.
    // This is what makes the edit survive a reload.
    const remainingOldCount = (
      reloadedSource!.match(
        new RegExp(headline!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ) || []
    ).length
    expect(remainingOldCount).toBe(beforeCount - 1)
  })
})

describe('text edit silent-persistence-failure guard', () => {
  // ─────────────────────────────────────────────────────────────────────
  // Behavioral tests: verify that applySessionEdit correctly throws
  // TEXT_NOT_FOUND when the source patch fails, and that valid edits
  // still persist correctly. These test the actual mutation behavior,
  // not source code structure.
  // ─────────────────────────────────────────────────────────────────────

  it('text edit with beforeText not in source throws TEXT_NOT_FOUND instead of silently persisting', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    // A string that definitely does NOT appear in the real source.
    const absentText = 'ZZZ_THIS_TEXT_DOES_NOT_EXIST_IN_SOURCE_ZZZ'
    expect(source).not.toContain(absentText)

    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: absentText,
        afterText: 'Replacement That Should Never Be Saved',
      }),
    ).rejects.toThrow(/TEXT_NOT_FOUND/)

    // No new preview should have been created with the unpatched source —
    // the source must be unchanged.
    const { source: reloadedSource } = await reloadAndRender(t, sessionId)
    expect(reloadedSource).not.toContain(
      'Replacement That Should Never Be Saved',
    )
    expect(reloadedSource).toBe(source)
  })

  it('text edit with beforeText IN source succeeds and patches source', async () => {
    const t = sessionEditContractTest()
    const { sessionId, source } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    // Find a real text string in the source to edit
    // The food-blog fixture has heading text we can target
    const headingMatch = source.match(/"([^"]{5,30})"/)
    expect(headingMatch).not.toBeNull()
    const originalText = headingMatch![1]
    const newText = 'EDITED_' + originalText.toUpperCase()

    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'text',
      targetLabel: 'Heading',
      beforeText: originalText,
      afterText: newText,
    })

    // Source must be patched with the new text
    const { source: reloadedSource } = await reloadAndRender(t, sessionId)
    expect(reloadedSource).toContain(newText)
  })

  it('text edit that fails source patch does NOT create a new preview version', async () => {
    const t = sessionEditContractTest()
    const { sessionId } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    // Get the current preview version
    const before = await reloadAndRender(t, sessionId)
    const versionBefore = before.reloaded?.session?.previewVersion ?? 0

    // Attempt an edit with text not in source — should throw
    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Heading',
        beforeText: 'NONEXISTENT_TEXT_12345',
        afterText: 'Should Not Persist',
      }),
    ).rejects.toThrow(/TEXT_NOT_FOUND/)

    // Preview version must NOT have incremented (no new preview created)
    const after = await reloadAndRender(t, sessionId)
    expect(after.reloaded?.session?.previewVersion ?? 0).toBe(versionBefore)
  })

  it('ai_rewrite edit with afterHtml does NOT throw TEXT_NOT_FOUND (separate flow)', async () => {
    const t = sessionEditContractTest()
    const { sessionId } = await createReadySessionWithFixture(
      t,
      'food-blog',
      'food blog site',
    )

    // Get version before
    const before = await reloadAndRender(t, sessionId)
    const versionBefore = before.reloaded?.session?.previewVersion ?? 0

    // An ai_rewrite edit with afterHtml should go through the
    // isAiRewriteTextPatchEdit or snapshot path, NOT the isTextPatchEdit
    // path, so it should NOT throw TEXT_NOT_FOUND even if beforeText
    // is not in the source.
    await t.mutation(api.sessions.createEdit, {
      sessionId,
      anonymousOwnerSecret: 'owner-secret',
      editType: 'ai_rewrite',
      targetLabel: 'Hero',
      beforeText: 'some text',
      afterText: 'some new text',
      afterHtml: '<div>New HTML</div>',
    })

    // Should succeed and create a new preview version
    const after = await reloadAndRender(t, sessionId)
    const versionAfter = after.reloaded?.session?.previewVersion ?? 0
    expect(versionAfter).toBeGreaterThan(versionBefore)
  })
})
