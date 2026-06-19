import { afterEach, describe, expect, it } from 'vitest'

import {
  buildOpenUILakebedProjectFiles,
  collectRouteImageAlts,
  resolveLakebedImageSources,
} from './openui-lakebed-export-builder'

const originalFetch = globalThis.fetch
const originalPexelsKey = process.env.PEXELS_API_KEY

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalPexelsKey === undefined) {
    delete process.env.PEXELS_API_KEY
  } else {
    process.env.PEXELS_API_KEY = originalPexelsKey
  }
})

describe('openui lakebed image source generation', () => {
  it('packages rendered HTML fragments as static Lakebed projects instead of parsing page text as OpenUI', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source:
        '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers.</p></main>',
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(built.projectName).toBe('PurrSpecs')
    expect(built.files['client/index.tsx']).toContain('PurrSpecs')
    expect(Object.values(built.files).join('\n')).not.toContain('root =')
    expect(Object.values(built.files).join('\n')).not.toContain('@openuidev')
  })

  it('collects image alt text from generated route props', () => {
    const alts = collectRouteImageAlts([
      {
        componentName: 'DogCarePage',
        label: 'Home',
        path: '/',
        props: {
          hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          testimonials: [
            { avatarAlt: 'Emily with her golden retriever' },
            { title: 'Not an image' },
          ],
        },
      },
    ])

    expect(alts).toEqual([
      'Golden retriever puppy playing with a ball',
      'Emily with her golden retriever',
    ])
  })

  it('resolves missing generated image alts through Pexels at build time', async () => {
    process.env.PEXELS_API_KEY = 'pexels_test_key'
    const requests: string[] = []
    globalThis.fetch = (async (url: RequestInfo | URL) => {
      requests.push(String(url))
      return new Response(
        JSON.stringify({
          photos: [
            {
              src: {
                large: 'https://images.pexels.com/photos/dog-large.jpeg',
                large2x: 'https://images.pexels.com/photos/dog-large2x.jpeg',
                medium: 'https://images.pexels.com/photos/dog-medium.jpeg',
                original: 'https://images.pexels.com/photos/dog-original.jpeg',
              },
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' }, status: 200 },
      )
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'DogCarePage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          },
        },
      ],
      '<img alt="Existing avatar" src="https://cdn.example.com/avatar.jpg">',
    )

    expect(sources).toEqual(
      expect.arrayContaining([
        {
          alt: 'Existing avatar',
          src: 'https://cdn.example.com/avatar.jpg',
        },
        {
          alt: 'Golden retriever puppy playing with a ball',
          src: 'https://images.pexels.com/photos/dog-large2x.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
        },
      ]),
    )
    expect(requests).toHaveLength(1)
    expect(requests[0]).toContain('api.pexels.com/v1/search')
    expect(requests[0]).toContain('golden')
    expect(sources.every((source) => !source.src.includes('/api/pexels'))).toBe(
      true,
    )
    expect(
      sources.every((source) => !source.src.startsWith('data:image/')),
    ).toBe(true)
  })

  it('falls back to detached Picsum URLs when stock APIs are unavailable', async () => {
    delete process.env.PEXELS_API_KEY
    globalThis.fetch = (async () => {
      throw new Error('Pexels should not be called without a key')
    }) as typeof fetch

    const sources = await resolveLakebedImageSources(
      [
        {
          componentName: 'DogCarePage',
          label: 'Home',
          path: '/',
          props: {
            hero: { imageAlt: 'Golden retriever puppy playing with a ball' },
          },
        },
      ],
      '<img alt="Existing avatar" src="/api/pexels?query=avatar&w=64&h=64">',
    )

    expect(sources).toEqual(
      expect.arrayContaining([
        {
          alt: 'Existing avatar',
          src: 'https://picsum.photos/seed/existing-avatar/400/400',
        },
        {
          alt: 'Golden retriever puppy playing with a ball',
          src: 'https://picsum.photos/seed/golden-retriever-puppy-playing-with-a-ball/1200/800',
        },
      ]),
    )
    expect(sources.every((source) => !source.src.includes('/api/pexels'))).toBe(
      true,
    )
  })
})
