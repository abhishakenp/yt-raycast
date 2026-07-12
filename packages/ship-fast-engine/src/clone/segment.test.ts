import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'

import { extractNavLinks, extractPageNavLinks, segmentPage } from './segment.ts'
import type { CapturedPage } from './types.ts'

function page(html: string, url = 'https://site.com/'): CapturedPage {
  return {
    url,
    normalizedUrl: url,
    html,
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls: [],
  }
}

function fullPage(inner: string): string {
  return `<!doctype html><html><head><title>T</title></head><body>${inner}</body></html>`
}

function kinds(sections: { kind: string }[]): string[] {
  return sections.map((s) => s.kind)
}

describe('clone segment — segmentPage', () => {
  it('returns [] for an empty body document', () => {
    expect(segmentPage(page(fullPage('')))).toEqual([])
  })

  it('returns [] when there is no <body> (bare fragment)', () => {
    // A fragment with no body element parses to an empty body in linkedom.
    expect(segmentPage(page('<div>no body here</div>'))).toEqual([])
  })

  it('segments a basic page into header/nav/main/footer sections', () => {
    const html = fullPage(`
      <header><a href="/">Site</a></header>
      <nav><a href="/">Home</a><a href="/about">About</a></nav>
      <main>
        <section class="hero"><h1>Welcome</h1><p>Build faster.</p></section>
        <section class="features"><h2>Features</h2><p>Fast and easy.</p></section>
      </main>
      <footer><span>© 2024</span></footer>
    `)
    const sections = segmentPage(page(html))
    const detected = kinds(sections)
    expect(detected).toContain('header')
    expect(detected).toContain('nav')
    expect(detected).toContain('footer')
    // <main> wraps the hero/features bands; it is kept whole as one content
    // section rather than shattered (top-level partition stops at body's kids).
    expect(detected).toContain('content')
  })

  it('detects hero and features when sections are direct body children', () => {
    const html = fullPage(`
      <header><a href="/">Site</a></header>
      <nav><a href="/">Home</a></nav>
      <section class="hero"><h1>Welcome</h1><p>Build faster.</p></section>
      <section class="features"><h2>Features</h2><p>Fast and easy.</p></section>
      <footer><span>© 2024</span></footer>
    `)
    const detected = kinds(segmentPage(page(html)))
    expect(detected).toContain('hero')
    expect(detected).toContain('features')
  })

  it('detects nav via <nav> tag', () => {
    const html = fullPage('<nav><a href="/">Home</a><a href="/x">X</a></nav>')
    expect(kinds(segmentPage(page(html)))).toContain('nav')
  })

  it('detects header via <header> tag', () => {
    const html = fullPage('<header><a href="/">Site</a></header>')
    expect(kinds(segmentPage(page(html)))).toContain('header')
  })

  it('detects footer via <footer> tag', () => {
    const html = fullPage('<footer><span>© 2024</span></footer>')
    expect(kinds(segmentPage(page(html)))).toContain('footer')
  })

  it('detects hero via class token', () => {
    const html = fullPage(
      '<section class="hero"><h1>Welcome</h1><p>Build faster.</p></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('hero')
  })

  it('detects pricing via class token', () => {
    const html = fullPage(
      '<section class="pricing"><h2>Pricing</h2><p>$10/mo plan</p></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('pricing')
  })

  it('detects testimonials via class token', () => {
    const html = fullPage(
      '<section class="testimonials"><h2>Reviews</h2><p>Great quote.</p></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('testimonials')
  })

  it('detects features via class token', () => {
    const html = fullPage(
      '<section class="features"><h2>Features</h2><p>Fast and easy.</p></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('features')
  })

  it('detects cta via class token with a button', () => {
    const html = fullPage(
      '<section class="cta"><h2>Get started</h2><button>Sign up</button></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('cta')
  })

  it('detects blog via <article> tag', () => {
    const html = fullPage(
      '<article><h2>Post title</h2><p>Body of the post.</p></article>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('blog')
  })

  it('detects gallery via class token', () => {
    const html = fullPage(
      '<section class="gallery"><h2>Gallery</h2><img src="/a.jpg" alt="a" /><img src="/b.jpg" alt="b" /></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('gallery')
  })

  it('detects sidebar via <aside> tag', () => {
    const html = fullPage(
      '<aside><h3>Related</h3><a href="/r">Related link</a></aside>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('sidebar')
  })

  it('detects about via class token', () => {
    const html = fullPage(
      '<section class="about"><h2>About us</h2><p>Our story.</p></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('about')
  })

  it('detects contact via class token', () => {
    const html = fullPage(
      '<section class="contact"><h2>Contact</h2><form><input /></form></section>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('contact')
  })

  it('detects content as the default kind', () => {
    const html = fullPage(
      '<main><div><h2>Overview</h2><p>Some general content here.</p></div></main>',
    )
    expect(kinds(segmentPage(page(html)))).toContain('content')
  })

  it('detects a blog index (link-list region with 3+ anchors) as content', () => {
    const html = fullPage(`
      <main>
        <section>
          <h1>Blog</h1>
          <ul>
            <li><a href="/p1">First post</a></li>
            <li><a href="/p2">Second post</a></li>
            <li><a href="/p3">Third post</a></li>
          </ul>
        </section>
      </main>
    `)
    const sections = segmentPage(page(html))
    // The link-list region is primary content, not a heading stub.
    expect(kinds(sections)).toContain('content')
    // And it must not be reduced to a heading-only stub: it carries anchors.
    const contentSection = sections.find((s) => s.kind === 'content')
    expect(contentSection?.html).toContain('<a')
  })

  it('filters heading-only stubs (keeps body-bearing sections)', () => {
    // A bare <h1> with no body content is a degenerate stub and is dropped,
    // while a section with a paragraph survives.
    const html = fullPage(`
      <main>
        <section><h1>Just a title</h1></section>
        <section><h2>Real section</h2><p>This has body content.</p></section>
      </main>
    `)
    const sections = segmentPage(page(html))
    const htmls = sections.map((s) => s.html)
    expect(htmls.some((h) => h.includes('Just a title'))).toBe(false)
    expect(htmls.some((h) => h.includes('Real section'))).toBe(true)
  })

  it('keeps a row-structured table whole as a single section', () => {
    const html = fullPage(`
      <main>
        <section>
          <h2>Schedule</h2>
          <table>
            <tr><td>10/24</td><td><a href="/p1">Steve Ballmer</a></td></tr>
            <tr><td>10/25</td><td><a href="/p2">Another talk</a></td></tr>
          </table>
        </section>
      </main>
    `)
    const sections = segmentPage(page(html))
    // The table is not shattered into per-row sections.
    const tableSections = sections.filter((s) => s.html.includes('<table'))
    expect(tableSections.length).toBe(1)
  })

  it('keeps a row-structured ul (2+ li) whole as a single section', () => {
    const html = fullPage(`
      <main>
        <section>
          <h2>Links</h2>
          <ul>
            <li><a href="/a">A link with text</a></li>
            <li><a href="/b">B link with text</a></li>
          </ul>
        </section>
      </main>
    `)
    const sections = segmentPage(page(html))
    const ulSections = sections.filter((s) => s.html.includes('<ul'))
    expect(ulSections.length).toBe(1)
  })

  it('never returns an empty array when the page has any renderable content', () => {
    const html = fullPage('<main><h1>Only a heading</h1></main>')
    const sections = segmentPage(page(html))
    expect(sections.length).toBeGreaterThan(0)
  })

  it('emits sections in document order', () => {
    const html = fullPage(`
      <header><a href="/">Site</a></header>
      <nav><a href="/">Home</a></nav>
      <main><section class="hero"><h1>Welcome</h1></section></main>
      <footer><span>© 2024</span></footer>
    `)
    const sections = segmentPage(page(html))
    // header should appear before footer in the emitted order.
    const headerIdx = sections.findIndex((s) => s.kind === 'header')
    const footerIdx = sections.findIndex((s) => s.kind === 'footer')
    expect(headerIdx).toBeGreaterThanOrEqual(0)
    expect(footerIdx).toBeGreaterThan(headerIdx)
  })
})

describe('clone segment — extractNavLinks', () => {
  function root(html: string): Element {
    const { document } = parseHTML(`<div id="__r">${html}</div>`)
    return document.getElementById('__r')!
  }

  it('extracts hrefs from a <nav> landmark', () => {
    const el = root('<nav><a href="/">Home</a><a href="/about">About</a></nav>')
    expect(extractNavLinks(el)).toEqual(['/', '/about'])
  })

  it('extracts hrefs from a <header> landmark', () => {
    const el = root(
      '<header><a href="/">Home</a><a href="/blog">Blog</a></header>',
    )
    expect(extractNavLinks(el)).toEqual(['/', '/blog'])
  })

  it('returns [] when there are no nav/header landmarks', () => {
    const el = root(
      '<main><a href="/not-nav">Not nav</a><a href="/x">X</a></main>',
    )
    expect(extractNavLinks(el)).toEqual([])
  })

  it('de-duplicates anchors shared by nested landmarks (header > nav)', () => {
    // The nav sits inside the header; both are landmarks. The SAME <a> elements
    // live inside the nav (and thus inside the header). Without anchor-identity
    // de-dup, each anchor would be collected twice (once per landmark region).
    const el = root(
      '<header><nav><a href="/">Home</a><a href="/p">P</a></nav></header>',
    )
    expect(extractNavLinks(el)).toEqual(['/', '/p'])
  })

  it('detects nav landmark via role=navigation', () => {
    const el = root(
      '<div role="navigation"><a href="/">Home</a><a href="/x">X</a></div>',
    )
    expect(extractNavLinks(el)).toEqual(['/', '/x'])
  })

  it('detects header landmark via role=banner', () => {
    const el = root(
      '<div role="banner"><a href="/">Home</a><a href="/y">Y</a></div>',
    )
    expect(extractNavLinks(el)).toEqual(['/', '/y'])
  })

  it('skips anchors without an href', () => {
    const el = root('<nav><a>Home</a><a href="/p">P</a></nav>')
    expect(extractNavLinks(el)).toEqual(['/p'])
  })
})

describe('clone segment — extractPageNavLinks', () => {
  it('extracts nav links from a captured page', () => {
    const captured = page(
      fullPage(
        '<header><a href="/">Home</a></header><nav><a href="/about">About</a></nav>',
      ),
    )
    expect(extractPageNavLinks(captured)).toEqual(['/', '/about'])
  })

  it('returns [] when the page has no body', () => {
    expect(extractPageNavLinks(page('<div>no body</div>'))).toEqual([])
  })

  it('returns [] when there are no nav/header landmarks', () => {
    expect(
      extractPageNavLinks(page(fullPage('<main><a href="/x">X</a></main>'))),
    ).toEqual([])
  })
})
