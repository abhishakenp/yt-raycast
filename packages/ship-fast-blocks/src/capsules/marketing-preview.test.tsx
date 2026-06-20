import { describe, expect, it } from 'vitest'
import { ConvexProvider } from 'convex/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { ImageContextProvider, Renderer, library } from '../index.ts'

const emptyWatch = {
  journal: () => undefined,
  localQueryResult: () => undefined,
  onUpdate: () => () => {},
}

const convexClientStub = {
  action: () => Promise.resolve(null),
  clearAuth: () => {},
  connectionState: () => ({
    hasInflightRequests: false,
    isWebSocketConnected: false,
    timeOfOldestInflightRequest: null,
  }),
  mutation: () => Promise.resolve(null),
  setAuth: () => {},
  watchPaginatedQuery: () => emptyWatch,
  watchQuery: () => emptyWatch,
}

const renderOpenUI = (response: string) =>
  renderToStaticMarkup(
    <ConvexProvider client={convexClientStub as never}>
      <LakebedSessionProvider sessionId="marketing-preview-test">
        <ImageContextProvider
          value={{
            prompt: 'Create a SaaS website for OrbitLedger treasury automation',
          }}
        >
          <Renderer response={response} library={library} />
        </ImageContextProvider>
      </LakebedSessionProvider>
    </ConvexProvider>,
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
