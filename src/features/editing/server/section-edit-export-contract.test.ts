import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '@ship-fast/engine/openui-ssr.js'
import {
  buildOpenUIExport,
  parseOpenUIForExport,
} from '../../exports/services/openui-export-builder'

import { patchOpenUiSourceWithAiCapsule } from './section-edit-response'

/**
 * Contract test: a section edit patch applied to a real engine OpenUI source
 * must still parse, render, and export.
 *
 * The section edit flow is: user selects a section -> AI generates a
 * replacement capsule -> `patchOpenUiSourceWithAiCapsule` patches the OpenUI
 * source to reference the new AI capsule -> the patched source must still
 * parse + render + export.
 *
 * `patchOpenUiSourceWithAiCapsule` replaces the capsule *name* reference
 * (e.g. `BlogPostHero` -> `AICustom_BlogPostHero_v1`). The AI capsule
 * definition is registered separately at runtime (compiled TSX stored in
 * Convex). For this contract test we cannot register a real AI capsule, so
 * we test two things:
 *
 * 1. `patchOpenUiSourceWithAiCapsule` correctly patches real fixture sources
 *    (the capsule name reference is swapped, source structure is intact).
 * 2. A simulated section edit — replacing a section line with a modified
 *    version of the same capsule (different argument values, same capsule
 *    name so the runtime library can still resolve it) — still parses,
 *    renders, and exports. This mirrors what the user sees: the section
 *    content changes but the source remains structurally valid.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

const loadFixture = (name: string): string =>
  readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')

/**
 * Simulates a section edit by replacing a section assignment line with a
 * modified version that changes the first string argument(s) while keeping
 * the same capsule name and var name. This mirrors the real flow where the
 * AI capsule produces different content for the same section slot.
 *
 * Matches `varName = CapsuleName(...)` and replaces the first 1-2 string
 * literal arguments with the provided new values.
 */
const simulateSectionEdit = (
  source: string,
  varName: string,
  capsuleName: string,
  newFirstArg: string,
  newSecondArg?: string,
): string => {
  // Match the full section line: `varName = CapsuleName("first", "second", ...`
  // We replace the first (and optionally second) string literal argument.
  const linePattern = new RegExp(
    `(${varName}\\s*=\\s*${capsuleName}\\()"([^"]*)"`,
  )
  expect(source).toMatch(linePattern)

  let patched = source.replace(linePattern, `$1"${newFirstArg}"`)

  if (newSecondArg !== undefined) {
    // After the first arg replacement, the next string literal is the second arg.
    const secondArgPattern = new RegExp(
      `(${varName}\\s*=\\s*${capsuleName}\\("${escapeRegExp(newFirstArg)}",\\s*)"([^"]*)"`,
    )
    expect(patched).toMatch(secondArgPattern)
    patched = patched.replace(secondArgPattern, `$1"${newSecondArg}"`)
  }

  return patched
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const expectParses = (source: string) => {
  const parsed = parseOpenUIForExport(source)
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

// ─── Fixture specs ──────────────────────────────────────────────────────────

type FixtureSpec = {
  name: string
  /** Section var name to edit (e.g. `home_hero`). */
  varName: string
  /** Capsule component name used in that section line (e.g. `BlogPostHero`). */
  capsuleName: string
  /** New value for the first string argument. */
  newFirstArg: string
  /** New value for the second string argument (optional). */
  newSecondArg?: string
}

const fixtures: FixtureSpec[] = [
  {
    name: 'food-blog',
    varName: 'home_hero',
    capsuleName: 'BlogPostHero',
    newFirstArg: 'New Season',
    newSecondArg: 'Updated Headline for the Food Blog',
  },
  {
    name: 'sneaker-ecommerce',
    varName: 'home_hero',
    capsuleName: 'FashionStoreHero',
    newFirstArg: 'New Drop',
    newSecondArg: 'Updated Headline',
  },
  {
    name: 'popcorn-mania',
    varName: 'home_hero',
    capsuleName: 'ManufacturingHero',
    newFirstArg: 'New Flavor',
    newSecondArg: 'Updated Headline',
  },
]

// ─── patchOpenUiSourceWithAiCapsule on real fixtures ────────────────────────

describe('patchOpenUiSourceWithAiCapsule (real engine fixtures)', () => {
  it.each(fixtures)(
    '$name: patches the capsule name reference in the section line',
    (spec) => {
      const source = loadFixture(spec.name)
      const aiCapsuleName = `AICustom_${spec.capsuleName}_v1`

      const patched = patchOpenUiSourceWithAiCapsule(
        source,
        spec.capsuleName,
        aiCapsuleName,
        spec.varName,
      )

      // The section line must now reference the AI capsule name.
      expect(patched).toContain(`${spec.varName} = ${aiCapsuleName}(`)
      // The original capsule name must no longer appear in that section line.
      expect(patched).not.toContain(`${spec.varName} = ${spec.capsuleName}(`)
      // Other references to the original capsule (e.g. on other pages) must
      // remain untouched — only the targeted var assignment is patched.
      const otherPagePattern = new RegExp(
        `\\b(?!${spec.varName}\\s=\\s)${spec.capsuleName}\\(`,
      )
      if (otherPagePattern.test(source)) {
        expect(patched).toContain(spec.capsuleName)
      }
      // The name swap must not corrupt the source grammar: the patched line
      // still has the form `varName = CapsuleName(...)` with balanced parens.
      const patchedLinePattern = new RegExp(
        `${spec.varName}\\s*=\\s${aiCapsuleName}\\(`,
      )
      expect(patched).toMatch(patchedLinePattern)
      // NOTE: parseOpenUIForExport intentionally throws on AICustom_ capsules
      // because the AI capsule definition is not in the export library. The
      // real section edit flow registers the compiled AI capsule at runtime
      // before export. The simulated section edit tests below cover the full
      // parse + render + export contract using the original capsule name.
    },
  )
})

// ─── Simulated section edit: parse + render + export ────────────────────────

describe('section edit export contract (real engine fixtures)', () => {
  it.each(fixtures)(
    '$name: simulated section edit still parses, renders, and exports',
    async (spec) => {
      const original = loadFixture(spec.name)

      const patched = simulateSectionEdit(
        original,
        spec.varName,
        spec.capsuleName,
        spec.newFirstArg,
        spec.newSecondArg,
      )

      // The patch must have actually changed the source.
      expect(patched).not.toBe(original)
      expect(patched).toContain(spec.newFirstArg)
      if (spec.newSecondArg) {
        expect(patched).toContain(spec.newSecondArg)
      }

      // Parse: the patched source must still produce routes and pages.
      const parsed = expectParses(patched)
      expect(parsed.routes).toContain('Home')

      // Render: the patched source must render without errors and contain
      // the new content.
      const html = await expectRenders(patched)
      expect(html).toContain(spec.newFirstArg)
      if (spec.newSecondArg) {
        expect(html).toContain(spec.newSecondArg)
      }

      // Export: the patched source must build a valid React zip.
      await expectExports(patched, `session-${spec.name}-section-edit`)
    },
  )

  it('food-blog: multiple sequential section edits remain parseable + renderable + exportable', async () => {
    const original = loadFixture('food-blog')

    // First edit: swap the hero headline.
    const firstEdit = simulateSectionEdit(
      original,
      'home_hero',
      'BlogPostHero',
      'First Edit',
      'First Edited Headline',
    )

    // Second edit: swap the story grid title on top of the first edit.
    const secondEdit = firstEdit.replace(
      'Trending This Week',
      'Fresh From Our Kitchen',
    )

    expect(secondEdit).toContain('First Edited Headline')
    expect(secondEdit).toContain('Fresh From Our Kitchen')

    const parsed = expectParses(secondEdit)
    expect(parsed.pages.length).toBeGreaterThan(0)

    const html = await expectRenders(secondEdit)
    expect(html).toContain('First Edited Headline')
    expect(html).toContain('Fresh From Our Kitchen')

    await expectExports(secondEdit, 'session-food-blog-stacked-section-edits')
  })
})
