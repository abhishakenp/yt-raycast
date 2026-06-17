import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  alignGeneratedImagesToContext,
  hydrateDataImgSlots,
  hydrateStorefrontGradientSlots,
  injectEcommerceHeroResponsiveCss,
  mergeImageHintLists,
  normalizeStockImageMatchKey,
  polishGeneratedMediaHtml,
  verifyTrustedStockImageUrls,
} from './image-hints.js'

type PhotoHint = {
  provider: string
  query: string
  id: string
  sourceRank: number
  url: string
  alt: string
  matchText: string
}

type VideoHint = PhotoHint & {
  kind: string
  rawUrl: string
  posterUrl: string
}

type ImageHintBundle = {
  prompt: string
  hydrationPrompt: string
  photos: PhotoHint[]
  videos: VideoHint[]
}

type MergedImageHintBundle = ImageHintBundle & {
  promptBlock: string
}

const mergeHints = mergeImageHintLists as (
  primary?: Partial<ImageHintBundle>,
  secondary?: Partial<ImageHintBundle>,
) => MergedImageHintBundle

const polishMediaHtml = polishGeneratedMediaHtml as (
  html: string,
  imageHints?: ImageHintBundle,
) => string

const hydrateSlots = hydrateDataImgSlots as (
  html: string,
  imageHints?: ImageHintBundle,
) => Promise<string>

const hydrateStorefrontSlots = hydrateStorefrontGradientSlots as (
  html: string,
  imageHints?: ImageHintBundle,
) => string

const alignImagesToContext = alignGeneratedImagesToContext as (
  html: string,
  imageHints?: ImageHintBundle,
) => Promise<string>

const productPhoto: PhotoHint = {
  provider: 'pexels',
  query: 'healthy snack product',
  id: '111',
  sourceRank: 0,
  url: 'https://images.pexels.com/photos/111/pexels-photo-111.jpeg?auto=compress',
  alt: 'Healthy packaged snack product',
  matchText: 'healthy packaged snack product flat lay',
}

const lifestylePhoto: PhotoHint = {
  provider: 'pexels',
  query: 'friends sharing healthy snacks',
  id: '222',
  sourceRank: 1,
  url: 'https://images.pexels.com/photos/222/pexels-photo-222.jpeg?auto=compress',
  alt: 'Friends sharing healthy snacks outdoors',
  matchText: 'friends family people sharing healthy snacks lifestyle',
}

const videoHint: VideoHint = {
  kind: 'video',
  provider: 'pexels',
  query: 'cinematic travel destination',
  id: 'vid-1',
  sourceRank: 0,
  url: 'https://videos.pexels.com/video-files/1/1-hd.mp4',
  rawUrl: 'https://videos.pexels.com/video-files/1/1-hd.mp4',
  posterUrl: 'https://images.pexels.com/videos/1/poster.jpeg',
  alt: 'Cinematic travel destination',
  matchText: 'cinematic travel destination',
}

const imageHints: ImageHintBundle = {
  prompt:
    'Healthy snack ecommerce store with product cards and lifestyle panels',
  hydrationPrompt:
    'Healthy snack ecommerce store with protein bars and friends sharing snacks',
  photos: [productPhoto, lifestylePhoto],
  videos: [videoHint],
}

describe('image hints media hydration', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        headers: new Headers(),
        json: async () => ({}),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('merges hint lists with secondary media first and keeps prompt metadata', () => {
    const merged = mergeHints(
      {
        prompt: 'primary prompt',
        photos: [productPhoto],
        videos: [videoHint],
      },
      {
        hydrationPrompt: 'secondary hydration prompt',
        prompt: 'secondary prompt',
        photos: [productPhoto, lifestylePhoto],
        videos: [videoHint],
      },
    )

    expect(merged.photos.map((photo) => photo.url)).toEqual([
      productPhoto.url,
      lifestylePhoto.url,
    ])
    expect(merged.videos.map((video) => video.url)).toEqual([videoHint.url])
    expect(merged.prompt).toBe('secondary prompt')
    expect(merged.hydrationPrompt).toBe('secondary hydration prompt')
    expect(merged.promptBlock).toContain('Approved still images')
    expect(merged.promptBlock).toContain(productPhoto.url)
    expect(merged.promptBlock).toContain('Approved short videos')
    expect(merged.promptBlock).toContain(videoHint.url)
  })

  it('normalizes trusted stock URLs and rejects untrusted image references', () => {
    expect(
      normalizeStockImageMatchKey(
        'https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg?auto=compress',
      ),
    ).toBe('pexels:12345')
    expect(
      normalizeStockImageMatchKey(
        'https://images.unsplash.com/photo-abc123?auto=format&w=800',
      ),
    ).toBe('/photo-abc123')
    expect(
      normalizeStockImageMatchKey('http://images.pexels.com/photos/1/x.jpeg'),
    ).toBe('')
    expect(normalizeStockImageMatchKey('data:image/gif;base64,abc')).toBe('')
  })

  it('polishes generated media by repairing malformed classes and hydrating art surfaces', () => {
    const html = `<main>
      <div classrelative></div>
      <img src="pexels:111" srcset="bad 1x" class="flex items-center bg-gradient-to-r rounded-xl" alt="Snack product">
      <div data-visual="art-surface" data-visual-kind="product-showcase" class="h-64 rounded-xl"></div>
    </main>`

    const polished = polishMediaHtml(html, imageHints)

    expect(polished).toContain('class="relative"')
    expect(polished).toContain(productPhoto.url)
    expect(polished).toContain('data-visual="art-surface"')
    expect(polished).toContain('loading="eager"')
    expect(polished).not.toContain('flex items-center bg-gradient-to-r')
  })

  it('hydrates data-img placeholders into stock images with safe classes and stock keys', async () => {
    const html = `<section>
      <div data-img="product hero" class="bg-gradient-to-r aspect-video rounded-2xl"></div>
      <div data-img="founder headshot" class="w-16 h-16 rounded-full bg-slate-200"></div>
    </section>`

    const hydrated = await hydrateSlots(html, imageHints)

    expect(hydrated).not.toContain('data-img=')
    expect(hydrated).toContain('<img')
    expect(hydrated).toContain(productPhoto.url)
    expect(hydrated).toContain('data-sf-stock-src="pexels:111"')
    expect(hydrated).toContain('loading="eager"')
    expect(hydrated).not.toContain('bg-gradient-to-r')
  })

  it('hydrates ecommerce storefront slots and injects hydration CSS once', () => {
    const html = `<html><head></head><body>
      <section class="hero"><div class="hero-visual"></div></section>
      <article class="product-card"><div class="img"></div><h3>Protein Bars</h3><p class="desc">Healthy snack pack</p></article>
      <article class="collection-card"><div class="img"></div><span class="label">Family Packs</span></article>
    </body></html>`

    const hydrated = hydrateStorefrontSlots(html, imageHints)
    const secondPass = hydrateStorefrontSlots(hydrated, imageHints)

    expect(hydrated).toContain('data-sf-stock-hydration')
    expect(hydrated).toContain('<div class="hero-visual"><img')
    expect(hydrated).toContain('<img class="img"')
    expect(hydrated).toContain(productPhoto.url)
    expect(secondPass.match(/data-sf-stock-hydration/g) ?? []).toHaveLength(1)
  })

  it('aligns generated images and videos to approved media while preserving logos', async () => {
    const html = `<main>
      <img src="https://example.com/logo.png" alt="Acme logo" width="40" height="40">
      <img src="https://example.com/placeholder.jpg" alt="Protein snack product" srcset="bad 1x">
      <video aria-label="cinematic travel destination"><source src="https://example.com/old.mp4" type="video/mp4"></video>
    </main>`

    const aligned = await alignImagesToContext(html, imageHints)

    expect(aligned).toContain('https://example.com/logo.png')
    expect(aligned).toContain(`src="${productPhoto.url}"`)
    expect(aligned).toContain('data-sf-stock-src="pexels:111"')
    expect(aligned).not.toContain('srcset=')
    expect(aligned).toContain(`src="${videoHint.url}"`)
    expect(aligned).toContain(`poster="${videoHint.posterUrl}"`)
  })

  it('marks trusted stock images eager and injects responsive hero CSS idempotently', async () => {
    const stockHtml = `<img src="${productPhoto.url}" alt="Product" loading="lazy">`
    const verified = await verifyTrustedStockImageUrls(stockHtml)

    expect(verified).toContain('loading="eager"')

    const heroHtml =
      '<html><head></head><body><section class="hero"><div class="hero-left"><h1>Shop</h1></div></section></body></html>'
    const responsive = injectEcommerceHeroResponsiveCss(heroHtml)
    const secondPass = injectEcommerceHeroResponsiveCss(responsive)

    expect(responsive).toContain('data-sf-hero-responsive')
    expect(secondPass.match(/data-sf-hero-responsive/g) ?? []).toHaveLength(1)
  })
})
