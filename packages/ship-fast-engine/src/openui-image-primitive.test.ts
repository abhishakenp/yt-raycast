import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from './openui-ssr'

// Behavioral guard for the standalone `Image` runtime primitive
// (packages/ship-fast-blocks/src/registry/primitives/image.tsx). Before it
// existed, `Image(...)` in OpenUI source was an unknown-component and rendered
// nothing — images were only reachable as `imageAlt` props inside section
// capsules. Element swaps (text → image) depend on Image being a real,
// individually addressable DSL node.
describe('Image runtime primitive', () => {
  it('renders an <img> resolved from alt text via the pexels proxy', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
root = Image("golden retriever puppy playing in a park")`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('<img')
    expect(html).toContain('/api/pexels?')
    expect(html).toContain('alt="golden retriever puppy playing in a park"')
  })

  it('uses an explicit src URL verbatim, bypassing stock resolution', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
root = Image("team photo", "https://example.com/team.jpg")`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('src="https://example.com/team.jpg"')
    expect(html).not.toContain('/api/pexels')
  })

  it('renders as a child node inside Stack alongside other primitives', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
hero_img = Image("modern office workspace")
hero_text = Text("Welcome to the team")
root = Stack([hero_img, hero_text])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('<img')
    expect(html).toContain('Welcome to the team')
  })

  it('stamps inspector attrs so the element maps back to its statement', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
swap_target = Image("city skyline at dusk")
root = Stack([swap_target])`)

    expect(html).toContain('data-openui-component="Image"')
    expect(html).toContain('data-openui-var="swap_target"')
  })
})
