import { describe, expect, it } from 'vitest'

import {
  applyImageSwap,
  applyPreviewTextEdit,
  applyStyleEdit,
} from './edit-helpers'

describe('edit-helpers (shared)', () => {
  it('replaces the selected text occurrence by document order', () => {
    const html = '<nav>Start</nav><main><h1>Start</h1></main>'

    expect(applyPreviewTextEdit(html, 'Start', 'Launch', 1)).toEqual({
      html: '<nav>Start</nav><main><h1>Launch</h1></main>',
      replaced: true,
    })
  })

  it('tolerates inline markup and escapes tolerant replacements', () => {
    const html = '<h1>One <strong>paw</strong> forward</h1>'

    const result = applyPreviewTextEdit(
      html,
      'One paw forward',
      '<script>alert(1)</script>',
    )

    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<h1>&lt;script&gt;alert(1)&lt;/script&gt;</h1>')
  })

  it('does not replace text inside script or style blocks', () => {
    const html =
      '<script>const copy = "Launch";</script><main><h1>Launch</h1></main>'

    expect(applyPreviewTextEdit(html, 'Launch', 'Ship').html).toBe(
      '<script>const copy = "Launch";</script><main><h1>Ship</h1></main>',
    )
  })

  it('updates only the targeted style attribute occurrence', () => {
    const html =
      '<div class="tile" style="color:red">A</div><div class="tile">B</div>'

    expect(applyStyleEdit(html, 'tile', 'color: blue', 1)).toEqual({
      html: '<div class="tile" style="color:red">A</div><div class="tile" style="color: blue">B</div>',
      replaced: true,
    })
  })

  it('replaces image src attributes by alt and occurrence', () => {
    const html =
      '<img alt="product" src="/old-a.png"><img alt="product" src="/old-b.png"><img alt="second" src="/other.png">'

    expect(applyImageSwap(html, 'product', '/new.png', 1)).toEqual({
      html: '<img alt="product" src="/old-a.png"><img alt="product" src="/new.png"><img alt="second" src="/other.png">',
      replaced: true,
    })
  })

  it('matches text containing a ">" stored as &gt; (regression: alternation typo)', () => {
    // The entity alternation for ">" was previously "(?:&gt;>)" which required a
    // literal ">" after the entity, so "&gt;" alone never matched.
    const html = '<p>1 &gt; 2</p>'
    expect(applyPreviewTextEdit(html, '1 > 2', 'one > two').html).toBe(
      '<p>one &gt; two</p>',
    )
  })

  it('matches text containing an en-dash stored as &ndash; (regression: missing pipe)', () => {
    // The alternation was "(?:&ndash;&#8211;|\u2013)" with no pipe between the
    // two entity forms, so "&ndash;" alone never matched.
    const html = '<p>2020 &ndash; 2024</p>'
    expect(applyPreviewTextEdit(html, '2020 \u2013 2024', 'always').html).toBe(
      '<p>always</p>',
    )
  })

  it('matches long text blocks (>500 chars) via the token fallback', () => {
    // Previously selections over 500 chars returned null → no tolerant match →
    // TEXT_NOT_FOUND. The token-based fallback collapses whitespace and still
    // matches when the HTML has collapsed/different whitespace than the input.
    const sentence = 'The quick brown fox jumps over the lazy dog.'
    const longText = Array.from({ length: 20 }, () => sentence).join(' ') // >500 chars, single spaces
    // HTML stores the same text with newlines + indentation (e.g. pretty-printed
    // source), so exact indexOf fails and the tolerant fallback must handle it.
    const html = `<p>\n  ${longText.replace(/ /g, '\n  ')}\n</p>`
    const result = applyPreviewTextEdit(html, longText, 'Replaced long text.')
    expect(result.replaced).toBe(true)
    // The tolerant pattern's leading/trailing bridge markup consumes the
    // surrounding whitespace, so the whole inner run is swapped.
    expect(result.html).toBe('<p>Replaced long text.</p>')
  })

  it('long-text fallback tolerates inline tags splitting the run', () => {
    const sentence = 'Word with emphasis '
    const longText = sentence.repeat(40).trim() // >500 chars
    const html = `<p>${longText.replace(/emphasis/g, '<em>emphasis</em>')}</p>`
    const result = applyPreviewTextEdit(html, longText, 'Done')
    expect(result.replaced).toBe(true)
    // The matched range includes <em> tags; they are replaced with the new
    // text (the user is replacing the entire run, not editing within tags).
    expect(result.html).toBe('<p>Done</p>')
  })

  // --- Tier 3: character-walk fallback tests ---

  it('matches text with numeric entities (decimal + hex) via character walk', () => {
    // These entities are NOT in the regex alternation table, so tier 2 fails.
    // The character walk decodes them and finds the match.
    const html = '<p>Cost: &#8364;100 (&#x20AC;)</p>'
    expect(
      applyPreviewTextEdit(html, 'Cost: \u20AC100 (\u20AC)', 'Free').html,
    ).toBe('<p>Free</p>')
  })

  it('matches text with mixed named + numeric entities', () => {
    const html = '<p>&ldquo;Hello&#8221; &amp; goodbye</p>'
    expect(
      applyPreviewTextEdit(html, '\u201CHello\u201D & goodbye', 'Hi').html,
    ).toBe('<p>Hi</p>')
  })

  it('matches text split across multiple inline tags', () => {
    // Text is "Hello world" but split as Hello <span> </span><em>world</em>
    const html = '<p>Hello <span> </span><em>world</em></p>'
    const result = applyPreviewTextEdit(html, 'Hello world', 'Goodbye')
    expect(result.replaced).toBe(true)
  })

  it('matches text with collapsed whitespace in HTML', () => {
    // HTML has newlines + tabs, target has single spaces. The match range
    // starts at "Hello" and ends at "world"; surrounding whitespace is
    // preserved (it's outside the match).
    const html = '<p>\n  Hello\n    world\n</p>'
    const result = applyPreviewTextEdit(html, 'Hello world', 'Hi')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<p>\n  Hi\n</p>')
  })

  it('replaces across inline tags (tags are part of the replaced range)', () => {
    // When matching "Hello world" across <strong>, the entire matched range
    // (including the tags) is replaced with the new text. This is correct:
    // the user is replacing the whole text run, not editing within tags.
    const html = '<p>Hello <strong>world</strong></p>'
    const result = applyPreviewTextEdit(html, 'Hello world', 'Goodbye')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<p>Goodbye</p>')
  })

  it('replaces across <br> tags', () => {
    const html = '<p>Line one<br>Line two</p>'
    const result = applyPreviewTextEdit(html, 'Line one Line two', 'Replaced')
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<p>Replaced</p>')
  })

  it('handles text with &nbsp; entities', () => {
    const html = '<p>Price:&nbsp;$10</p>'
    expect(applyPreviewTextEdit(html, 'Price: $10', 'Free').replaced).toBe(true)
  })

  it('finds multiple occurrences via character walk with occurrenceIndex', () => {
    // Both occurrences fail tier 1 (entities) and tier 2 (same reason).
    const html = '<p>&ldquo;Hi&#8221;</p><p>&ldquo;Hi&#8221;</p>'
    const result = applyPreviewTextEdit(html, '\u201CHi\u201D', 'Hello', 1)
    expect(result.replaced).toBe(true)
    expect(result.html).toBe('<p>&ldquo;Hi&#8221;</p><p>Hello</p>')
  })

  it('does NOT match text inside HTML attributes (alt, title, etc.)', () => {
    // The topbar title "Brand" also appears as an alt attribute on the hero
    // image. The edit must replace the visible text, not the attribute.
    const html =
      '<nav><h1>Brand</h1></nav><section><img alt="Brand" src="hero.png"></section>'

    const result = applyPreviewTextEdit(html, 'Brand', 'NewCo', 0)

    expect(result.replaced).toBe(true)
    // The visible <h1> text should change, the alt attribute should NOT.
    expect(result.html).toBe(
      '<nav><h1>NewCo</h1></nav><section><img alt="Brand" src="hero.png"></section>',
    )
  })

  it('does NOT match text inside HTML attributes even when attribute comes first', () => {
    // If the img alt appears before the visible text in the HTML string,
    // the edit should still target the visible text, not the attribute.
    const html =
      '<section><img alt="Brand" src="hero.png"></section><nav><h1>Brand</h1></nav>'

    const result = applyPreviewTextEdit(html, 'Brand', 'NewCo', 0)

    expect(result.replaced).toBe(true)
    expect(result.html).toBe(
      '<section><img alt="Brand" src="hero.png"></section><nav><h1>NewCo</h1></nav>',
    )
  })

  it('matches only visible text occurrences for occurrenceIndex counting', () => {
    // Two visible occurrences + one attribute occurrence. occurrenceIndex=1
    // should target the second VISIBLE text, skipping the attribute.
    const html =
      '<nav><h1>Brand</h1></nav><section><img alt="Brand" src="x.png"><h2>Brand</h2></section>'

    const result = applyPreviewTextEdit(html, 'Brand', 'NewCo', 1)

    expect(result.replaced).toBe(true)
    expect(result.html).toBe(
      '<nav><h1>Brand</h1></nav><section><img alt="Brand" src="x.png"><h2>NewCo</h2></section>',
    )
  })

  // ─── OpenUI source: quoted-string matching (Tier 0) ───────────────────
  // In OpenUI source, string args are quoted: FoodDeliveryCta("...", "go").
  // Short text like "go" must match the quoted "go" argument, NOT substrings
  // of JSON keys like "category" or other words in the source.

  it('OpenUI: matches quoted "go" argument, not "go" inside "category"', () => {
    const source =
      'home_restaurants = FoodDeliveryRestaurants("Title", "Desc", "View All", [{"name":"Pizza","cuisine":"American","category":"Thin Crust"}])\n' +
      'home_cta = FoodDeliveryCta("Ready?", "Download!", "a", "go")'

    const result = applyPreviewTextEdit(source, 'go', 'g', 0)

    expect(result.replaced).toBe(true)
    // CTA line should be changed
    expect(result.html).toContain('"g")')
    // Restaurants line should NOT be changed
    expect(result.html).toContain('"category":"Thin Crust"')
  })

  it('OpenUI: matches quoted "a" argument, not "a" inside other words', () => {
    const source =
      'home_navbar = FoodDeliveryNavbar("Pizza Place", ["Home"], "/", "Sign In", "Order")\n' +
      'home_cta = FoodDeliveryCta("Ready?", "Download!", "a", "go")'

    const result = applyPreviewTextEdit(source, 'a', 'App Store', 0)

    expect(result.replaced).toBe(true)
    expect(result.html).toContain('"App Store", "go"')
    // Navbar should NOT be changed
    expect(result.html).toContain('"Pizza Place"')
    expect(result.html).toContain('"Sign In"')
  })

  it('OpenUI: deletion (go -> "") replaces quoted "go" with empty string', () => {
    const source =
      'home_cta = FoodDeliveryCta("Ready?", "Download!", "a", "go")'

    const result = applyPreviewTextEdit(source, 'go', '', 0)

    expect(result.replaced).toBe(true)
    expect(result.html).toBe(
      'home_cta = FoodDeliveryCta("Ready?", "Download!", "a", "")',
    )
  })

  it('OpenUI: does NOT match quoted string inside HTML attribute values', () => {
    // HTML source: alt="Brand" should NOT be matched as a quoted "Brand" argument
    const html = '<img alt="Brand" src="x.png"><h1>Brand</h1>'

    const result = applyPreviewTextEdit(html, 'Brand', 'NewCo', 0)

    expect(result.replaced).toBe(true)
    // Should match the visible <h1>Brand</h1>, not the alt="Brand"
    expect(result.html).toBe('<img alt="Brand" src="x.png"><h1>NewCo</h1>')
  })

  it('OpenUI: occurrenceIndex counts only quoted-string matches', () => {
    const source =
      'home_restaurants = FoodDeliveryRestaurants("Title", "go", "View All", [])\n' +
      'home_cta = FoodDeliveryCta("Ready?", "Download!", "a", "go")'

    // occurrenceIndex=0 should match the first "go" (restaurants line)
    const r0 = applyPreviewTextEdit(source, 'go', 'GO1', 0)
    expect(r0.html).toContain('"GO1"')
    expect(r0.html).toContain('"a", "go")')

    // occurrenceIndex=1 should match the second "go" (CTA line)
    const r1 = applyPreviewTextEdit(source, 'go', 'GO2', 1)
    expect(r1.html).toContain('"go"')
    expect(r1.html).toContain('"a", "GO2")')
  })
})
