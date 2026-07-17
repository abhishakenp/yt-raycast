// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MARKETING_CONSENT_KEY,
  writeMarketingConsent,
} from '@/features/partners/lib/marketing-consent'
import type { MarketingConsent } from '@/features/partners/lib/marketing-consent'
import { MarketingConsentController } from './MarketingConsentController'

const dubAnalyticsMock = vi.hoisted(() => vi.fn(() => null))

vi.mock('@dub/analytics/react', () => ({
  Analytics: dubAnalyticsMock,
}))

const enabledProps = {
  enabled: true,
  publishableKey: 'dub_pk_test',
  referralDomain: 'refer.ship-fast.ai',
  siteDomain: 'ship-fast.ai',
}

const consentTree = () => (
  <>
    <MarketingConsentController {...enabledProps} />
    <span>After consent controller</span>
  </>
)
const storedConsents: MarketingConsent[] = ['accepted', 'declined']

describe('MarketingConsentController', () => {
  beforeEach(() => {
    window.localStorage.clear()
    dubAnalyticsMock.mockClear()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders nothing and never mounts Dub when the feature is disabled', () => {
    const view = render(
      <MarketingConsentController {...enabledProps} enabled={false} />,
    )

    expect(view.container.firstChild).toBeNull()
    expect(dubAnalyticsMock).not.toHaveBeenCalled()
  })

  it('asks for consent without mounting Dub analytics', () => {
    render(<MarketingConsentController {...enabledProps} />)

    expect(
      screen.getByRole('dialog', { name: 'Marketing cookies' }),
    ).toBeTruthy()
    expect(dubAnalyticsMock).not.toHaveBeenCalled()
  })

  it('mounts first-click Dub analytics only after explicit acceptance', () => {
    render(<MarketingConsentController {...enabledProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Allow marketing' }))

    expect(window.localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('accepted')
    expect(
      screen.queryByRole('dialog', { name: 'Marketing cookies' }),
    ).toBeNull()
    expect(dubAnalyticsMock).toHaveBeenCalledWith(
      {
        attributionModel: 'first-click',
        cookieOptions: { expiresInDays: 30 },
        domainsConfig: {
          refer: 'refer.ship-fast.ai',
          site: 'ship-fast.ai',
        },
        publishableKey: 'dub_pk_test',
      },
      undefined,
    )
  })

  it('persists a decline without mounting Dub analytics', () => {
    render(<MarketingConsentController {...enabledProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Decline' }))

    expect(window.localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('declined')
    expect(dubAnalyticsMock).not.toHaveBeenCalled()
  })

  it('reacts to consent changes made elsewhere on the current page', () => {
    window.localStorage.setItem(MARKETING_CONSENT_KEY, 'declined')
    render(<MarketingConsentController {...enabledProps} />)

    act(() => writeMarketingConsent('accepted'))

    expect(dubAnalyticsMock).toHaveBeenCalledOnce()
  })

  it.each(storedConsents)(
    'hydrates without replacing server HTML when stored consent is %s',
    async (storedConsent) => {
      const container = document.createElement('div')
      container.innerHTML = renderToString(consentTree())
      document.body.append(container)
      window.localStorage.setItem(MARKETING_CONSENT_KEY, storedConsent)
      const recoverableErrors: unknown[] = []
      let root: Root | null = null

      try {
        await act(async () => {
          root = hydrateRoot(container, consentTree(), {
            onRecoverableError: (error) => recoverableErrors.push(error),
          })
        })
        expect(recoverableErrors).toEqual([])
        await waitFor(() =>
          expect(container.querySelector('[role="dialog"]')).toBeNull(),
        )

        expect(container.textContent).toContain('After consent controller')
      } finally {
        act(() => root?.unmount())
        container.remove()
      }
    },
  )
})
