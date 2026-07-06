import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Image, ImageContextProvider } from './img'

const srcOf = (markup: string): string => {
  const m = markup.match(/src="([^"]*)"/)
  return m ? m[1].replace(/&amp;/g, '&') : ''
}
const queryOf = (markup: string): string => {
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
})
