import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  resolveBrandfetchBrandProfile: vi.fn(),
  materializeBrandfetchLogoToWorkspace: vi.fn(),
}))

vi.mock('../brandfetch.js', () => ({
  resolveBrandfetchBrandProfile: mocks.resolveBrandfetchBrandProfile,
  materializeBrandfetchLogoToWorkspace:
    mocks.materializeBrandfetchLogoToWorkspace,
}))

const htmlResponse = (url: string, html: string) =>
  ({
    ok: true,
    url,
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    text: async () => html,
  }) as Response

const missingResponse = (url: string) =>
  ({
    ok: false,
    url,
    headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
    text: async () => '',
  }) as Response

const readProfile = (workspace: string) =>
  JSON.parse(readFileSync(join(workspace, 'brand-profile.json'), 'utf8'))

type BrandProfile = {
  requestedName: string
  officialName: string
  officialUrl: string
  logoUrl: string
  faviconUrl: string
  logo: { provider?: string; svg?: string } | null
  palette?: { primary?: string } | null
  description: string
  emails: string[]
  phones: string[]
  addresses: string[]
  socials: Array<{ url: string }>
  sourceUrls: string[]
  confidence: number
  verified: boolean
}

type EnrichBrandProfile = (
  prompt: string,
  workspace: string,
  log?: (line: string) => void,
) => Promise<BrandProfile | null>

const requireProfile = (profile: BrandProfile | null): BrandProfile => {
  if (profile === null) throw new Error('Expected brand profile')
  return profile
}

describe('brand profile enrichment', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.resolveBrandfetchBrandProfile.mockReset()
    mocks.materializeBrandfetchLogoToWorkspace.mockReset()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('extracts brand candidates from common prompt shapes', async () => {
    const { extractOrganizationCandidate, promptLooksBrandDriven } =
      await import('./brand-profile.js')

    expect(
      extractOrganizationCandidate('Build a website for "Kaveri Silks".'),
    ).toBe('Kaveri Silks')
    expect(
      extractOrganizationCandidate(
        'Create a homepage for the brand Asha Health, with appointment booking.',
      ),
    ).toBe('the brand Asha Health')
    expect(promptLooksBrandDriven('https://linear.app redesign')).toBe(true)
    expect(
      promptLooksBrandDriven('A generic SaaS dashboard with pricing'),
    ).toBe(true)
  })

  it('uses verified Brandfetch data before scraping the web', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const enrich = enrichBrandProfile as unknown as EnrichBrandProfile
    const workspace = mkdtempSync(
      join(tmpdir(), 'ship-fast-brandfetch-profile-'),
    )
    const log: string[] = []

    mocks.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: true,
      match: {
        name: 'Linear',
        domain: 'linear.app',
        officialUrl: 'https://linear.app',
      },
      logo: {
        kind: 'remote',
        src: 'https://cdn.brandfetch.io/linear/logo.svg',
        provider: 'brandfetch',
        confidence: 0.95,
        alt: 'Linear',
      },
      palette: {
        primary: '#5e6ad2',
        secondary: '#111111',
        accent: '#ffffff',
        provider: 'brandfetch',
      },
    })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const profile = requireProfile(
      await enrich(
        'Build a landing page for the company Linear.',
        workspace,
        (line: string) => {
          log.push(line)
        },
      ),
    )

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(profile.verified).toBe(true)
    expect(profile.officialName).toBe('Linear')
    expect(profile.officialUrl).toBe('https://linear.app')
    expect(profile.logoUrl).toBe('https://cdn.brandfetch.io/linear/logo.svg')
    expect(profile.palette?.primary).toBe('#5e6ad2')
    expect(log.join('\n')).toContain('logo=yes')
    expect(readProfile(workspace).logo.provider).toBe('brandfetch')
  })

  it('scrapes explicit official websites when Brandfetch cannot verify the brand', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const enrich = enrichBrandProfile as unknown as EnrichBrandProfile
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-scraped-profile-'))

    mocks.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: false,
      error: 'No Brandfetch match found',
      status: 404,
    })

    const homepage = `<!doctype html>
      <html>
        <head>
          <title>Kaveri Silks | Handloom Sarees</title>
          <meta name="description" content="Handloom sarees and bridal silks from Bengaluru.">
          <meta property="og:site_name" content="Kaveri Silks">
          <link rel="icon" href="/favicon.ico">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "name": "Kaveri Silks",
              "description": "Handloom sarees, bridal silks, and custom blouse tailoring.",
              "email": "hello@kaverisilks.test",
              "telephone": "+91 98765 43210",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "12 Silk Road",
                "addressLocality": "Bengaluru",
                "addressRegion": "KA",
                "postalCode": "560001",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://instagram.com/kaverisilks/reels/123",
                "https://facebook.com/kaverisilks/posts/456"
              ],
              "logo": "/assets/logo.svg"
            }
          </script>
        </head>
        <body>
          <img src="/assets/header-logo.svg" alt="Kaveri Silks logo" class="site-logo">
          <p>Handloom sarees and bridal silks made with artisan weaving partners across Karnataka. Email care@kaverisilks.test for custom orders.</p>
          <a href="mailto:care@kaverisilks.test">Email</a>
          <a href="tel:+919876543210">Call</a>
          <a href="https://instagram.com/kaverisilks/stories/latest">Instagram</a>
          <a href="/about">About Kaveri</a>
        </body>
      </html>`

    const about = `<!doctype html>
      <html><body>
        <p>Kaveri Silks has served wedding families and handloom collectors for three generations.</p>
      </body></html>`

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const href = String(url)
        if (
          href === 'https://kaverisilks.test' ||
          href === 'https://kaverisilks.test/'
        )
          return htmlResponse('https://kaverisilks.test/', homepage)
        if (href === 'https://kaverisilks.test/about')
          return htmlResponse(href, about)
        return missingResponse(href)
      }),
    )

    const profile = requireProfile(
      await enrich(
        'Create a website for Kaveri Silks https://kaverisilks.test',
        workspace,
      ),
    )

    expect(profile.verified).toBe(true)
    expect(profile.requestedName).toBe('Kaveri Silks https://kaverisilks')
    expect(profile.officialName).toBe('Kaveri Silks')
    expect(profile.officialUrl).toBe('https://kaverisilks.test/')
    expect(profile.description).toContain('Handloom sarees')
    expect(profile.logoUrl).toBe('https://kaverisilks.test/assets/logo.svg')
    expect(profile.faviconUrl).toBe('https://kaverisilks.test/favicon.ico')
    expect(profile.emails).toContain('hello@kaverisilks.test')
    expect(profile.emails).toContain('care@kaverisilks.test')
    expect(profile.phones).toContain('+91 98765 43210')
    expect(profile.addresses[0]).toContain('12 Silk Road')
    expect(
      profile.socials.map((social: { url: string }) => social.url),
    ).toContain('https://instagram.com/kaverisilks/')
    expect(profile.sourceUrls).toContain('https://kaverisilks.test/about')
    expect(readProfile(workspace).verified).toBe(true)
  })

  it('writes an unverified fallback profile when no official site can be resolved', async () => {
    const { enrichBrandProfile } = await import('./brand-profile.js')
    const enrich = enrichBrandProfile as unknown as EnrichBrandProfile
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-fallback-profile-'))

    mocks.resolveBrandfetchBrandProfile.mockResolvedValue({
      ok: false,
      error: 'No Brandfetch match found',
      status: 404,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => missingResponse(String(url))),
    )

    const profile = requireProfile(
      await enrich('Build a website for the company UnknownCo.', workspace),
    )

    expect(profile.verified).toBe(false)
    expect(profile.confidence).toBe(0.2)
    expect(profile.logo?.provider).toBe('fallback')
    expect(profile.logo?.svg).toContain('TC')
    expect(readProfile(workspace).verified).toBe(false)
  })
})
