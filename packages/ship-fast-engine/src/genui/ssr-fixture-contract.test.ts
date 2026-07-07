import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '../openui-ssr'

/**
 * Contract test: every real engine fixture (captured from actual Convex
 * sessions) must render through SSR without crashing, producing valid HTML
 * with no error panels.
 *
 * The existing ssr-render-crashes.test.ts uses hardcoded toy sources like
 * `root = SaasFeatures("Acme", "Intro", null)`. This test loads real
 * multi-page PageSwitch sources with URLs in targetMaps, nested objects,
 * non-ASCII content, and complex component trees — the kind of output the
 * engine actually produces in production.
 *
 * If the SSR renderer breaks on any real engine output, this test catches it
 * before it reaches a demo.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

const loadFixture = (name: string): string =>
  readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')

const expectRenders = async (
  source: string,
  locale = 'en',
): Promise<string> => {
  const html = await renderOpenUIToHTML(source, undefined, locale)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

describe('SSR render contract (real engine fixtures)', () => {
  // Blog family
  it('renders food-blog fixture (5 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('food-blog'))
    expect(html.length).toBeGreaterThan(1000)
    expect(html).toContain('Food Blog')
  })

  it('renders tech-blog fixture (5 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('tech-blog'))
    expect(html.length).toBeGreaterThan(1000)
  })

  it('renders wellness-blog fixture (5 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('wellness-blog'))
    expect(html.length).toBeGreaterThan(1000)
  })

  it('renders dog-blog fixture (2 routes)', async () => {
    const html = await expectRenders(loadFixture('dog-blog'))
    expect(html.length).toBeGreaterThan(500)
  })

  // Ecommerce family
  it('renders sneaker-ecommerce fixture (6 routes)', async () => {
    const html = await expectRenders(loadFixture('sneaker-ecommerce'))
    expect(html.length).toBeGreaterThan(1000)
  })

  it('renders grocery-ecommerce fixture (2 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('grocery-ecommerce'))
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders pizza-ecommerce fixture (2 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('pizza-ecommerce'))
    expect(html.length).toBeGreaterThan(500)
  })

  // SaaS / coffee
  it('renders coffee-shop fixture (4 routes)', async () => {
    const html = await expectRenders(loadFixture('coffee-shop'))
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders coffee-saas-hindi fixture (1 route, Hindi)', async () => {
    const html = await expectRenders(loadFixture('coffee-saas-hindi'), 'hi')
    expect(html.length).toBeGreaterThan(200)
  })

  // Travel / hotel
  it('renders travel-booking fixture (3 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('travel-booking'))
    expect(html.length).toBeGreaterThan(1000)
  })

  // Non-English edge cases
  it('renders wedding-planner-hinglish fixture', async () => {
    const html = await expectRenders(loadFixture('wedding-planner-hinglish'))
    expect(html.length).toBeGreaterThan(100)
  })

  it('renders travel-booking-marathi fixture (3 routes, Marathi)', async () => {
    const html = await expectRenders(
      loadFixture('travel-booking-marathi'),
      'mr',
    )
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders wine-shop-hindi fixture (3 routes, Hindi)', async () => {
    const html = await expectRenders(loadFixture('wine-shop-hindi'), 'hi')
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders movie-fans-hinglish fixture (3 routes, URLs in targetMap)', async () => {
    const html = await expectRenders(loadFixture('movie-fans-hinglish'))
    expect(html.length).toBeGreaterThan(500)
  })

  // Entertainment / playful
  it('renders popcorn-mania fixture (3 routes)', async () => {
    const html = await expectRenders(loadFixture('popcorn-mania'))
    expect(html.length).toBeGreaterThan(1000)
  })
})
