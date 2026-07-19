// @vitest-environment jsdom

import type { ComponentType } from 'react'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TestSubscriber = {
  email: string
  id: string
  source?: string
}

type TestLakebed = {
  useMutation: (name: string) => {
    (input?: any): Promise<unknown>
    isPending: boolean
    lastError: unknown | null
    pendingCount: number
    reset: () => void
  }
  useQuery: (name: string) => unknown
}

const navigate = vi.fn()
const lakebedRef = { current: null as TestLakebed | null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => {
    if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
    return lakebedRef.current
  }),
}))

if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })
  const defineGlobal = (name: string, value: unknown) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }
  const requestAnimationFrame = (callback: (time: number) => void) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) =>
    clearTimeout(id)

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
  defineGlobal('PointerEvent', dom.window.PointerEvent ?? dom.window.MouseEvent)
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
}

const { cleanup, fireEvent, render, screen, waitFor } = await import(
  '@testing-library/react'
)
const { BlogSubscribe } = await import('../blog/BlogSubscribe.tsx')
const { BeautyStoreNewsletter } = await import(
  '../beauty-store/BeautyStoreNewsletter.tsx'
)
const { ElectronicsStoreNewsletter } = await import(
  '../electronics-store/ElectronicsStoreNewsletter.tsx'
)
const { FurnitureStoreNewsletter } = await import(
  '../furniture-store/FurnitureStoreNewsletter.tsx'
)
const { LinkInBioSubscribe } = await import(
  '../link-in-bio/LinkInBioSubscribe.tsx'
)
const { FashionStoreNewsletter } = await import(
  '../fashion-store/FashionStoreNewsletter.tsx'
)
const { NonprofitSubscribe } = await import(
  '../nonprofit/NonprofitSubscribe.tsx'
)
const { WriterAuthorSubscribe } = await import(
  '../writer-author/WriterAuthorSubscribe.tsx'
)
const { MusicArtistMailing } = await import(
  '../music-artist/MusicArtistMailing.tsx'
)
const { CafeNewsletter } = await import('../cafe/CafeNewsletter.tsx')
const { NewsroomSubscribe } = await import('../newsroom/NewsroomSubscribe.tsx')
const { NewsroomFooter } = await import('../newsroom/NewsroomFooter.tsx')
const { ComingSoonHero } = await import('../coming-soon/ComingSoonHero.tsx')
const { ComingSoonCta } = await import('../coming-soon/ComingSoonCta.tsx')
const { EcommerceCta } = await import('../ecommerce/EcommerceCta.tsx')
const { FitnessCta } = await import('../fitness/FitnessCta.tsx')
const { MarketingCta } = await import('../marketing/MarketingCta.tsx')
const { HotelResortFooter } = await import(
  '../hotel-resort/HotelResortFooter.tsx'
)
const { NewsletterCta } = await import('./NewsletterCta.tsx')
const { NewsletterHero } = await import('./NewsletterHero.tsx')
const { NewsletterPricing } = await import('./NewsletterPricing.tsx')

function createNewsletterLakebedStub() {
  let version = 0
  let subscribers: TestSubscriber[] = []
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }

  const lakebed: TestLakebed = {
    useQuery: (name) => {
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        () => version,
        () => version,
      )

      if (name === 'subscriberSummary') {
        return { count: subscribers.length, subscribers }
      }

      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'subscribe') {
              const email = String(input?.email ?? '')
                .trim()
                .toLowerCase()
              if (email) {
                const existing = subscribers.find(
                  (item) => item.email === email,
                )
                subscribers = existing
                  ? subscribers.map((item) =>
                      item.email === email
                        ? { ...item, source: input?.source ?? item.source }
                        : item,
                    )
                  : [
                      ...subscribers,
                      {
                        email,
                        id: `sub-${subscribers.length + 1}`,
                        source: input?.source,
                      },
                    ]
              }
            }

            notify()
            return subscribers
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name],
      )
      const mutation = useMemo(() => {
        const callable = ((input) => runMutation(input)) as ReturnType<
          TestLakebed['useMutation']
        >
        callable.isPending = false
        callable.lastError = null
        callable.pendingCount = 0
        callable.reset = reset
        return callable
      }, [reset, runMutation])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return { lakebed, subscribers: () => subscribers }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('newsletter subscribe capsules', () => {
  it('writes subscribers to shared Lakebed state and updates sibling forms', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    const Blog = BlogSubscribe.client.component as ComponentType<any>
    const Hero = NewsletterHero.client.component as ComponentType<any>

    render(
      <>
        <Blog
          props={{
            ctaLabel: 'Join',
            ctaTarget: 'Blog footer',
            placeholder: 'reader@example.com',
          }}
          statementId="blog_subscribe"
        />
        <Hero
          props={{
            emailPlaceholder: 'hero@example.com',
            submit: 'Subscribe Free',
          }}
          statementId="newsletter_hero"
        />
      </>,
    )

    expect(screen.getAllByText('0 readers subscribed.')).toHaveLength(2)

    fireEvent.change(screen.getByPlaceholderText('reader@example.com'), {
      target: { value: ' Reader@Example.COM ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Join' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'reader@example.com',
          id: 'sub-1',
          source: 'Blog footer',
        },
      ])
    })

    expect(
      screen.getByText(
        "You're on the list. Watch your inbox for the next edition.",
      ),
    ).toBeTruthy()
    expect(screen.getByText('1 reader subscribed.')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('connects vertical storefront and creator email captures to the shared subscriber list', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    const Beauty = BeautyStoreNewsletter.client.component as ComponentType<any>
    const Ecommerce = EcommerceCta.client.component as ComponentType<any>
    const Electronics = ElectronicsStoreNewsletter.client
      .component as ComponentType<any>
    const Furniture = FurnitureStoreNewsletter.client
      .component as ComponentType<any>
    const LinkInBio = LinkInBioSubscribe.client.component as ComponentType<any>

    render(
      <>
        <Beauty
          props={{
            placeholder: 'beauty@example.com',
            submit: 'Glow',
            submitTarget: 'Beauty offer',
          }}
          statementId="beauty_newsletter"
        />
        <Ecommerce
          props={{
            placeholder: 'shop@example.com',
            submit: 'Claim Discount',
          }}
          statementId="ecommerce_cta"
        />
        <Electronics
          props={{
            placeholder: 'tech@example.com',
            submit: 'Join Tech',
          }}
          statementId="electronics_newsletter"
        />
        <Furniture
          props={{
            placeholder: 'home@example.com',
            submit: 'Join Home',
            socials: ['Instagram'],
          }}
          statementId="furniture_newsletter"
        />
        <LinkInBio
          props={{
            ctaLabel: 'Follow',
            ctaTarget: 'Creator drops',
            placeholder: 'link@example.com',
          }}
          statementId="link_bio_subscribe"
        />
      </>,
    )

    expect(screen.getAllByText('0 readers subscribed.')).toHaveLength(5)

    fireEvent.change(screen.getByPlaceholderText('beauty@example.com'), {
      target: { value: ' Glow@Example.COM ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Glow' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'glow@example.com',
          id: 'sub-1',
          source: 'Beauty offer',
        },
      ])
    })

    expect(screen.getAllByText('1 reader subscribed.')).toHaveLength(4)

    fireEvent.change(screen.getByPlaceholderText('shop@example.com'), {
      target: { value: 'Shopper@Example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Claim Discount' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'glow@example.com',
          id: 'sub-1',
          source: 'Beauty offer',
        },
        {
          email: 'shopper@example.com',
          id: 'sub-2',
          source: 'ecommerce-cta',
        },
      ])
    })

    expect(
      screen.getByText(
        "You're in. Your welcome offer is ready in the live subscriber list.",
      ),
    ).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('link@example.com'), {
      target: { value: 'creator@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Follow' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'glow@example.com',
          id: 'sub-1',
          source: 'Beauty offer',
        },
        {
          email: 'shopper@example.com',
          id: 'sub-2',
          source: 'ecommerce-cta',
        },
        {
          email: 'creator@example.com',
          id: 'sub-3',
          source: 'Creator drops',
        },
      ])
    })

    expect(screen.getAllByText('3 readers subscribed.')).toHaveLength(2)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('connects pricing, nonprofit, fashion, and closing CTA email captures to Lakebed', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    const Pricing = NewsletterPricing.client.component as ComponentType<any>
    const Cta = NewsletterCta.client.component as ComponentType<any>
    const Nonprofit = NonprofitSubscribe.client.component as ComponentType<any>
    const Fashion = FashionStoreNewsletter.client
      .component as ComponentType<any>

    render(
      <>
        <Pricing
          props={{
            emailPlaceholder: 'tier@example.com',
            free: { submit: 'Join Free' },
            paid: { submit: 'Join Paid' },
          }}
          statementId="newsletter_pricing"
        />
        <Cta
          props={{
            emailPlaceholder: 'final@example.com',
            submit: 'Final Subscribe',
          }}
          statementId="newsletter_cta"
        />
        <Nonprofit
          props={{
            emailPlaceholder: 'supporter@example.com',
            submitCta: 'Join Movement',
            submitTarget: 'Nonprofit field updates',
          }}
          statementId="nonprofit_subscribe"
        />
        <Fashion
          props={{
            placeholder: 'style@example.com',
            submit: 'Join Style',
          }}
          statementId="fashion_newsletter"
        />
      </>,
    )

    expect(screen.getAllByText('0 readers subscribed.')).toHaveLength(5)

    fireEvent.change(
      screen.getByLabelText('Email address for free subscription'),
      {
        target: { value: 'Tier@Example.com' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Join Free' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'tier@example.com',
          id: 'sub-1',
          source: 'Join Free',
        },
      ])
    })

    fireEvent.change(screen.getByPlaceholderText('supporter@example.com'), {
      target: { value: 'helper@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Join Movement' }))

    await waitFor(() => {
      expect(subscribers()).toEqual([
        {
          email: 'tier@example.com',
          id: 'sub-1',
          source: 'Join Free',
        },
        {
          email: 'helper@example.com',
          id: 'sub-2',
          source: 'Nonprofit field updates',
        },
      ])
    })

    expect(screen.getAllByText('2 readers subscribed.')).toHaveLength(3)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('connects remaining subscribe and waitlist captures across verticals to Lakebed', async () => {
    const { lakebed, subscribers } = createNewsletterLakebedStub()
    lakebedRef.current = lakebed
    const Writer = WriterAuthorSubscribe.client.component as ComponentType<any>
    const Music = MusicArtistMailing.client.component as ComponentType<any>
    const Cafe = CafeNewsletter.client.component as ComponentType<any>
    const Newsroom = NewsroomSubscribe.client.component as ComponentType<any>
    const NewsroomSiteFooter = NewsroomFooter.client
      .component as ComponentType<any>
    const WaitlistHero = ComingSoonHero.client.component as ComponentType<any>
    const WaitlistCta = ComingSoonCta.client.component as ComponentType<any>
    const Fitness = FitnessCta.client.component as ComponentType<any>
    const Marketing = MarketingCta.client.component as ComponentType<any>
    const HotelFooter = HotelResortFooter.client.component as ComponentType<any>

    render(
      <>
        <Writer
          props={{
            buttonLabel: 'Join Writer',
            placeholder: 'writer@example.com',
          }}
          statementId="writer_subscribe"
        />
        <Music
          props={{
            placeholder: 'music@example.com',
            submit: 'Join Music',
          }}
          statementId="music_mailing"
        />
        <Cafe
          props={{
            placeholder: 'cafe@example.com',
            submit: 'Join Cafe',
            submitTarget: 'Cafe updates',
          }}
          statementId="cafe_newsletter"
        />
        <Newsroom
          props={{
            emailPlaceholder: 'newsroom@example.com',
            submitCta: 'Join News',
          }}
          statementId="newsroom_subscribe"
        />
        <NewsroomSiteFooter props={{}} statementId="newsroom_footer" />
        <WaitlistHero
          props={{
            emailPlaceholder: 'waitlist@example.com',
            submit: 'Join Waitlist',
          }}
          statementId="coming_soon_hero"
        />
        <WaitlistCta
          props={{
            emailPlaceholder: 'early@example.com',
            submit: 'Join Early',
          }}
          statementId="coming_soon_cta"
        />
        <Fitness
          props={{
            placeholder: 'fitness@example.com',
            submit: 'Join Fitness',
          }}
          statementId="fitness_cta"
        />
        <Marketing
          props={{
            action: 'Join Product',
            placeholder: 'work@example.com',
          }}
          statementId="marketing_cta"
        />
        <HotelFooter
          props={{
            newsletterCta: 'Stay Updated',
          }}
          statementId="hotel_footer"
        />
      </>,
    )

    const submissions = [
      {
        button: 'Join Writer',
        email: 'writer@example.com',
        input: () => screen.getByPlaceholderText('writer@example.com'),
        source: 'Join Writer',
      },
      {
        button: 'Join Music',
        email: 'music@example.com',
        input: () => screen.getByPlaceholderText('music@example.com'),
        source: 'Join Music',
      },
      {
        button: 'Join Cafe',
        email: 'cafe@example.com',
        input: () => screen.getByPlaceholderText('cafe@example.com'),
        source: 'Cafe updates',
      },
      {
        button: 'Join News',
        email: 'newsroom@example.com',
        input: () => screen.getByPlaceholderText('newsroom@example.com'),
        source: 'Join News',
      },
      {
        button: 'Subscribe',
        email: 'brief@example.com',
        input: () =>
          screen.getByLabelText('Email address for The Morning Brief'),
        source: 'Newsroom footer',
      },
      {
        button: 'Join Waitlist',
        email: 'waitlist@example.com',
        input: () => screen.getByPlaceholderText('waitlist@example.com'),
        source: 'Join Waitlist',
      },
      {
        button: 'Join Early',
        email: 'early@example.com',
        input: () => screen.getByPlaceholderText('early@example.com'),
        source: 'Join Early',
      },
      {
        button: 'Join Fitness',
        email: 'fitness@example.com',
        input: () => screen.getByPlaceholderText('fitness@example.com'),
        source: 'Join Fitness',
      },
      {
        button: 'Join Product',
        email: 'work@example.com',
        input: () => screen.getByPlaceholderText('work@example.com'),
        source: 'Join Product',
      },
      {
        button: 'Stay Updated',
        email: 'hotel@example.com',
        input: () => screen.getByLabelText('Your email'),
        source: 'Stay Updated',
      },
    ]

    for (const submission of submissions) {
      const input = submission.input()
      const submitButton = input
        .closest('form')
        ?.querySelector('button[type="submit"]')
      expect(submitButton).toBeTruthy()

      fireEvent.change(input, {
        target: { value: submission.email.toUpperCase() },
      })
      fireEvent.click(submitButton as HTMLElement)
    }

    await waitFor(() => {
      expect(subscribers()).toHaveLength(submissions.length)
    })

    expect(subscribers()).toEqual(
      submissions.map((submission, index) => ({
        email: submission.email,
        id: `sub-${index + 1}`,
        source: submission.source,
      })),
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})
