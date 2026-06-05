import { describe, expect, it } from 'vitest'
import { buildHeadTags } from './build-head.ts'
import type { ResolvedPageSeo } from '../seo/resolve-page-seo.ts'

const baseSeo: ResolvedPageSeo = {
  title: 'Acme | Project management',
  description: 'Acme helps remote teams plan work clearly.',
  siteName: 'Acme',
  siteUrl: 'https://acme.example',
  routePath: '/',
  canonicalUrl: 'https://acme.example/',
  locale: 'en_US',
  htmlLang: 'en-US',
  robots: 'index, follow',
  keywords: ['acme', 'project management'],
  ogImage: 'https://acme.example/og.png',
  ogImageAlt: 'Acme preview',
  twitterCard: 'summary_large_image',
  themeColor: '#09090b',
  noIndex: false,
}

describe('buildHeadTags', () => {
  it('includes canonical, OG, Twitter, and llms.txt discovery', () => {
    const tags = buildHeadTags(baseSeo)
    const joined = tags.join('\n')

    expect(joined).toContain('<title>Acme | Project management</title>')
    expect(joined).toContain('rel="canonical"')
    expect(joined).toContain('property="og:title"')
    expect(joined).toContain('name="twitter:card"')
    expect(joined).toContain('href="/llms.txt"')
  })
})
