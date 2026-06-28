import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '@ship-fast/engine/openui-ssr.js'
import {
  buildOpenUIExport,
  parseOpenUIForExport,
} from '../../exports/services/openui-export-builder'

/**
 * Contract test: a chat refinement patch applied to a real engine OpenUI
 * source must still parse, render, and export.
 *
 * The chat refinement flow is: user sends a chat message -> LLM produces a
 * refinement plan -> the plan patches the OpenUI source (text replacements,
 * headline/CTA swaps, appended refinement-note comments) -> the patched
 * source must still parse + render + export.
 *
 * The Convex server helpers that perform the actual patching
 * (`buildChatRefinedOpenUiSource` in convex/lib/chat_refinement_helpers.ts)
 * are not directly importable from a vitest test (they live in Convex server
 * context). This test simulates the same kinds of patches those helpers
 * apply — exact text replacements and appended `// ship-fast-chat-refinement`
 * note comments — and asserts the key invariant: a patched real engine
 * source must still be parseable, renderable, and exportable.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

const loadFixture = (name: string): string =>
  readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')

/**
 * Simulates the `replacements[]` entry from a ChatRefinementPlan: an exact
 * visible/source text swap. Mirrors `applyPreviewTextEdit` as used by
 * `buildChatRefinedOpenUiSource`.
 */
const applyTextReplacement = (
  source: string,
  oldText: string,
  newText: string,
): string => {
  expect(source).toContain(oldText)
  return source.replace(oldText, newText)
}

/**
 * Simulates `appendOpenUiRefinementNote` from chat_refinement_helpers.ts,
 * which appends a `// ship-fast-chat-refinement:<version>` comment block to
 * the patched source. The renderer/parser must tolerate these trailing
 * comments.
 */
const appendRefinementNote = (
  source: string,
  instruction: string,
  summary: string,
  previewVersion: number,
): string =>
  `${source.trimEnd()}\n// ship-fast-chat-refinement:${previewVersion}\n// instruction: ${instruction}\n// summary: ${summary}`

const expectParses = (source: string, siteSpecJson?: string) => {
  const parsed = parseOpenUIForExport(source, siteSpecJson)
  expect(parsed.root).toBeDefined()
  expect(parsed.pages.length).toBeGreaterThan(0)
  expect(parsed.routes.length).toBeGreaterThan(0)
  return parsed
}

const expectRenders = async (source: string): Promise<string> => {
  const html = await renderOpenUIToHTML(source)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

const expectExports = async (source: string, sessionId: string) => {
  const exported = await buildOpenUIExport({
    source,
    sessionId,
    target: 'react',
  })
  expect(exported.body).toBeDefined()
  expect(exported.fileCount).toBeGreaterThan(0)
  expect(exported.filename).toMatch(/\.zip$/)
  return exported
}

describe('chat refinement export contract (real engine fixtures)', () => {
  it('food-blog: patched source still parses, renders, and exports', async () => {
    const original = loadFixture('food-blog')

    // Simulate a refinement plan: swap the hero headline + append a note.
    const patchedHeadline = applyTextReplacement(
      original,
      'The Ultimate Guide to Autumn Comfort Foods',
      "Cozy Autumn Kitchens: A Home Cook's Companion",
    )
    const patched = appendRefinementNote(
      patchedHeadline,
      'Make the headline warmer and more inviting',
      'Updated the hero headline.',
      2,
    )

    expect(patched).not.toBe(original)
    expect(patched).toContain('Cozy Autumn Kitchens')

    const parsed = expectParses(patched)
    expect(parsed.routes).toContain('Home')

    const html = await expectRenders(patched)
    expect(html).toContain('Cozy Autumn Kitchens')

    await expectExports(patched, 'session-food-blog')
  })

  it('sneaker-ecommerce: patched source still parses, renders, and exports', async () => {
    const original = loadFixture('sneaker-ecommerce')

    // Simulate a refinement plan: swap the hero title + CTA label + note.
    const patchedTitle = applyTextReplacement(
      original,
      'Step Into the Future',
      'Own the Streets',
    )
    const patchedCta = applyTextReplacement(
      patchedTitle,
      'Shop Now',
      'Grab Your Drop',
    )
    const patched = appendRefinementNote(
      patchedCta,
      'Change the hero title and CTA to be bolder',
      'Updated the hero title and primary CTA.',
      3,
    )

    expect(patched).toContain('Own the Streets')
    expect(patched).toContain('Grab Your Drop')

    const parsed = expectParses(patched)
    expect(parsed.routes.length).toBeGreaterThanOrEqual(3)

    const html = await expectRenders(patched)
    expect(html).toContain('Own the Streets')

    await expectExports(patched, 'session-sneaker-ecommerce')
  })

  it('popcorn-mania: patched source still parses, renders, and exports', async () => {
    const original = loadFixture('popcorn-mania')

    // Simulate a refinement plan: swap the hero subtitle + a pricing blurb.
    const patchedSubtitle = applyTextReplacement(
      original,
      'Gourmet popcorn delivered fresh to your door',
      'Small-batch gourmet popcorn, roasted and shipped the same day',
    )
    const patched = appendRefinementNote(
      patchedSubtitle,
      'Rewrite the hero subtitle to emphasize freshness',
      'Updated the hero subtitle.',
      1,
    )

    expect(patched).toContain('Small-batch gourmet popcorn')

    const parsed = expectParses(patched)
    expect(parsed.routes).toContain('Home')

    const html = await expectRenders(patched)
    expect(html).toContain('Small-batch gourmet popcorn')

    await expectExports(patched, 'session-popcorn-mania')
  })

  it('multiple sequential refinement patches remain parseable + renderable', async () => {
    // Simulate a second chat turn stacking on top of the first: the note
    // regex in chat_refinement_helpers strips the prior note before appending
    // a new one, so we replicate that cleanup + re-append to mirror reality.
    const original = loadFixture('food-blog')
    const firstPatch = applyTextReplacement(
      original,
      'The Ultimate Guide to Autumn Comfort Foods',
      'First Refinement Headline',
    )
    const firstNoted = appendRefinementNote(
      firstPatch,
      'first turn',
      'first summary',
      1,
    )

    // Second turn: strip the prior note (as CHAT_OPENUI_REFINEMENT_RE does)
    // then apply a new replacement + new note.
    const stripped = firstNoted.replace(
      /\n*\/\/ ship-fast-chat-refinement:\d+\n\/\/ instruction: .*\n\/\/ summary: .*/g,
      '',
    )
    const secondPatch = applyTextReplacement(
      stripped,
      'First Refinement Headline',
      'Second Refinement Headline',
    )
    const secondNoted = appendRefinementNote(
      secondPatch,
      'second turn',
      'second summary',
      2,
    )

    expect(secondNoted).toContain('Second Refinement Headline')
    expect(secondNoted).not.toContain('First Refinement Headline')
    // Only one refinement note block should remain.
    expect(
      (secondNoted.match(/\/\/ ship-fast-chat-refinement:\d+/g) ?? []).length,
    ).toBe(1)

    const parsed = expectParses(secondNoted)
    expect(parsed.pages.length).toBeGreaterThan(0)

    const html = await expectRenders(secondNoted)
    expect(html).toContain('Second Refinement Headline')

    await expectExports(secondNoted, 'session-food-blog-stacked')
  })
})
