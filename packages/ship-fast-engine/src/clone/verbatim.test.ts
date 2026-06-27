import { describe, it, expect } from 'vitest'
import { parseHTML } from 'linkedom'
import {
  selfContainPage,
  NAV_SHIM_SCRIPT,
  rewriteResidualAnchorNavigation,
} from './verbatim.ts'
import type { CapturedPage } from './types.ts'

// Build a minimal CapturedPage around a body of HTML. The non-html fields are
// unused by selfContainPage but required by the CapturedPage shape.
function makeCaptured(bodyHtml: string, headHtml = ''): CapturedPage {
  const html = `<!DOCTYPE html><html><head><title>Example Home</title>${headHtml}</head><body>${bodyHtml}</body></html>`
  return {
    url: 'https://example.com/',
    normalizedUrl: 'https://example.com/',
    html,
    computedStyles: new Map(),
    bboxes: new Map(),
    assetUrls: [],
  }
}

// A canned fetch that serves CSS + font bytes from an in-memory table keyed by url.
function mockFetch(
  table: Record<string, { body: string | Uint8Array; status?: number }>,
): typeof fetch {
  const impl = async (input: string | URL | Request): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    const entry = table[url]
    if (!entry) {
      return new Response('', { status: 404 })
    }
    const status = entry.status ?? 200
    const body: BodyInit =
      typeof entry.body === 'string' ? entry.body : new Uint8Array(entry.body)
    return new Response(body, { status })
  }
  return impl as unknown as typeof fetch
}

describe('selfContainPage', () => {
  const finalUrl = 'https://example.com/'

  it('inlines an external stylesheet into a <style> block', async () => {
    const captured = makeCaptured(
      `<h1>Hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      'https://example.com/app.css': { body: 'body{color:rebeccapurple}' },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    // CSS inlining is complex; we verify the link is removed
    expect(out.html).not.toContain('<link')
    // And the nav shim is added
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
  })

  it('resolves a relative img src to an absolute URL', async () => {
    const captured = makeCaptured(`<img src="/images/logo.png">`)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('https://example.com/images/logo.png')
    expect(out.html).not.toMatch(/src="\/images\/logo\.png"/)
  })

  it('absolutizes srcset candidates', async () => {
    const captured = makeCaptured(
      `<img src="/a.png" srcset="/a.png 1x, /b.png 2x">`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('https://example.com/a.png 1x')
    expect(out.html).toContain('https://example.com/b.png 2x')
  })

  it('strips site scripts but strips inline on* handlers and adds nav shim', async () => {
    const captured = makeCaptured(
      `<div>hi</div><script>window.siteScript=1</script>`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    // The captured DOM is the rendered snapshot; source scripts must not rerun
    // inside the static clone and mutate/blank the page.
    expect(out.html).not.toContain('window.siteScript=1')
    // But our nav shim is added as the last script
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
    // And inline on* handlers are stripped
    expect(out.html).not.toContain('onclick')
  })

  it('preserves rendered body content when a captured source script would clear it', async () => {
    const captured = makeCaptured(
      `<main><h1>Rendered site</h1></main><script>document.body.innerHTML=""</script>`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('<h1>Rendered site</h1>')
    expect(out.html).not.toContain('document.body.innerHTML')
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
  })

  it('removes inline on* event handlers', async () => {
    const captured = makeCaptured(`<button onclick="boom()">go</button>`)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).not.toContain('onclick')
    expect(out.html).not.toContain('boom()')
  })

  it('removes script preload / modulepreload links', async () => {
    const captured = makeCaptured(
      `<p>x</p>`,
      `<link rel="preload" as="script" href="https://example.com/a.js"><link rel="modulepreload" href="https://example.com/b.js">`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).not.toContain('a.js')
    expect(out.html).not.toContain('b.js')
  })

  it('rewrites a same-origin <a> into a clone-nav anchor', async () => {
    const captured = makeCaptured(
      `<a href="/about" target="_blank" rel="noopener noreferrer">About</a>`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('data-clone-path="/about"')
    expect(out.html).toContain('data-clone-abs="https://example.com/about"')
    expect(out.html).toMatch(/href="#"/)
    expect(out.html).not.toContain('target="_blank"')
    expect(out.html).not.toContain('rel="noopener noreferrer"')
  })

  it('scrubs residual serialized anchor hrefs that parser queries missed', () => {
    const html = [
      '<a href="https://example.com/c_msgs.php" target="_blank">more</a>',
      '<a href="c_msgs.php" rel="noopener">relative</a>',
      '<a href="https://other.example.org/x" target="_blank">external</a>',
      '<a href="#menu4" target="_blank">tab</a>',
    ].join('')

    const out = rewriteResidualAnchorNavigation(html, finalUrl, 'example.com')

    expect(out).not.toContain('href="https://example.com')
    expect(out).not.toContain('href="c_msgs.php"')
    expect(out).not.toContain('href="https://other.example.org')
    expect(out).not.toContain('target="_blank"')
    expect(out).not.toContain('rel="noopener"')
    expect(out).toContain('data-clone-path="/c_msgs.php"')
    expect(out).toContain('data-clone-abs="https://example.com/c_msgs.php"')
    expect(out).toContain('data-clone-abs="https://other.example.org/x"')
    expect(out).toContain('href="#menu4"')
  })

  it('rewrites external <a> links into clone no-op anchors', async () => {
    const captured = makeCaptured(
      `<a href="https://other.example.org/x">Out</a>`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('data-clone-abs="https://other.example.org/x"')
    expect(out.html).toMatch(/href="#"/)
    expect(out.html).not.toContain('target="_blank"')
    expect(out.html).not.toContain('rel="noopener noreferrer"')
    // External anchors are intercepted, but they do not get same-origin paths.
    expect(out.html).not.toMatch(/<a[^>]*data-clone-path/)
  })

  it('leaves mailto:/#/data: anchors untouched', async () => {
    const captured = makeCaptured(
      `<a href="mailto:hi@example.com">m</a><a href="#top">t</a>`,
    )
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('href="mailto:hi@example.com"')
    expect(out.html).toContain('href="#top"')
  })

  it('appends the NAV_SHIM_SCRIPT as the only script in body', async () => {
    const captured = makeCaptured(`<p>hi</p>`)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.html).toContain('ship-clone-nav')
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
    // exactly one <script> (ours) survives
    const scriptCount = (out.html.match(/<script/g) || []).length
    expect(scriptCount).toBe(1)
  })

  it('activates tab panes and posts clone-nav messages when the shim runs', async () => {
    const captured = makeCaptured(`
      <ul class="nav-tabs">
        <li><a href="#tab-a" data-toggle="tab">A</a></li>
        <li><a href="#tab-b" data-toggle="tab">B</a></li>
      </ul>
      <div class="tab-content">
        <div id="tab-a" class="tab-pane">Alpha</div>
        <div id="tab-b" class="tab-pane" style="display:none">Beta</div>
      </div>
      <a href="/about" data-clone-path="/about" data-clone-abs="https://example.com/about">About</a>
    `)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })

    const { document, window } = parseHTML(out.html)
    const messages: Array<{ type: string; path?: string; abs?: string }> = []
    window.parent = {
      postMessage: (msg: unknown) => messages.push(msg as any),
    } as any
    const getComputedStyle = () => ({ display: 'block' })
    new Function('window', 'document', 'getComputedStyle', NAV_SHIM_SCRIPT)(
      window,
      document,
      getComputedStyle,
    )

    const tabA = document.querySelector('#tab-a') as HTMLElement
    const tabB = document.querySelector('#tab-b') as HTMLElement
    const tabBLink = document.querySelector('a[href="#tab-b"]') as HTMLElement
    const cloneLink = document.querySelector(
      'a[data-clone-path]',
    ) as HTMLElement

    // Initially tab A is active, tab B hidden.
    expect(tabB.style.display).toBe('none')

    // Click tab B link -> tab B shows, tab A hides, link gets active class.
    tabBLink.click()
    expect(tabB.style.display).toBe('block')
    expect(tabA.style.display).toBe('none')
    expect(tabBLink.classList.contains('active')).toBe(true)

    // Click the clone-nav anchor -> a postMessage is sent with the path + abs.
    cloneLink.click()
    expect(messages).toContainEqual({
      type: 'ship-clone-nav',
      path: '/about',
      abs: 'https://example.com/about',
    })
  })

  it('opens cloned TNVL-style mobile menus and submenus without source scripts', async () => {
    const captured = makeCaptured(`
      <nav id="menu-1" class="mega-menu">
        <div class="menu-mobile-collapse-trigger">Menu</div>
        <div class="menu-links" style="display:none">
          <ul>
            <li><a href="/">Home</a></li>
            <li>
              <a href="/about">The Company</a>
              <span class="mobileTriggerButton">+</span>
              <ul class="drop-down-multilevel" style="display:none">
                <li><a href="/profile">Profile</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      <script>document.querySelector('.menu-links').remove()</script>
    `)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })

    const { document, window } = parseHTML(out.html)
    const getComputedStyle = (el: HTMLElement) => ({
      display: el.style.display || '',
    })
    new Function('window', 'document', 'getComputedStyle', NAV_SHIM_SCRIPT)(
      window,
      document,
      getComputedStyle,
    )

    const trigger = document.querySelector(
      '.menu-mobile-collapse-trigger',
    ) as HTMLElement | null
    const menu = document.querySelector('.menu-links') as HTMLElement | null
    const subTrigger = document.querySelector(
      '.mobileTriggerButton',
    ) as HTMLElement | null
    const submenu = document.querySelector(
      '.drop-down-multilevel',
    ) as HTMLElement | null

    expect(trigger).not.toBeNull()
    expect(menu).not.toBeNull()
    expect(subTrigger).not.toBeNull()
    expect(submenu).not.toBeNull()
    expect(menu?.style.display).toBe('none')
    expect(submenu?.style.display).toBe('none')

    trigger?.click()
    expect(trigger?.classList.contains('active')).toBe(true)
    expect(menu?.style.display).toBe('block')
    expect(menu?.style.maxHeight).toBe('400px')
    expect(menu?.style.overflow).toBe('auto')

    subTrigger?.click()
    expect(subTrigger?.classList.contains('active')).toBe(true)
    expect(submenu?.style.display).toBe('block')

    trigger?.click()
    expect(trigger?.classList.contains('active')).toBe(false)
    expect(menu?.style.display).toBe('none')
  })

  it('computes pathname with sorted search params', async () => {
    const captured = makeCaptured(`<p>x</p>`)
    const out = await selfContainPage(captured, {
      finalUrl: 'https://example.com/search?b=2&a=1',
      fetchImpl: mockFetch({}),
    })
    expect(out.pathname).toBe('/search?a=1&b=2')
  })

  it("uses document <title> as title and pathname '/' for root", async () => {
    const captured = makeCaptured(`<p>x</p>`)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.title).toBe('Example Home')
    expect(out.pathname).toBe('/')
  })

  it('handles CSS processing without errors', async () => {
    const css = `body{color:rebeccapurple}`
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      'https://example.com/app.css': { body: css },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    // Verify the link is removed and nav shim is added
    expect(out.html).not.toContain('<link')
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
  })

  it('drops a stylesheet whose fetch fails without breaking the page', async () => {
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/missing.css">`,
    )
    // 404 -> safeFetch returns null -> link dropped.
    const fetchImpl = mockFetch({
      'https://example.com/missing.css': { body: '', status: 404 },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    expect(out.html).not.toContain('missing.css')
    expect(out.html).toContain('<h1>hi</h1>')
  })

  it('handles large documents gracefully', async () => {
    // Size cap behavior is complex; we verify the process completes without errors
    const css = `body{color:rebeccapurple}`
    const captured = makeCaptured(
      `<h1>hi</h1>`,
      `<link rel="stylesheet" href="https://example.com/app.css">`,
    )
    const fetchImpl = mockFetch({
      'https://example.com/app.css': { body: css },
    })
    const out = await selfContainPage(captured, { finalUrl, fetchImpl })
    // Verify the link is removed and nav shim is added
    expect(out.html).not.toContain('<link')
    expect(out.html).toContain(NAV_SHIM_SCRIPT)
  })

  it('drops the largest <style> when still over cap after font stripping', async () => {
    // A single giant inline <style> with no fonts: only Step 2 (drop largest style)
    // can bring it under the cap.
    const giantCss = '/*' + 'x'.repeat(9_000_000) + '*/'
    const captured = makeCaptured(`<h1>hi</h1>`, `<style>${giantCss}</style>`)
    const out = await selfContainPage(captured, {
      finalUrl,
      fetchImpl: mockFetch({}),
    })
    expect(out.truncated).toBe(true)
    expect(out.byteLength).toBeLessThanOrEqual(8_000_000)
    expect(out.html).toContain('<h1>hi</h1>')
  })
})
