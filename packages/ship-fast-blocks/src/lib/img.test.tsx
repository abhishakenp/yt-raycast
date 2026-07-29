import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Image, ImageContextProvider } from './img'
import { encodeMultiImageSrc } from './multi-image-src'

function srcOf(markup: string): string {
  const m = markup.match(/src="([^"]*)"/)
  return m ? m[1].replace(/&amp;/g, '&') : ''
}
function queryOf(markup: string): string {
  const src = srcOf(markup)
  const url = new URL(src, 'http://x')
  return url.searchParams.get('query') ?? ''
}

describe('Image + ImageContextProvider', () => {
  it('falls back to alt-derived query with no provider', () => {
    const markup = renderToStaticMarkup(<Image alt="hero image" />)
    expect(srcOf(markup)).toContain('/api/pexels?')
    expect(queryOf(markup)).toBe('hero')
  })

  it('inherits the ambient prompt context and biases the query to the domain', () => {
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{ prompt: 'Create a website for a dental clinic in Mumbai' }}
      >
        <Image alt="hero image" />
      </ImageContextProvider>,
    )
    expect(queryOf(markup)).toBe('dental clinic mumbai hero')
  })

  it('passes the query un-double-encoded (single space, not %2520)', () => {
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{ prompt: 'organic dairy farm fresh milk paneer' }}
      >
        <Image alt="product shot" />
      </ImageContextProvider>,
    )
    const rawSrc = srcOf(markup)
    expect(rawSrc).not.toContain('%2520')
    expect(queryOf(markup).startsWith('organic dairy farm')).toBe(true)
  })

  it('uses an explicit src verbatim when no override matches it', () => {
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{
          prompt: 'anything',
          overrides: { other: 'https://cdn.example.com/other.jpg' },
        }}
      >
        <Image alt="x" src="https://cdn.example.com/p.jpg" />
      </ImageContextProvider>,
    )
    expect(srcOf(markup)).toBe('https://cdn.example.com/p.jpg')
  })

  it('falls back to Pexels when src is a bare filename (not a URL)', () => {
    const markup = renderToStaticMarkup(
      <Image alt="team collaborating" src="async-standup.jpg" />,
    )
    // Should NOT use the bare filename — should resolve via Pexels proxy
    expect(srcOf(markup)).not.toBe('async-standup.jpg')
    expect(srcOf(markup)).toContain('/api/pexels')
  })

  it('uses http/https/data URLs verbatim', () => {
    const markup = renderToStaticMarkup(
      <Image alt="test" src="https://example.com/photo.jpg" />,
    )
    expect(srcOf(markup)).toBe('https://example.com/photo.jpg')
  })

  it('uses a src-key override for an explicit generated src', () => {
    const currentSrc = '/api/pexels?query=glass+display&w=800&h=600'
    const replacementSrc = 'https://images.pexels.com/photos/7195588/photo.jpeg'
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{
          overrides: { [currentSrc]: replacementSrc },
        }}
      >
        <Image alt="generic image" src={currentSrc} />
      </ImageContextProvider>,
    )

    expect(srcOf(markup)).toBe(replacementSrc)
  })

  it('keeps caller image sizing on the carousel wrapper', () => {
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{
          overrides: {
            Hero: encodeMultiImageSrc([
              'https://cdn.example.com/one.jpg',
              'https://cdn.example.com/two.jpg',
            ]),
          },
        }}
      >
        <Image
          alt="Hero"
          w={1200}
          h={600}
          className="w-full rounded-2xl object-cover"
        />
      </ImageContextProvider>,
    )

    expect(markup).toContain('data-ship-image-carousel')
    expect(markup).toContain('w-full rounded-2xl object-cover')
    expect(markup).toContain('data-slot="carousel-content"')
    expect(markup).toContain('overflow-hidden h-full')
    expect(markup).toContain('aspect-ratio:1200/600')
    expect(markup).not.toContain('relative h-full w-full')
  })

  it('renders skeleton classes before the image loads (SSR)', () => {
    const markup = renderToStaticMarkup(
      <Image alt="skeleton test" className="size-full object-cover" />,
    )
    expect(markup).toContain('animate-pulse')
    expect(markup).toContain('bg-accent')
    // Caller classes are preserved alongside skeleton classes
    expect(markup).toContain('size-full object-cover')
  })

  it('preserves skeleton classes on carousel images before load', () => {
    const markup = renderToStaticMarkup(
      <ImageContextProvider
        value={{
          overrides: {
            Hero: encodeMultiImageSrc([
              'https://cdn.example.com/one.jpg',
              'https://cdn.example.com/two.jpg',
            ]),
          },
        }}
      >
        <Image alt="Hero" w={1200} h={600} />
      </ImageContextProvider>,
    )
    expect(markup).toContain('data-ship-image-carousel')
    expect(markup).toContain('animate-pulse')
    expect(markup).toContain('bg-accent')
  })
})
