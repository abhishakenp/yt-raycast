import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const siteSpecJson = JSON.stringify({ projectName: 'Coworking Render' })

async function renderSource(source: string) {
  const result = await buildOpenUIHtmlExport({
    source,
    siteSpecJson,
    sessionId: 'test-session',
    target: 'html',
  })
  return typeof result.body === 'string'
    ? result.body
    : new TextDecoder().decode(result.body)
}

// V3 replaced vertical-specific families with generic, composable sections.
// These fixtures retain the coworking rendering contract: every section must
// SSR through the real OpenUI runtime with authored content visible without
// client-side JavaScript.
describe('generic coworking composition renders through the OpenUI runtime', () => {
  const sections = [
    {
      name: 'Navbar',
      source:
        'root = Navbar({"brand":"Northside","links":["Spaces","Membership"]})',
      mustContain: ['Northside', 'Spaces'],
    },
    {
      name: 'SplitHero',
      source:
        'root = SplitHero("Northside", "Make room for your best work", "your team", "Schedule a tour")',
      mustContain: ['Make room for your best work', 'Schedule a tour'],
    },
    {
      name: 'FeatureList',
      source:
        'root = FeatureList({"features":[{"heading":"Reliable WiFi","description":"Work without interruption."}]})',
      mustContain: ['Reliable WiFi'],
    },
    {
      name: 'PricingTable',
      source:
        'root = PricingTable({"tiers":[{"name":"Hot Desk","price":"$199","features":["24/7 access"]},{"name":"Private Office","price":"$899","features":["Dedicated space"]}]})',
      mustContain: ['Hot Desk', 'Private Office'],
    },
    {
      name: 'TestimonialRow',
      source:
        'root = TestimonialRow({"testimonials":[{"quote":"Northside makes every day better.","author":"Maya Chen"}]})',
      mustContain: ['Maya Chen'],
    },
    {
      name: 'CtaBand',
      source:
        'root = CtaBand({"heading":"Find your desk","cta":"Book a tour"})',
      mustContain: ['Find your desk'],
    },
    {
      name: 'Footer',
      source: 'root = Footer({"brand":"Northside"})',
      mustContain: ['Northside'],
    },
    {
      name: 'ImageGallery',
      source: 'root = ImageGallery()',
      mustContain: [],
    },
  ]

  for (const section of sections) {
    it(`${section.name} renders authored content`, async () => {
      const html = await renderSource(section.source)
      expect(html).not.toContain('Failed to render')
      // Non-trivial DOM must exist inside the export page wrapper.
      expect(html).toMatch(/data-sf-export-page="Home">\s*<[^>]*\s/)
      for (const needle of section.mustContain) {
        expect(html).toContain(needle)
      }
      // SSR must not bake a hidden entrance state into no-JS output: any
      // element with inline opacity 0 must be decorative (aria-hidden) —
      // real content is never allowed to render invisible.
      const dom = new JSDOM(html.replace(/<style>[\s\S]*?<\/style>/g, ''))
      const styled = Array.from(
        dom.window.document.querySelectorAll('[style]'),
      ) as Element[]
      const hidden = styled.filter((el) =>
        /(?:^|;)\s*opacity:\s*0(?:;|$)/.test(el.getAttribute('style') ?? ''),
      )
      for (const el of hidden) {
        expect(el.getAttribute('aria-hidden')).toBe('true')
        expect(el.textContent?.trim() ?? '').toBe('')
      }
    })
  }

  it('a full composed coworking home renders end-to-end', async () => {
    const html = await renderSource(`
root = PageSwitch(["Home"], [home])
home = Stack([
  Navbar({"brand":"Northside","links":["Spaces","Membership"]}),
  SplitHero("Northside", "Make room for your best work", "your team", "Schedule a tour"),
  FeatureList({"features":[{"heading":"Reliable WiFi","description":"Work without interruption."}]}),
  PricingTable({"tiers":[{"name":"Hot Desk","price":"$199","features":["24/7 access"]},{"name":"Private Office","price":"$899","features":["Dedicated space"]}]}),
  TestimonialRow({"testimonials":[{"quote":"Northside makes every day better.","author":"Maya Chen"}]}),
  CtaBand({"heading":"Find your desk","cta":"Book a tour"}),
  Footer({"brand":"Northside"})
])
`)
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Northside')
    expect(html).toContain('Hot Desk')
  })

  it('sections accept authored props', async () => {
    const html = await renderSource(
      `root = SplitHero("Northside", "Now open in Austin", "your team", "every single day")`,
    )
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Now open in Austin')
    expect(html).toContain('every single day')
  })
})
