import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the model so generation is deterministic and offline — same pattern as
// packages/ship-fast-engine/src/genui/v2-compose.test.ts. The mock returns a
// JSON object of section props keyed by the section ids the compose prompt
// requests, and a superagent reply that picks the first listed vertical.
const mocks = ((
  globalThis as typeof globalThis & {
    __v2exportContractMocks?: { generateText: ReturnType<typeof vi.fn> }
  }
).__v2exportContractMocks ??= { generateText: vi.fn() })

vi.mock('@ship-fast/engine/generate.ts', () => ({
  generateText: (...args: unknown[]) =>
    (
      (
        globalThis as typeof globalThis & {
          __v2exportContractMocks: typeof mocks
        }
      ).__v2exportContractMocks.generateText as unknown as (
        ...a: unknown[]
      ) => unknown
    )(...args),
  isHardLlmFailure: () => false,
  formatLlmFailureMessage: (e: unknown) => String(e),
}))

import { runV2ComposedGeneration } from '@ship-fast/engine/genui/v2-compose.ts'
import {
  buildOpenUIExport,
  parseOpenUIForExport,
} from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'

// Extract section ids from the compose prompt's `"<sectionId>": <Signature>` lines.
const sectionIdsFromPrompt = (user: string): string[] =>
  [...user.matchAll(/"([a-z0-9_]+)":\s*[A-Z]/g)].map((m) => m[1])

const richProps = (user: string): string =>
  JSON.stringify(
    Object.fromEntries(
      sectionIdsFromPrompt(user).map((id) => [
        id,
        {
          heading: `Heading ${id}`,
          subheading: 'Sub',
          items: [{ title: 'A' }, { title: 'B' }],
        },
      ]),
    ),
  )

// Mock reply for the first-pass superagent call: pick the first listed vertical
// and fill every listed section role with content.
const superagentReply = (user: string): string => {
  const family =
    (user.match(/Vertical "([A-Za-z0-9]+)"/) ?? [])[1] ?? 'Marketing'
  const keys = [...user.matchAll(/^\s+([a-z0-9]+):\s/gm)].map((m) => m[1])
  const sections = Object.fromEntries(
    [...new Set(keys)].map((k) => [
      k,
      {
        heading: `H ${k}`,
        subheading: 'S',
        items: [{ title: 'A' }, { title: 'B' }],
      },
    ]),
  )
  return JSON.stringify({ family, sections })
}

const signal = new AbortController().signal

/**
 * Regression guard: the export pipeline must accept whatever the current v2
 * composed engine emits. v2-compose.test.ts asserts the OpenUI audit passes on
 * `result.source`, but never runs the export builders on it. The audit and the
 * export share the library schema but the export has extra constraints the
 * audit does not check (manifest source resolution, route/section mapping).
 * This test closes that gap: it generates a real multi-page site with the
 * mocked model and asserts parse + react build + html build all succeed.
 *
 * Would have caught the *KimiPage deletion regression at commit time if the
 * engine had still been emitting those names; catches any future drift where
 * the engine emits components the export pipeline rejects.
 */
describe('engine output → export pipeline contract', () => {
  beforeEach(() => mocks.generateText.mockReset())

  it('parses and builds a composed multi-page site without export errors', async () => {
    mocks.generateText.mockImplementation(async (...a: unknown[]) => {
      const user = String(a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })

    const result = await runV2ComposedGeneration({
      prompt: 'a crm for small sales teams',
      modelId: 'm',
      sessionSeed: 'export-contract-crm',
      signal,
    })

    expect(result.source.length).toBeGreaterThan(0)
    expect(result.routes.length).toBeGreaterThan(0)

    const siteSpecJson = JSON.stringify({ projectName: 'Export Contract' })

    // parse must not throw "unknown components" / "unresolved references"
    const parsed = parseOpenUIForExport(result.source, siteSpecJson)
    expect(parsed.routes).toEqual(result.routes)

    // react zip build must succeed
    const react = await buildOpenUIExport({
      source: result.source,
      siteSpecJson,
      sessionId: 'export-contract-crm',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')

    // html build must succeed
    const html = await buildOpenUIHtmlExport({
      source: result.source,
      siteSpecJson,
      sessionId: 'export-contract-crm',
      target: 'html',
    })
    expect(html.contentType).toBe('text/html; charset=utf-8')
  })

  it('parses and builds a composed commerce site without export errors', async () => {
    mocks.generateText.mockImplementation(async (...a: unknown[]) => {
      const user = String(a[2])
      if (/Candidate verticals/.test(user)) return superagentReply(user)
      return richProps(user)
    })

    const result = await runV2ComposedGeneration({
      prompt: 'beauty store with products and editorial shopping pages',
      modelId: 'm',
      sessionSeed: 'export-contract-beauty',
      familyOverride: 'BeautyStore',
      signal,
    })

    const siteSpecJson = JSON.stringify({ projectName: 'Beauty Contract' })
    expect(() =>
      parseOpenUIForExport(result.source, siteSpecJson),
    ).not.toThrow()
    const react = await buildOpenUIExport({
      source: result.source,
      siteSpecJson,
      sessionId: 'export-contract-beauty',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')
  })

  it('exports a source with URL strings in the PageSwitch targetMap without incomplete errors', async () => {
    // Regression: preprocessOpenUIResponse.repairMalformedQuotedObjectKeys
    // stripped the opening quote from URL string values (e.g.
    // "https://facebook.com/blog") inside the targetMap because "https:"
    // matched the malformed-key regex. This corrupted string boundaries,
    // caused balancePartial to add an extra paren, and made the parser flag
    // meta.incomplete=true — exports failed with "OpenUI source is incomplete".
    const source = [
      'root = PageSwitch(["Home", "About"], [home, about], "", {',
      '"Get Started":"About#about_hero",',
      '"https://facebook.com/blog":"Home#home_hero",',
      '"https://twitter.com/blog":"Home#home_hero"',
      '})',
      'home = CafeHero({"heading":"Welcome"})',
      'about = CafeHero({"heading":"About us"})',
    ].join('\n')

    const siteSpecJson = JSON.stringify({ projectName: 'URL TargetMap' })
    expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    const react = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'url-targetmap',
      target: 'react',
    })
    expect(react.contentType).toBe('application/zip')
    const html = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'url-targetmap',
      target: 'html',
    })
    expect(html.contentType).toBe('text/html; charset=utf-8')
  })
})
