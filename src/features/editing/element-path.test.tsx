import { describe, expect, it, vi } from 'vitest'
import {
  buildInspectorSelection,
  findSectionAnchor,
  getElementPath,
  getElementStyleAnchor,
} from './element-path'

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

  it('prefers the section id when the section carries combined attributes (id + class + data-sf-export-page)', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section
        id="combined_hero"
        class="py-24 bg-white"
        data-sf-export-page="Home"
        data-openui-component="CombinedHero"
        data-openui-var="combined_hero"
      >
        <h2>Combined attributes</h2>
      </section>
    `
    const heading = queryHTMLElement(root, 'h2')

    const selection = buildInspectorSelection(root, heading)

    expect(selection.sectionAnchor).toBe('#combined_hero')
    expect(selection.pageLabel).toBe('Home')
    // Legacy capsule fields are still populated for backwards compatibility.
    expect(selection.openuiComponent).toBe('CombinedHero')
    expect(selection.openuiVar).toBe('combined_hero')
  })

  it('preserves the full multi-class string as the section anchor when no id is present', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section class="py-24 bg-muted text-center">
        <h2>Multi-class section</h2>
      </section>
    `
    const heading = queryHTMLElement(root, 'h2')

    const selection = buildInspectorSelection(root, heading)

    expect(selection.sectionAnchor).toBe('py-24 bg-muted text-center')
  })

  it('walks past unanchored nested sections to the nearest anchored ancestor in a deep section hierarchy', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <main>
        <section id="outer_section">
          <section class="middle_section">
            <section>
              <div>
                <h2>Deep heading</h2>
              </div>
            </section>
          </section>
        </section>
      </main>
    `
    const heading = queryHTMLElement(root, 'h2')

    const selection = buildInspectorSelection(root, heading)

    // The innermost <section> has no anchor, so the walk continues outward
    // and lands on the class-anchored middle section — not the outer id.
    expect(selection.sectionAnchor).toBe('middle_section')
  })
})

describe('getElementStyleAnchor', () => {
  const anchorFor = (html: string, selector: string) => {
    const root = document.createElement('div')
    root.innerHTML = html
    return getElementStyleAnchor(queryHTMLElement(root, selector))
  }

  it('returns #id as the highest-priority anchor', () => {
    expect(anchorFor('<section id="hero_main"></section>', 'section')).toBe(
      '#hero_main',
    )
  })

  it('prioritizes id over class, data-sf-export-page and data-openui-var on the same element (combined attributes)', () => {
    const anchor = anchorFor(
      `<section
         id="combined_section"
         class="py-24 bg-white"
         data-sf-export-page="Home"
         data-openui-var="home_hero"
       ></section>`,
      'section',
    )
    expect(anchor).toBe('#combined_section')
  })

  it('prioritizes class over data-sf-export-page and data-openui-var when no id is present', () => {
    const anchor = anchorFor(
      `<section
         class="pricing_grid"
         data-sf-export-page="Pricing"
         data-openui-var="pricing"
       ></section>`,
      'section',
    )
    expect(anchor).toBe('pricing_grid')
  })

  it('prioritizes data-sf-export-page over the legacy data-openui-var marker', () => {
    const anchor = anchorFor(
      '<section data-sf-export-page="Lookbook" data-openui-var="lookbook"></section>',
      'section',
    )
    expect(anchor).toBe('[data-sf-export-page="Lookbook"]')
  })

  it('falls back to data-openui-var only when no DOM-based anchor exists (legacy capsule support)', () => {
    expect(
      anchorFor('<section data-openui-var="legacy_hero"></section>', 'section'),
    ).toBe('[data-openui-var="legacy_hero"]')
  })

  it('returns the full multi-class string, preserving token order', () => {
    expect(
      anchorFor(
        '<section class="py-24 bg-muted text-center"></section>',
        'section',
      ),
    ).toBe('py-24 bg-muted text-center')
  })

  it('ignores whitespace-only class attributes and falls through to the next priority', () => {
    const anchor = anchorFor(
      '<section class="   " data-sf-export-page="Home"></section>',
      'section',
    )
    expect(anchor).toBe('[data-sf-export-page="Home"]')
  })

  it('escapes ids that are not valid bare CSS identifiers', () => {
    const anchor = anchorFor('<section id="hero:main"></section>', 'section')
    expect(anchor).toBe('#hero\\:main')
    // The escaped anchor must resolve back to the same element.
    const root = document.createElement('div')
    root.innerHTML = '<section id="hero:main"></section>'
    expect(root.querySelector(anchor!)).toBe(queryHTMLElement(root, 'section'))
  })

  it('escapes attribute values containing quotes in data anchors', () => {
    expect(
      anchorFor(
        `<section data-sf-export-page='Look"book'></section>`,
        'section',
      ),
    ).toBe('[data-sf-export-page="Look\\"book"]')
  })

  it('returns undefined when the element carries no anchor marker', () => {
    expect(anchorFor('<section></section>', 'section')).toBeUndefined()
    expect(anchorFor('<div><span>plain</span></div>', 'span')).toBeUndefined()
  })
})

describe('findSectionAnchor', () => {
  it('anchors on the nearest section ancestor, innermost first in a deep hierarchy', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <main id="page_main">
        <section id="outer_section">
          <article id="inner_article">
            <div>
              <p>Nested content</p>
            </div>
          </article>
        </section>
      </main>
    `
    const p = queryHTMLElement(root, 'p')

    expect(findSectionAnchor(p)).toBe('#inner_article')
  })

  it('skips sections without anchors and climbs to the nearest anchored ancestor', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section id="anchored_outer">
        <section>
          <section>
            <h2>Deep heading</h2>
          </section>
        </section>
      </section>
    `
    const heading = queryHTMLElement(root, 'h2')

    expect(findSectionAnchor(heading)).toBe('#anchored_outer')
  })

  it('treats [role="region"] as an editable section container', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div role="region" id="region_block">
        <div>
          <p>Region content</p>
        </div>
      </div>
    `
    const p = queryHTMLElement(root, 'p')

    expect(findSectionAnchor(p)).toBe('#region_block')
  })

  it('ignores non-section ancestors even when they carry anchor attributes', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <div id="not_a_section">
        <div class="also_not_a_section">
          <p>Paragraph outside any section</p>
        </div>
      </div>
    `
    const p = queryHTMLElement(root, 'p')

    expect(findSectionAnchor(p)).toBeUndefined()
  })

  it('applies the anchor priority order at the section level (id beats class + data markers)', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section
        id="priority_section"
        class="py-24"
        data-sf-export-page="Home"
        data-openui-var="priority"
      >
        <p>Content</p>
      </section>
    `
    const p = queryHTMLElement(root, 'p')

    expect(findSectionAnchor(p)).toBe('#priority_section')
  })

  it('returns a multi-class section anchor verbatim', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section class="py-24 bg-muted text-center">
        <p>Content</p>
      </section>
    `
    const p = queryHTMLElement(root, 'p')

    expect(findSectionAnchor(p)).toBe('py-24 bg-muted text-center')
  })

  it('anchors on the element itself when it is an editable section', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section id="self_anchored">
        <p>Content</p>
      </section>
    `
    const section = queryHTMLElement(root, 'section')

    expect(findSectionAnchor(section)).toBe('#self_anchored')
  })
})

describe('legacy capsule marker deprecation warnings', () => {
  it('warns once per capsule when a selection relies on data-openui-* markers', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="DeprecationProbe" data-openui-var="probe_a">
        <h2>Probe heading</h2>
        <p>Probe paragraph</p>
      </section>
    `

    buildInspectorSelection(root, queryHTMLElement(root, 'h2'))
    buildInspectorSelection(root, queryHTMLElement(root, 'p'))

    const deprecationWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('DeprecationProbe'),
    )
    expect(deprecationWarnings).toHaveLength(1)
    expect(String(deprecationWarnings[0]?.[0])).toContain(
      '[ship-fast] Deprecated:',
    )
    expect(String(deprecationWarnings[0]?.[0])).toContain(
      'data-openui-component="DeprecationProbe"',
    )
    expect(String(deprecationWarnings[0]?.[0])).toContain(
      'data-openui-var="probe_a"',
    )
  })

  it('warns separately for distinct capsules', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = document.createElement('div')
    root.innerHTML = `
      <section data-openui-component="ProbeOne"><h2>One</h2></section>
      <section data-openui-component="ProbeTwo"><h2>Two</h2></section>
    `
    const headings = Array.from(root.querySelectorAll('h2')).map((heading) =>
      buildInspectorSelection(root, heading),
    )

    expect(headings).toHaveLength(2)
    const messages = warn.mock.calls.map(([message]) => String(message))
    expect(messages.some((message) => message.includes('ProbeOne'))).toBe(true)
    expect(messages.some((message) => message.includes('ProbeTwo'))).toBe(true)
  })

  it('does not warn for HTML sessions without any capsule markers', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = buildDOM()

    buildInspectorSelection(root, queryHTMLElement(root, '.card'))

    expect(warn).not.toHaveBeenCalled()
  })
})
