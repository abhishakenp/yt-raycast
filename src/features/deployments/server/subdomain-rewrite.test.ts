import { describe, expect, it } from 'vitest'

// BASE_DOMAIN is read at module load from process.env; set it before the
// dynamic import so the rewrite uses the ship-fast.test dev base domain.
process.env.NEXT_PUBLIC_BASE_DOMAIN = 'ship-fast.test'

const {
  subdomainRewrite,
  buildSubdomainRoutePath,
  stripSubdomainRoutePrefix,
  isReservedSubdomainPath,
  SUBDOMAIN_ROUTE_PREFIX,
} = await import('./subdomain-rewrite')

const subdomainUrl = (path: string, host = 'noice-momo.ship-fast.test') =>
  new URL(`https://${host}${path}`)

describe('isReservedSubdomainPath', () => {
  it('flags deployment metadata files', () => {
    expect(isReservedSubdomainPath('/robots.txt')).toBe(true)
    expect(isReservedSubdomainPath('/sitemap.xml')).toBe(true)
    expect(isReservedSubdomainPath('/llms.txt')).toBe(true)
  })

  it('flags api and export prefixes', () => {
    expect(isReservedSubdomainPath('/api/checkout')).toBe(true)
    expect(isReservedSubdomainPath('/export/abc/html')).toBe(true)
  })

  it('does not flag page paths', () => {
    expect(isReservedSubdomainPath('/')).toBe(false)
    expect(isReservedSubdomainPath('/about')).toBe(false)
    expect(isReservedSubdomainPath('/blog/post-1')).toBe(false)
  })
})

describe('buildSubdomainRoutePath', () => {
  it('maps home to the deployed slug route with no trailing path', () => {
    expect(buildSubdomainRoutePath('my-site', '/')).toBe('/deployed/my-site')
  })

  it('appends nested page paths after the slug', () => {
    expect(buildSubdomainRoutePath('my-site', '/about')).toBe(
      '/deployed/my-site/about',
    )
    expect(buildSubdomainRoutePath('my-site', '/blog/post-1')).toBe(
      '/deployed/my-site/blog/post-1',
    )
  })
})

describe('stripSubdomainRoutePrefix', () => {
  it('returns / for the deployed home route', () => {
    expect(stripSubdomainRoutePrefix('/deployed/my-site')).toBe('/')
  })

  it('returns the remaining path for nested pages', () => {
    expect(stripSubdomainRoutePrefix('/deployed/my-site/about')).toBe('/about')
    expect(stripSubdomainRoutePrefix('/deployed/my-site/blog/post-1')).toBe(
      '/blog/post-1',
    )
  })

  it('returns null for non-deployed paths', () => {
    expect(stripSubdomainRoutePrefix('/preview/abc')).toBeNull()
    expect(stripSubdomainRoutePrefix('/')).toBeNull()
  })
})

describe('subdomainRewrite.input', () => {
  it('rewrites a subdomain home request to the deployed route', () => {
    const out = subdomainRewrite.input?.({ url: subdomainUrl('/') })
    expect(out).toBeInstanceOf(URL)
    expect((out as URL).pathname).toBe('/deployed/noice-momo')
  })

  it('rewrites a subdomain sub-page request preserving the rest', () => {
    const out = subdomainRewrite.input?.({
      url: subdomainUrl('/about'),
    }) as URL
    expect(out.pathname).toBe('/deployed/noice-momo/about')
  })

  it('does not rewrite reserved metadata/api/export paths', () => {
    for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt']) {
      expect(subdomainRewrite.input?.({ url: subdomainUrl(path) })).toBe(
        undefined,
      )
    }
    expect(
      subdomainRewrite.input?.({ url: subdomainUrl('/api/checkout') }),
    ).toBe(undefined)
    expect(
      subdomainRewrite.input?.({ url: subdomainUrl('/export/abc/html') }),
    ).toBe(undefined)
  })

  it('does not rewrite the base domain, www, or reserved host labels', () => {
    expect(
      subdomainRewrite.input?.({ url: subdomainUrl('/', 'ship-fast.test') }),
    ).toBe(undefined)
    expect(
      subdomainRewrite.input?.({
        url: subdomainUrl('/', 'www.ship-fast.test'),
      }),
    ).toBe(undefined)
    expect(
      subdomainRewrite.input?.({
        url: subdomainUrl('/', 'api.ship-fast.test'),
      }),
    ).toBe(undefined)
  })

  it('does not rewrite Dokploy-managed infrastructure subdomains', () => {
    const dokployHosts = [
      'medusa.ship-fast.test',
      'agent.ship-fast.test',
      'canva.ship-fast.test',
      'partners.ship-fast.test',
      'convex-backend.ship-fast.test',
      'convex-dashboard.ship-fast.test',
      'convex-studio.ship-fast.test',
      'free-preview.ship-fast.test',
    ]
    for (const host of dokployHosts) {
      expect(subdomainRewrite.input?.({ url: subdomainUrl('/', host) })).toBe(
        undefined,
      )
    }
  })

  it('does not rewrite foreign hosts', () => {
    expect(
      subdomainRewrite.input?.({ url: new URL('https://example.com/about') }),
    ).toBe(undefined)
  })
})

describe('subdomainRewrite.output', () => {
  it('maps an internal deployed home path back to /', () => {
    const out = subdomainRewrite.output?.({
      url: new URL('https://noice-momo.ship-fast.test/deployed/noice-momo'),
    }) as URL
    expect(out.pathname).toBe('/')
  })

  it('maps an internal deployed sub-page back to the clean subdomain path', () => {
    const out = subdomainRewrite.output?.({
      url: new URL(
        'https://noice-momo.ship-fast.test/deployed/noice-momo/about',
      ),
    }) as URL
    expect(out.pathname).toBe('/about')
  })

  it('does not rewrite non-deployed internal paths', () => {
    expect(
      subdomainRewrite.output?.({
        url: new URL('https://ship-fast.test/pricing'),
      }),
    ).toBe(undefined)
  })
})

describe('subdomainRewrite round-trip', () => {
  it('input then output preserves the original subdomain path', () => {
    const original = subdomainUrl('/blog/post-1')
    const internal = subdomainRewrite.input?.({ url: original }) as URL
    expect(internal.pathname).toBe('/deployed/noice-momo/blog/post-1')
    const external = subdomainRewrite.output?.({ url: internal }) as URL
    expect(external.pathname).toBe('/blog/post-1')
  })
})

describe('SUBDOMAIN_ROUTE_PREFIX', () => {
  it('matches the deployed route tree prefix', () => {
    expect(SUBDOMAIN_ROUTE_PREFIX).toBe('/deployed')
  })
})
