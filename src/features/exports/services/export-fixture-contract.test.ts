import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  parseOpenUIForExport,
  buildOpenUIExport,
} from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'

/**
 * Contract test: every real engine fixture (captured from actual Convex
 * sessions) must be parseable and exportable (both React zip and HTML).
 *
 * The existing export tests use toy sources like `root = Stack([Text("hello")])`.
 * This test loads real multi-page PageSwitch sources with URLs in targetMaps,
 * nested objects, non-ASCII content, and complex component trees — the kind
 * of output the engine actually produces in production.
 *
 * This is the test that would have caught the original export bug where
 * preprocessOpenUIResponse.repairMalformedQuotedObjectKeys stripped quotes
 * from URL strings in the targetMap, causing exports to fail with
 * "OpenUI source is incomplete".
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')
}

const siteSpecJson = JSON.stringify({ projectName: 'Fixture Contract Test' })

type FixtureSpec = {
  name: string
  locale?: string
}

const fixtures: FixtureSpec[] = [
  // Blog family
  { name: 'food-blog' },
  { name: 'tech-blog' },
  { name: 'wellness-blog' },
  { name: 'dog-blog' },
  // Ecommerce family
  { name: 'sneaker-ecommerce' },
  { name: 'grocery-ecommerce' },
  { name: 'pizza-ecommerce' },
  // SaaS / coffee — coffee-shop uses AICustom_ capsules from section edits
  { name: 'coffee-shop' },
  { name: 'coffee-saas-hindi', locale: 'hi' },
  // Travel
  { name: 'travel-booking' },
  // Non-English
  { name: 'wedding-planner-hinglish' },
  { name: 'travel-booking-marathi', locale: 'mr' },
  { name: 'wine-shop-hindi', locale: 'hi' },
  { name: 'movie-fans-hinglish' },
  // Entertainment
  { name: 'popcorn-mania' },
]

describe('export fixture contract (real engine fixtures)', () => {
  describe.each(fixtures)('$name', (spec) => {
    const source = loadFixture(spec.name)

    // ALL fixtures — including AI capsule and interactive state sources —
    // must parse, render, and export. These are real user sessions. If they
    // can't be exported, that's a bug, not a "known limitation." The tests
    // should FAIL to expose the bug, not skip silently.
    it('parses without throwing', () => {
      expect(() => parseOpenUIForExport(source, siteSpecJson)).not.toThrow()
    })

    it('parse result has routes', () => {
      const parsed = parseOpenUIForExport(source, siteSpecJson)
      expect(parsed.routes.length).toBeGreaterThan(0)
    })

    it('builds a React zip export', async () => {
      const result = await buildOpenUIExport({
        source,
        siteSpecJson,
        sessionId: `fixture-${spec.name}`,
        target: 'react',
      })
      expect(result.contentType).toBe('application/zip')
    })

    it('builds an HTML export', async () => {
      const result = await buildOpenUIHtmlExport({
        source,
        siteSpecJson,
        sessionId: `fixture-${spec.name}`,
        target: 'html',
      })
      expect(result.contentType).toBe('text/html; charset=utf-8')
    })
  })
})
