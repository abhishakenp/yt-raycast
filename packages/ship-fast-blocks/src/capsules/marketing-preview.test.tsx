import { describe, expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ImageContextProvider, Renderer, library } from '../index.ts'

const renderOpenUI = (response: string) =>
  renderToStaticMarkup(
    <ImageContextProvider
      value={{
        prompt: 'Create a SaaS website for OrbitLedger treasury automation',
      }}
    >
      <Renderer response={response} library={library} />
    </ImageContextProvider>,
  )

describe('marketing product previews', () => {
  it('renders a real image for the full marketing page', () => {
    const markup = renderOpenUI('root = MarketingKimiPage()')

    expect(markup).toContain('<img')
    expect(markup).toContain('/api/pexels?')
    expect(markup).toContain('product dashboard preview')
  })

  it('renders a real image for the marketing hero section', () => {
    const markup = renderOpenUI('root = MarketingHero()')

    expect(markup).toContain('<img')
    expect(markup).toContain('/api/pexels?')
    expect(markup).toContain('product dashboard preview')
  })
})
