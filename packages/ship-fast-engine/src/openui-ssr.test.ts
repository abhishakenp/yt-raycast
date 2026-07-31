import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML, renderOpenUIToHTMLWithTheme } from './openui-ssr'

describe('renderOpenUIToHTML', () => {
  it('renders simple text OpenUI source without an error shell', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
root = Text("Dashboard browser verifier")`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Dashboard browser verifier')
  })

  it('renders simple text through the themed SSR entrypoint used by Convex completion', async () => {
    const { html } = await renderOpenUIToHTMLWithTheme(
      'root = Text("Convex OpenUI SSR smoke")',
      undefined,
      'en',
      undefined,
    )

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Convex OpenUI SSR smoke')
  })

  it('renders a CardGrid page when generated cards are null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = CardGrid("Features", "Plan your week", "", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Plan your week')
  })

  it('renders DB-observed GroupedList output with malformed generated group text into real content', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home_menu = GroupedList("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"categories[Seasonal Releases","items":[{"title":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7"},{"title":"Chocolate Stout","description":"Rich cocoa and roasted malt","price":"$8"},{"title":"Year-Round Classics>Portland Pale Ale","description":"Balanced hop profile with citrus aroma","price":"$6"},{"title":"Hoppy IPA","description":"Bold bitterness with pine and mango","price":"$7"}]}])
root = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})`)

    expect(html).not.toContain('openui-error')
    expect(html).not.toContain('Generated OpenUI source is ready')
    expect(html).not.toContain('ship-fast-openui-source')
    expect(html).toContain('Our Brew Selection')
    expect(html).toContain('Pineapple Saison')
    expect(html).toContain('Chocolate Stout')
  })
})

// Behavioral guard: a model can emit an outer-array item that OMITS its nested
// inner array, or pass null for the whole nested array. Each section below
// renders such an item and must NOT crash (the unguarded `inner.map` regression)
// — it must produce real markup, not an `openui-error` shell.
describe('section inner-array rendering safety', () => {
  it('CardGrid renders when cards is null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = CardGrid("Features", "Browse our features", "", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Browse our features')
  })

  it('CardGrid renders when a card omits its nested fields', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = CardGrid("Features", "Browse our features", "", [{title: "Fast"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Browse our features')
    expect(html).toContain('Fast')
  })

  it('GroupedList renders when groups is null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = GroupedList("Menu", "", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Menu')
  })

  it('GroupedList renders when a group omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = GroupedList("Menu", "", [{name: "Starters"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Menu')
    expect(html).toContain('Starters')
  })

  it('TestimonialRow renders when testimonials is null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = TestimonialRow("Praise", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Praise')
  })

  it('TestimonialRow renders when a testimonial omits optional nested fields', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = TestimonialRow("Praise", null, [{quote: "Loved it", author: "Sam"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Praise')
    expect(html).toContain('Loved it')
  })

  it('PricingTable renders when tiers is null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = PricingTable("Pricing", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Pricing')
  })

  it('PricingTable renders when a tier omits features', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = PricingTable("Pricing", [{name: "Starter", price: "$0"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Pricing')
    expect(html).toContain('Starter')
  })

  it('FaqAccordion renders when items is null', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FaqAccordion("FAQ", null)`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('FAQ')
  })

  it('FaqAccordion renders when an item omits optional nested fields', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FaqAccordion("FAQ", [{question: "How does it work?", answer: "Easily"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('FAQ')
    expect(html).toContain('How does it work?')
  })
})
