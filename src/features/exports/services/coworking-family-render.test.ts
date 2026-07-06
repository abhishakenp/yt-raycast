import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'

import { buildOpenUIHtmlExport } from './openui-html-export-builder'

const siteSpecJson = JSON.stringify({ projectName: 'Coworking Render' })

const renderSource = async (source: string) => {
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

// The coworking family was rewritten to a premium animated design (framer
// springs, scroll Reveal, 3D tilt). Every section must still render fully
// with NO props through the real OpenUI runtime + renderToString: framer
// components must SSR to static, VISIBLE markup (no baked-in hidden styles),
// and the section-kit motion helpers must never hide content server-side.
describe('coworking family renders through the OpenUI runtime', () => {
  const sections = [
    { name: 'CoworkingNavbar', mustContain: ['Northside'] },
    { name: 'CoworkingHero', mustContain: ['Schedule', 'Tour'] },
    { name: 'CoworkingFeatures', mustContain: ['WiFi'] },
    { name: 'CoworkingPricing', mustContain: ['Hot Desk', 'Private Office'] },
    { name: 'CoworkingTestimonials', mustContain: ['Maya Chen'] },
    { name: 'CoworkingCta', mustContain: [] },
    { name: 'CoworkingFooter', mustContain: ['Northside'] },
    { name: 'CoworkingGallery', mustContain: [] },
  ]

  for (const section of sections) {
    it(`${section.name} renders with no props`, async () => {
      const html = await renderSource(`root = ${section.name}()`)
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
home = Stack([CoworkingNavbar(), CoworkingHero(), CoworkingFeatures(), CoworkingPricing(), CoworkingTestimonials(), CoworkingCta(), CoworkingFooter()])
`)
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Northside')
    expect(html).toContain('Hot Desk')
  })

  it('sections accept authored props (positional OpenUI call)', async () => {
    const html = await renderSource(
      `root = CoworkingHero("Now open in Austin", "Do your best work", "every single day")`,
    )
    expect(html).not.toContain('Failed to render')
    expect(html).toContain('Now open in Austin')
    expect(html).toContain('every single day')
  })
})
