import { describe, expect, it } from 'vitest'
import { buildInspectorSelection, getElementPath } from './element-path'

const buildDOM = () => {
  const root = document.createElement('div')
  root.innerHTML = `
    <section id="hero">
      <div class="card">
        <h2>Hello world</h2>
        <p>Some paragraph text</p>
      </div>
      <div class="card"><p>Second card</p></div>
    </section>
  `
  return root
}

function queryHTMLElement(root: HTMLElement, selector: string) {
  const element = root.querySelector(selector)
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected ${selector} to match an HTMLElement`)
  }
  return element
}

describe('getElementPath', () => {
  it('builds a path with ids and nth-of-type indices', () => {
    const root = buildDOM()
    const h2 = queryHTMLElement(root, 'h2')
    expect(getElementPath(root, h2)).toBe(
      'section#hero > div:nth-of-type(1) > h2:nth-of-type(1)',
    )
  })

  it('returns the tag when the element is the root', () => {
    const root = buildDOM()
    const section = queryHTMLElement(root, '#hero')
    // section is a direct child of root; path is relative to root
    expect(getElementPath(root, section)).toBe('section#hero')
  })
})

describe('buildInspectorSelection', () => {
  it('serializes tag, path, text and outerHTML without mutating the DOM', () => {
    const root = buildDOM()
    const card = queryHTMLElement(root, '.card')
    const before = card.outerHTML
    const selection = buildInspectorSelection(root, card)
    expect(selection.tag).toBe('div')
    expect(selection.elementPath).toBe('section#hero > div:nth-of-type(1)')
    expect(selection.textContent).toBe('Hello world Some paragraph text')
    expect(selection.outerHTML).toContain('<div class="card">')
    expect(selection.boundingBox).toBeDefined()
    // No mutation: the element is untouched after building the selection.
    expect(card.outerHTML).toBe(before)
    expect(card.getAttribute('style')).toBeNull()
  })

  it('omits temporary inline editor artifacts from AI selection HTML without mutating the live element', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="FashionHero" data-openui-var="home_hero">
        <h1
          class="hero-title"
          contenteditable="true"
          data-ship-fast-inline-editing="true"
          style="color: rgb(255, 0, 0); outline: 2px solid hsl(var(--primary)); outline-offset: 2px; cursor: text;"
        >
          Dreamy Pastel Delight<br contenteditable="false">
        </h1>
      </section>
    `
    const heading = queryHTMLElement(root, 'h1')
    const before = heading.outerHTML

    const selection = buildInspectorSelection(root, heading)

    expect(selection.outerHTML).toContain('class="hero-title"')
    expect(selection.outerHTML).toContain('color: rgb(255, 0, 0)')
    expect(selection.outerHTML).not.toContain('contenteditable')
    expect(selection.outerHTML).not.toContain('data-ship-fast-inline-editing')
    expect(selection.outerHTML).not.toContain('outline')
    expect(selection.outerHTML).not.toContain('cursor: text')
    expect(heading.outerHTML).toBe(before)
    expect(heading.getAttribute('contenteditable')).toBe('true')
    expect(heading.dataset.shipFastInlineEditing).toBe('true')
  })

  it('omits transient translation shimmer artifacts from AI selection HTML without mutating the live element', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="FashionHero" data-openui-var="home_hero">
        <h1
          class="hero-title shimmer text-muted-foreground"
          style="background-image: linear-gradient(90deg, transparent, currentColor); background-clip: text; -webkit-background-clip: text; color: transparent;"
        >
          Dreamy Pastel Delight
        </h1>
      </section>
    `
    const heading = queryHTMLElement(root, 'h1')
    const before = heading.outerHTML

    const selection = buildInspectorSelection(root, heading)

    expect(selection.outerHTML).toContain('class="hero-title"')
    expect(selection.outerHTML).not.toContain('shimmer')
    expect(selection.outerHTML).not.toContain('text-muted-foreground')
    expect(selection.outerHTML).not.toContain('background-image')
    expect(selection.outerHTML).not.toContain('background-clip')
    expect(selection.outerHTML).not.toContain('color: transparent')
    expect(heading.outerHTML).toBe(before)
    expect(heading.classList.contains('shimmer')).toBe(true)
    expect(heading.classList.contains('text-muted-foreground')).toBe(true)
    expect(heading.style.color).toBe('transparent')
  })

  it('truncates long text content to 500 chars and collapses whitespace', () => {
    const root = document.createElement('div')
    const p = document.createElement('p')
    p.textContent = '  '.concat('a'.repeat(800))
    root.appendChild(p)
    const selection = buildInspectorSelection(root, p)
    expect(selection.textContent.length).toBeLessThanOrEqual(500)
    expect(selection.textContent).not.toMatch(/^\s/)
  })

  it('extracts openuiComponent + openuiVar from nearest ancestor with data attrs', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="SaasHero" data-openui-var="hero">
        <div class="card">
          <h2>Hello</h2>
        </div>
      </section>
    `
    const h2 = queryHTMLElement(root, 'h2')
    const selection = buildInspectorSelection(root, h2)
    expect(selection.openuiComponent).toBe('SaasHero')
    expect(selection.openuiVar).toBe('hero')
  })

  it('extracts openuiComponent when element itself has the data attr', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="EcommerceNavbar" data-openui-var="navbar">
        <nav>Links</nav>
      </section>
    `
    const section = queryHTMLElement(root, 'section')
    const selection = buildInspectorSelection(root, section)
    expect(selection.openuiComponent).toBe('EcommerceNavbar')
    expect(selection.openuiVar).toBe('navbar')
  })

  it('leaves openuiComponent/openuiVar undefined when no data attrs present (HTML sessions)', () => {
    const root = buildDOM()
    const card = queryHTMLElement(root, '.card')
    const selection = buildInspectorSelection(root, card)
    expect(selection.openuiComponent).toBeUndefined()
    expect(selection.openuiVar).toBeUndefined()
  })

  it('extracts the exported page label from the nearest data-sf-export-page ancestor', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-sf-export-page="Home">
        <h1>Home hero</h1>
      </section>
      <section data-sf-export-page="Lookbook">
        <main>
          <h1>Lookbook hero</h1>
        </main>
      </section>
    `
    const heading = queryHTMLElement(
      root,
      'section[data-sf-export-page="Lookbook"] h1',
    )

    const selection = buildInspectorSelection(root, heading)

    expect(selection.pageLabel).toBe('Lookbook')
  })

  it('extracts a durable section anchor from the nearest editable section ancestor', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <main>
        <section id="newsletter_newsletter" class="py-24">
          <div>
            <h2 class="section-title">Join the newsletter</h2>
          </div>
        </section>
      </main>
    `
    const heading = queryHTMLElement(root, 'h2')

    const selection = buildInspectorSelection(root, heading)

    expect(selection.sectionAnchor).toBe('#newsletter_newsletter')
  })

  it('handles data-openui-var being absent while data-openui-component is present', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div data-openui-component="BlogFooter">
        <p>Footer text</p>
      </div>
    `
    const p = queryHTMLElement(root, 'p')
    const selection = buildInspectorSelection(root, p)
    expect(selection.openuiComponent).toBe('BlogFooter')
    expect(selection.openuiVar).toBeUndefined()
  })
})
