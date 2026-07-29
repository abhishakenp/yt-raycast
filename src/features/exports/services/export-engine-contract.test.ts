import { describe, expect, it } from 'vitest'

import {
  buildOpenUIExport,
  parseOpenUIForExport,
} from './openui-export-builder'
import { buildOpenUIHtmlExport } from './openui-html-export-builder'

describe('engine output → export pipeline contract', () => {
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
      'home = CenteredHero({"heading":"Welcome"})',
      'about = CenteredHero({"heading":"About us"})',
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
