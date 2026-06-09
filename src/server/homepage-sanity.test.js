import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderHomePage } from './public-pages.js'

const publicDir = join(process.cwd(), 'public')

function assetPathFromHref(href) {
  const pathname = new URL(href, 'http://localhost').pathname
  return join(publicDir, pathname.replace(/^\/+/, ''))
}

describe('homepage critical flow sanity', () => {
  it('renders the generation form, autocomplete, language, auth, and gallery anchors', () => {
    const html = renderHomePage()

    expect(html).toContain('id="prompt-form"')
    expect(html).toContain('id="prompt-input"')
    expect(html).toContain('id="submit-btn"')
    expect(html).toContain('id="prompt-suggestions"')
    expect(html).toContain('id="prompt-suggestions-list"')
    expect(html).toContain('id="prompt-language"')
    expect(html).toContain('value="hinglish"')
    expect(html).toContain('id="auth-overlay"')
    expect(html).toContain('id="session-list"')
    expect(html).toContain('id="session-pagination"')
    expect(html).toContain('href="/terms"')
    expect(html).toContain('href="/privacy"')
  })

  it('links built homepage assets that exist in public', () => {
    const html = renderHomePage()
    const stylesheetHref = html.match(/<link[^>]+href="([^"]*\/styles\/index\.css[^"]*)"/)?.[1]
    const scriptSrc = html.match(/<script[^>]+src="([^"]*\/scripts\/homepage\.js[^"]*)"/)?.[1]
    const rocketSrc = html.match(/<img[^>]+class="launch-rocket"[^>]+src="([^"]+)"/)?.[1]

    expect(stylesheetHref).toBeTruthy()
    expect(scriptSrc).toBeTruthy()
    expect(rocketSrc).toBe('/assets/rocket-transparent.png')
    expect(existsSync(assetPathFromHref(stylesheetHref))).toBe(true)
    expect(existsSync(assetPathFromHref(scriptSrc))).toBe(true)
    expect(existsSync(assetPathFromHref(rocketSrc))).toBe(true)
  })

  it('renders answer-engine metadata and llms.txt discovery', () => {
    const html = renderHomePage()
    const jsonLd = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1]

    expect(html).toContain('rel="alternate" type="text/plain"')
    expect(html).toContain('/llms.txt')
    expect(jsonLd).toBeTruthy()

    const structuredData = JSON.parse(jsonLd)
    expect(structuredData.some((entry) => entry['@type'] === 'Organization')).toBe(true)
    expect(structuredData.some((entry) => entry['@type'] === 'SoftwareApplication')).toBe(true)
    const faq = structuredData.find((entry) => entry['@type'] === 'FAQPage')
    expect(faq?.mainEntity?.length).toBeGreaterThanOrEqual(3)
    expect(JSON.stringify(faq)).toContain('What is Ship Fast?')
    expect(JSON.stringify(structuredData)).toContain('HTML, React, and Next.js exports')
  })
})
