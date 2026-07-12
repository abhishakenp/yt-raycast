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
} from './image-hints'

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

type ResolverProgressEvent = {
  done: boolean
  photos: PhotoHint[]
  videos: VideoHint[]
}

type ResolvePexelsImageHints = (
  hintsInput: {
    ctx?: Record<string, unknown>
    hydrationPrompt?: string
    prompt?: string
    siteSpec?: Record<string, unknown>
  },
  options?: {
    onProgress?: (event: ResolverProgressEvent) => void
  },
) => Promise<MergedImageHintBundle>

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

  it('resolves stock media with provider filtering, health probes, and progress events', async () => {
    const originalPexelsKey = process.env.PEXELS_API_KEY
    const originalUnsplashKey = process.env.UNSPLASH_ACCESS_KEY
    process.env.PEXELS_API_KEY = 'pexels-test-key'
    process.env.UNSPLASH_ACCESS_KEY = 'unsplash-test-key'
    vi.resetModules()

    const fetchMock = vi.fn(async (input, init?) => {
      const url = new URL(String(input))
      if (url.hostname === 'api.pexels.com' && url.pathname === '/v1/search') {
        expect(init?.headers).toEqual({ Authorization: 'pexels-test-key' })
        const query = url.searchParams.get('query') ?? ''
        return {
          json: async () => ({
            photos: query.includes('golden retriever')
              ? [
                  {
                    alt: 'Cat sleeping on a laptop desk',
                    id: 101,
                    src: {
                      large2x: 'https://images.pexels.com/photos/101/cat.jpeg',
                    },
                  },
                  {
                    alt: 'Golden retriever dog portrait outdoor',
                    id: 102,
                    src: {
                      large2x: 'https://images.pexels.com/photos/102/dog.jpeg',
                    },
                  },
                ]
              : [],
          }),
          ok: true,
        }
      }
      if (url.hostname === 'api.unsplash.com') {
        expect(init?.headers).toMatchObject({
          Authorization: 'Client-ID unsplash-test-key',
          'Accept-Version': 'v1',
        })
        const query = url.searchParams.get('query') ?? ''
        return {
          json: async () => ({
            results: query.includes('golden retriever')
              ? [
                  {
                    alt_description: 'Golden retriever dog running grass',
                    id: 'unsplash-dog',
                    slug: 'golden-retriever-dog-running-grass',
                    urls: {
                      raw: 'https://images.unsplash.com/photo-dog-raw',
                      regular: 'https://images.unsplash.com/photo-dog',
                    },
                  },
                ]
              : [],
          }),
          ok: true,
        }
      }
      if (
        url.hostname === 'api.pexels.com' &&
        url.pathname === '/v1/videos/search'
      ) {
        const query = url.searchParams.get('query') ?? ''
        return {
          json: async () => ({
            videos: query.includes('golden retriever')
              ? [
                  {
                    id: 900,
                    image: 'https://images.pexels.com/videos/900/poster.jpeg',
                    video_files: [
                      {
                        file_type: 'video/mp4',
                        height: 720,
                        link: 'https://videos.pexels.com/video-files/900/sd.mp4',
                        quality: 'sd',
                        width: 1280,
                      },
                      {
                        file_type: 'video/mp4',
                        height: 1080,
                        link: 'https://videos.pexels.com/video-files/900/hd.mp4',
                        quality: 'hd',
                        width: 1920,
                      },
                    ],
                  },
                ]
              : [],
          }),
          ok: true,
        }
      }
      if (
        url.hostname === 'images.pexels.com' ||
        url.hostname === 'images.unsplash.com'
      ) {
        return {
          headers: new Headers({ 'content-type': 'image/jpeg' }),
          ok: true,
        }
      }
      return {
        headers: new Headers(),
        json: async () => ({}),
        ok: false,
      }
    })
    vi.stubGlobal('fetch', fetchMock)
    const progressEvents: ResolverProgressEvent[] = []

    try {
      const { resolvePexelsImageHints } =
        (await import('./image-hints.js')) as unknown as {
          resolvePexelsImageHints: ResolvePexelsImageHints
        }

      const resolved = await resolvePexelsImageHints(
        {
          hydrationPrompt: 'Dog adoption gallery',
          prompt:
            'Create a dog rescue adoption blog with golden retriever stories',
        },
        {
          onProgress: (event) => progressEvents.push(event),
        },
      )

      expect(resolved.photos.map((photo) => photo.id)).toEqual([
        '102',
        'unsplash-dog',
      ])
      expect(resolved.photos.map((photo) => photo.provider)).toEqual([
        'pexels',
        'unsplash',
      ])
      expect(resolved.photos.map((photo) => photo.alt).join(' ')).not.toMatch(
        /cat|laptop/i,
      )
      expect(resolved.videos).toEqual([
        expect.objectContaining({
          id: '900',
          posterUrl: 'https://images.pexels.com/videos/900/poster.jpeg',
          url: 'https://videos.pexels.com/video-files/900/hd.mp4',
        }),
      ])
      expect(resolved.promptBlock).toContain('Approved still images')
      expect(resolved.promptBlock).toContain('Approved short videos')
      expect(progressEvents.some((event) => event.done === false)).toBe(true)
      expect(progressEvents.at(-1)).toMatchObject({
        done: true,
        photos: resolved.photos,
        videos: resolved.videos,
      })
    } finally {
      if (originalPexelsKey === undefined) delete process.env.PEXELS_API_KEY
      else process.env.PEXELS_API_KEY = originalPexelsKey
      if (originalUnsplashKey === undefined)
        delete process.env.UNSPLASH_ACCESS_KEY
      else process.env.UNSPLASH_ACCESS_KEY = originalUnsplashKey
      vi.resetModules()
    }
  })
})
