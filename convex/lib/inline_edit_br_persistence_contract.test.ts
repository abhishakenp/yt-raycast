import { register as registerDebouncer } from '@ikhrustalev/convex-debouncer/test'
import { convexTest } from 'convex-test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { api, internal } from '../_generated/api'
import schema from '../schema'
import { applyPreviewTextEdit } from './session_edit_helpers'

const modules = import.meta.glob('../**/*.ts')

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')
}

let activeTest: ReturnType<typeof convexTest> | null = null

const sessionEditContractTest = () => {
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

  const { renderOpenUIToHTML } = await import('@ship-fast/engine/openui-ssr.js')
  const html = await renderOpenUIToHTML(source, undefined, language)

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    openUiSource: source,
    siteSpecJson: JSON.stringify({ projectName: prompt }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 1000,
  })

  return { sessionId, source, html }
}

/**
 * Strip HTML tags and comments from a string to approximate textContent.
 * Used to extract visible text from HTML fragments that contain inline
 * markup (e.g. <span> highlight markers on the last word of a heading).
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<!--[^>]*-->/g, '').replace(/<[^>]+>/g, '')
}

/**
 * Find a <br> separated hero in the HTML.
 * The real pizza-delivery fixture renders:
 *   <h1 ...>Craving Something Hot?<br/>Pizza Delivered<!-- --> <span ...>Fast</span></h1>
 * The second fragment may contain inline markup (highlight spans, comments)
 * so we capture the raw inner HTML after <br/> and derive textContent by
 * stripping tags.
 */
function findBrSeparatedHero(html: string): {
  fullMatch: string
  textContent: string
  firstFragment: string
  secondFragment: string
} | null {
  // Match <h1...>text<br/>...content...</h1> (br may be <br> or <br/>)
  // The first fragment is pure text (before <br>); the second fragment may
  // contain inline elements (spans, comments) so capture non-greedily.
  const match = html.match(/<h1[^>]*>([^<]+)<br\s*\/?>(.*?)<\/h1>/)
  if (!match) return null
  const [, first, secondRaw] = match
  const second = stripHtmlTags(secondRaw)
  return {
    fullMatch: match[0],
    textContent: `${first}${second}`,
    firstFragment: first,
    secondFragment: second,
  }
}

describe('inline edit persistence — <br> separated text nodes', () => {
  // ─────────────────────────────────────────────────────────────────────
  // UNIT TEST: applyPreviewTextEdit with <br> separated text
  // The diffEdits fallback in useTextEdit produces oldText from
  // element.textContent, which strips <br> tags. This creates a string
  // that doesn't exist in the stored HTML. applyPreviewTextEdit can't
  // find it and returns replaced: false, causing the mutation to throw
  // TEXT_NOT_FOUND.
  // ─────────────────────────────────────────────────────────────────────

  it('applyPreviewTextEdit finds text within a single <br> fragment', () => {
    const html = '<h1>Craving Something Hot?<br/>Pizza Delivered Fast</h1>'
    const result = applyPreviewTextEdit(
      html,
      'Pizza Delivered Fast',
      'Pizza Delivered NOW',
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('Pizza Delivered NOW')
  })

  it('applyPreviewTextEdit FAILS when oldText is flattened textContent spanning <br>', () => {
    // This is what diffEdits produces when the user selects across a <br>:
    // it falls back to element.textContent which strips the <br>, producing
    // "Craving Something Hot?Pizza Delivered Fast" — a string that does NOT
    // exist in the HTML (the <br/> tag is between the two fragments).
    const html = '<h1>Craving Something Hot?<br/>Pizza Delivered Fast</h1>'
    const flattenedText = 'Craving Something Hot?Pizza Delivered Fast'
    const result = applyPreviewTextEdit(
      html,
      flattenedText,
      'Craving Something Hot?Pizza Delivered NOW',
    )
    // BUG: This will FAIL — the flattened text doesn't exist in the HTML
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('Pizza Delivered NOW')
  })

  it('applyPreviewTextEdit with space-separated text spanning <br>', () => {
    // User might type the text with a space between sentences
    const html = '<h1>Craving Something Hot?<br/>Pizza Delivered Fast</h1>'
    const result = applyPreviewTextEdit(
      html,
      'Craving Something Hot? Pizza Delivered Fast',
      'Craving Something Hot? Pizza Delivered NOW',
    )
    // BUG: This will likely FAIL — the HTML has <br/> not a space
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('Pizza Delivered NOW')
  })

  // ─────────────────────────────────────────────────────────────────────
  // INTEGRATION TEST: Full createEdit mutation with real pizza fixture
  // Uses the pizza-delivery-real fixture captured from a real user session.
  // The hero renders as <h1>Craving Something Hot?<br/>Pizza Delivered<!-- --> <span...>Fast</span></h1>
  // (the last word of headingBottom gets a highlight marker span).
  // ─────────────────────────────────────────────────────────────────────

  it('createEdit with single-fragment text edit on real pizza fixture persists', async () => {
    const t = sessionEditContractTest()
    const { sessionId, html } = await createReadySessionWithFixture(
      t,
      'pizza-delivery-real',
      'pizza delivery app',
    )

    // Verify "Pizza Delivered Fast" is in the HTML textContent.
    // The hero's headingBottom is now split by a highlight <span> on the
    // last word, so the raw HTML has "Pizza Delivered<!-- --> <span...>Fast</span>"
    // rather than a contiguous "Pizza Delivered Fast" string.
    const brHero = findBrSeparatedHero(html)
    expect(brHero).toBeTruthy()
    expect(brHero?.secondFragment).toBe('Pizza Delivered Fast')

    // Edit just "Pizza Delivered Fast" → "Pizza Delivered NOW"
    // applyPreviewTextEdit's tolerant matching tiers handle the inline
    // <span> markup around "Fast".
    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero subtitle',
        beforeText: 'Pizza Delivered Fast',
        afterText: 'Pizza Delivered NOW',
      }),
    ).resolves.toMatchObject({ saved: true })

    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Pizza Delivered NOW')
    expect(reloaded?.latestPreview?.openUiSource).toContain(
      'Pizza Delivered NOW',
    )
  })

  it('createEdit with flattened textContent spanning <br> on real pizza fixture', async () => {
    const t = sessionEditContractTest()
    const { sessionId, html } = await createReadySessionWithFixture(
      t,
      'pizza-delivery-real',
      'pizza delivery app',
    )

    // Verify the HTML has a <br/> separated hero
    const brHero = findBrSeparatedHero(html)
    expect(brHero).toBeTruthy()
    expect(brHero?.firstFragment).toBe('Craving Something Hot?')
    expect(brHero?.secondFragment).toBe('Pizza Delivered Fast')

    // Simulate what diffEdits produces when the user selects across the <br/>:
    // oldText = element.textContent (strips <br/>) = "Craving Something Hot?Pizza Delivered Fast"
    // newText = the edited textContent = "Craving Something Hot?Pizza Delivered NOW"
    const flattenedOld = brHero!.textContent
    const flattenedNew = 'Craving Something Hot?Pizza Delivered NOW'

    // BUG: This will throw TEXT_NOT_FOUND because the flattened text
    // "Craving Something Hot?Pizza Delivered Fast" doesn't exist in the
    // HTML (the <br/> tag is between the two fragments).
    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: flattenedOld,
        afterText: flattenedNew,
      }),
    ).resolves.toMatchObject({ saved: true })

    // If the edit succeeds, verify it persisted
    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Pizza Delivered NOW')
  })

  it('createEdit with space-separated text spanning <br> on real pizza fixture', async () => {
    const t = sessionEditContractTest()
    const { sessionId, html } = await createReadySessionWithFixture(
      t,
      'pizza-delivery-real',
      'pizza delivery app',
    )

    const brHero = findBrSeparatedHero(html)
    expect(brHero).toBeTruthy()

    // User types the text with a space between sentences (as it appears visually)
    const oldText = 'Craving Something Hot? Pizza Delivered Fast'
    const newText = 'Craving Something Hot? Pizza Delivered NOW'

    // BUG: This will likely fail because the HTML has <br/> not a space
    await expect(
      t.mutation(api.sessions.createEdit, {
        sessionId,
        anonymousOwnerSecret: 'owner-secret',
        editType: 'text',
        targetLabel: 'Hero headline',
        beforeText: oldText,
        afterText: newText,
      }),
    ).resolves.toMatchObject({ saved: true })

    const reloaded = await t.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    expect(reloaded?.homeModule?.source).toContain('Pizza Delivered NOW')
  })
})
