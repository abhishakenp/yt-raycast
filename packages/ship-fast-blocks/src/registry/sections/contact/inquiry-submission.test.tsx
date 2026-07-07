// @vitest-environment jsdom

import type { ComponentType } from 'react'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedQueryStub,
  createLakebedMutationStub,
} from '@ship-fast/lakebed/test-helpers'
import type { InquiryLakebed } from './inquiry-interactions.tsx'
import type { inquiryLakebed } from './inquiry-lakebed.ts'

type InquiryActionInput = Parameters<
  typeof inquiryLakebed.mutations.recordContactAction
>[1]
type InquiryActionRecord = {
  createdAt: string
  id: string
  kind: string
  label: string
  source: string
  target: string
  updatedAt: string
}
type InquiryInput = Parameters<typeof inquiryLakebed.mutations.submitInquiry>[1]
type InquiryRecord = {
  createdAt: string
  email: string
  fieldsJson: string
  id: string
  message: string
  name: string
  phone: string
  source: string
  subject: string
  updatedAt: string
}
type InquiryComponent = ComponentType<{
  props: Record<string, unknown>
  statementId?: string
}>

const navigate = vi.fn()
const lakebedRef: { current: InquiryLakebed | null } = { current: null }

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
  const requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: number) => clearTimeout(id)

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('FormData', dom.window.FormData)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLFormElement', dom.window.HTMLFormElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('HTMLSelectElement', dom.window.HTMLSelectElement)
  defineGlobal('HTMLTextAreaElement', dom.window.HTMLTextAreaElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
  defineGlobal('NodeFilter', dom.window.NodeFilter)
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

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { AgencyContactCta } = await import('../agency/AgencyContactCta.tsx')
const { BootcampApplyCta } = await import('../bootcamp/BootcampApplyCta.tsx')
const { ConstructionQuote } =
  await import('../construction/ConstructionQuote.tsx')
const { EventPlannerContact } =
  await import('../event-planner/EventPlannerContact.tsx')
const { EventPlannerHero } =
  await import('../event-planner/EventPlannerHero.tsx')
const { EventPlannerNavbar } =
  await import('../event-planner/EventPlannerNavbar.tsx')
const { EventPlannerPricing } =
  await import('../event-planner/EventPlannerPricing.tsx')
const { FoodTruckCatering } =
  await import('../food-truck/FoodTruckCatering.tsx')
const { InteriorDesignContactCta } =
  await import('../interior-design/InteriorDesignContactCta.tsx')
const { LawFirmContact } = await import('../law-firm/LawFirmContact.tsx')
const { ContactFormDetails } = await import('./ContactFormDetails.tsx')
const { ContactNavbar } = await import('./ContactNavbar.tsx')

const submitButtonForm = (button: HTMLElement) => {
  const form = button.closest('form')
  if (!form || form.tagName !== 'FORM') {
    throw new Error('Expected submit button to be inside a form')
  }

  fireEvent.submit(form)
}

const now = '2026-06-26T00:00:00.000Z'

function createInquiryLakebedStub() {
  let version = 0
  let actions: InquiryActionRecord[] = []
  let inquiries: InquiryRecord[] = []
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const normalize = (value: unknown) => String(value ?? '').trim()
  const normalizeEmail = (value: unknown) => normalize(value).toLowerCase()
  const pickField = (fields: Record<string, string>, keys: string[]) => {
    for (const key of keys) {
      const value = fields[key]?.trim()
      if (value) return value
    }

    return ''
  }

  const useQuery = createLakebedQueryStub<typeof inquiryLakebed>({
    inquirySummary: () => {
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

      return {
        count: inquiries.length,
        inquiries,
        latest: inquiries.at(-1),
      }
    },
    actionSummary: () => {
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

      return {
        actions,
        count: actions.length,
        latest: actions.at(-1),
      }
    },
  })

  const useMutation = createLakebedMutationStub<typeof inquiryLakebed>({
    recordContactAction: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: InquiryActionInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)

        try {
          actions = [
            ...actions,
            {
              createdAt: now,
              id: `action-${actions.length + 1}`,
              kind: normalize(input.kind) || 'contact',
              label: normalize(input.label) || 'Contact',
              source: normalize(input.source),
              target: normalize(input.target),
              updatedAt: now,
            },
          ]

          notify()
          return actions
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])

      const initialLastError: unknown | null = null
      const mutation = useMemo(
        () =>
          Object.assign((input: InquiryActionInput) => runMutation(input), {
            isPending: false,
            lastError: initialLastError,
            pendingCount: 0,
            reset,
          }),
        [reset, runMutation],
      )

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
    submitInquiry: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: InquiryInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)

        try {
          const fields = input.fields ?? {}
          inquiries = [
            ...inquiries,
            {
              createdAt: now,
              email: normalizeEmail(
                input.email || pickField(fields, ['email', 'emailAddress']),
              ),
              fieldsJson: JSON.stringify(fields),
              id: `inquiry-${inquiries.length + 1}`,
              message: normalize(
                input.message ||
                  pickField(fields, ['message', 'vision', 'details', 'notes']),
              ),
              name: normalize(
                input.name ||
                  pickField(fields, [
                    'name',
                    'fullName',
                    'firstName',
                    'first',
                    'lastName',
                  ]),
              ),
              phone: normalize(input.phone || pickField(fields, ['phone'])),
              source: normalize(input.source),
              subject: normalize(
                input.subject ||
                  pickField(fields, [
                    'subject',
                    'service',
                    'eventType',
                    'projectType',
                    'budget',
                    'date',
                  ]),
              ),
              updatedAt: now,
            },
          ]

          notify()
          return inquiries
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])

      const initialLastError: unknown | null = null
      const mutation = useMemo(
        () =>
          Object.assign((input: InquiryInput) => runMutation(input), {
            isPending: false,
            lastError: initialLastError,
            pendingCount: 0,
            reset,
          }),
        [reset, runMutation],
      )

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  })

  const lakebed: InquiryLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest' as const,
      userId: 'guest:local',
      displayName: 'Guest',
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest' as const,
        userId: 'guest:local',
      },
    }),
    useData: () => ({ actions, inquiries }),
    useQuery,
    useMutation,
  }

  return { actions: () => actions, inquiries: () => inquiries, lakebed }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('inquiry submission capsules', () => {
  it('records contact navbar CTAs and keeps nav links as navigation', async () => {
    const { actions, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar: InquiryComponent = ContactNavbar.client.component

    render(
      <Navbar
        props={{
          ctaLabel: 'Talk to sales',
          ctaTarget: 'Contact form',
          nav: ['Features', 'Pricing'],
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /talk to sales/i }))

    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      kind: 'cta',
      label: 'Talk to sales',
      source: 'navbar',
      target: 'Contact form',
    })
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getAllByText('Talk to sales').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Features' }))
    expect(navigate).toHaveBeenCalledWith('Features')
  })

  it('uses a Shoo profile dropdown and Sheet hamburger menu', async () => {
    const { lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar: InquiryComponent = ContactNavbar.client.component

    render(<Navbar props={{ nav: ['Services', 'FAQ'] }} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: /shoo account/i }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(lakebed.signInWithGoogle).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const menu = await screen.findByRole('dialog')
    expect(menu.textContent).toContain('Orbit Digital')
    fireEvent.click(within(menu).getByRole('button', { name: 'FAQ' }))
    expect(navigate).toHaveBeenCalledWith('FAQ')
  })

  it('records event planner conversion CTAs while keeping normal links routable', async () => {
    const { actions, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = EventPlannerNavbar.client.component
    const Hero = EventPlannerHero.client.component
    const Pricing = EventPlannerPricing.client.component

    render(
      <>
        <Navbar
          props={{
            ctaLabel: 'Book Consultation',
            nav: ['Services', 'Gallery'],
          }}
          statementId="event_nav"
        />
        <Hero
          props={{
            primaryCta: 'Start Planning',
            secondaryCta: 'View Our Work',
          }}
          statementId="event_hero"
        />
        <Pricing
          props={{
            cta: 'Inquire',
            tiers: [
              {
                features: ['Six months of planning support'],
                name: 'Signature',
                popular: true,
                price: '$5,500',
                tagline: 'Partial planning',
              },
            ],
          }}
          statementId="event_pricing"
        />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Book Consultation' }))
    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      kind: 'cta',
      label: 'Book Consultation',
      source: 'Event planner navbar',
      target: 'Book Consultation',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const menu = await screen.findByRole('dialog')
    fireEvent.click(
      within(menu).getByRole('button', { name: 'Book Consultation' }),
    )
    await waitFor(() => expect(actions()).toHaveLength(2))
    expect(actions()[1]).toMatchObject({
      kind: 'cta',
      label: 'Book Consultation',
      source: 'Event planner mobile menu',
      target: 'Book Consultation',
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: 'Start Planning' }))
    await waitFor(() => expect(actions()).toHaveLength(3))
    expect(actions()[2]).toMatchObject({
      kind: 'cta',
      label: 'Start Planning',
      source: 'Event planner hero',
      target: 'Start Planning',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Inquire' }))
    await waitFor(() => expect(actions()).toHaveLength(4))
    expect(actions()[3]).toMatchObject({
      kind: 'pricing',
      label: 'Inquire Signature',
      source: 'Event planner pricing',
      target: 'Signature',
    })

    fireEvent.click(screen.getByRole('button', { name: 'View Our Work' }))
    fireEvent.click(screen.getByRole('button', { name: 'Services' }))

    expect(navigate).toHaveBeenCalledWith('View Our Work')
    expect(navigate).toHaveBeenCalledWith('Services')
    expect(navigate).not.toHaveBeenCalledWith('Book Consultation')
    expect(navigate).not.toHaveBeenCalledWith('Start Planning')
    expect(navigate).not.toHaveBeenCalledWith('Inquire Signature')
  })

  it('opens contact detail actions in a Sheet and stores the action', async () => {
    const { actions, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Contact: InquiryComponent = ContactFormDetails.client.component

    render(<Contact props={{ details: { socials: ['LinkedIn'] } }} />)

    fireEvent.click(screen.getByRole('button', { name: 'LinkedIn' }))

    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      kind: 'contact',
      label: 'LinkedIn',
      source: 'Contact details',
      target: 'LinkedIn',
    })
    expect((await screen.findByRole('dialog')).textContent).toContain(
      'Connect on LinkedIn',
    )
    expect(navigate).not.toHaveBeenCalled()
  })

  it('submits contact details through Lakebed without routing away', async () => {
    const { inquiries, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Contact: InquiryComponent = ContactFormDetails.client.component
    const Agency: InquiryComponent = AgencyContactCta.client.component

    render(
      <>
        <Contact props={{}} statementId="contact" />
        <Agency props={{}} statementId="agency" />
      </>,
    )

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: ' Ada Lovelace ' },
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: ' Ada@Example.COM ' },
    })
    fireEvent.change(
      screen.getByLabelText('Message', { selector: '#cfd-message' }),
      {
        target: { value: 'I need a launch site.' },
      },
    )
    const [contactSubmitButton] = screen.getAllByRole('button', {
      name: /send message/i,
    })
    if (!contactSubmitButton) {
      throw new Error('Expected contact submit button to render')
    }
    submitButtonForm(contactSubmitButton)

    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(navigate).not.toHaveBeenCalled()
    expect(inquiries()[0]).toMatchObject({
      email: 'ada@example.com',
      message: 'I need a launch site.',
      name: 'Ada Lovelace',
      source: 'Contact form',
    })
    expect(screen.getAllByText(/1 total inquiry/i).length).toBeGreaterThan(0)
  })

  it('captures service-specific form fields and keeps submit buttons scoped', async () => {
    const { inquiries, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Construction: InquiryComponent = ConstructionQuote.client.component

    render(<Construction props={{ submit: 'Request Estimate' }} />)

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Grace Hopper' },
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'grace@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '(555) 100-2000' },
    })
    fireEvent.change(screen.getByLabelText('Project Type'), {
      target: { value: 'Kitchen Remodel' },
    })
    fireEvent.change(screen.getByLabelText('Project Details'), {
      target: { value: 'Open kitchen and storage wall.' },
    })
    submitButtonForm(screen.getByRole('button', { name: /request estimate/i }))

    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(inquiries()[0]).toMatchObject({
      email: 'grace@example.com',
      message: 'Open kitchen and storage wall.',
      name: 'Grace Hopper',
      phone: '(555) 100-2000',
      source: 'Construction estimate',
      subject: 'Kitchen Remodel',
    })
    expect(inquiries()[0]?.fieldsJson).toBe(
      JSON.stringify({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        phone: '(555) 100-2000',
        projectType: 'Kitchen Remodel',
        budget: 'Select budget range',
        timeline: 'Select timeline',
        message: 'Open kitchen and storage wall.',
      }),
    )
    expect(navigate).not.toHaveBeenCalled()
  })

  it('keeps migrated vertical forms on Lakebed submissions instead of navigation', async () => {
    const scenarios: Array<{
      Component: InquiryComponent
      expected: Partial<InquiryRecord>
      fill: () => void
      name: string
      props?: Record<string, unknown>
      submitName: RegExp
    }> = [
      {
        Component: EventPlannerContact.client.component,
        expected: {
          email: 'event@example.com',
          name: 'Maya',
          source: 'Event planner inquiry',
          subject: 'Wedding',
        },
        fill: () => {
          fireEvent.change(screen.getByLabelText('First Name'), {
            target: { value: 'Maya' },
          })
          fireEvent.change(screen.getByLabelText('Email Address'), {
            target: { value: 'event@example.com' },
          })
          fireEvent.change(screen.getByLabelText('Event Type'), {
            target: { value: 'Wedding' },
          })
        },
        name: 'event planner',
        submitName: /send inquiry/i,
      },
      {
        Component: InteriorDesignContactCta.client.component,
        expected: {
          email: 'interior@example.com',
          name: 'Riley',
          source: 'Interior design consultation',
          subject: 'Residential — Full Home',
        },
        fill: () => {
          fireEvent.change(screen.getByLabelText('First Name'), {
            target: { value: 'Riley' },
          })
          fireEvent.change(screen.getByLabelText('Email Address'), {
            target: { value: 'interior@example.com' },
          })
          fireEvent.change(screen.getByLabelText('Project Type'), {
            target: { value: 'Residential — Full Home' },
          })
        },
        name: 'interior design',
        submitName: /request consultation/i,
      },
      {
        Component: FoodTruckCatering.client.component,
        expected: {
          email: 'catering@example.com',
          name: 'Sam',
          source: 'Food truck catering',
          subject: 'Wedding',
        },
        fill: () => {
          fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'Sam' },
          })
          fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'catering@example.com' },
          })
          fireEvent.change(screen.getByLabelText('Event Type'), {
            target: { value: 'Wedding' },
          })
        },
        name: 'food truck',
        submitName: /request quote/i,
      },
      {
        Component: LawFirmContact.client.component,
        expected: {
          email: 'legal@example.com',
          name: 'Casey',
          source: 'Law firm consultation',
        },
        fill: () => {
          fireEvent.change(screen.getByLabelText('First Name'), {
            target: { value: 'Casey' },
          })
          fireEvent.change(screen.getByLabelText('Email Address'), {
            target: { value: 'legal@example.com' },
          })
        },
        name: 'law firm',
        submitName: /submit request/i,
      },
      {
        Component: BootcampApplyCta.client.component,
        expected: {
          email: 'student@example.com',
          name: 'Jordan',
          source: 'Bootcamp application',
        },
        fill: () => {
          fireEvent.change(screen.getByLabelText('First name'), {
            target: { value: 'Jordan' },
          })
          fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'student@example.com' },
          })
        },
        name: 'bootcamp',
        submitName: /start your application/i,
      },
    ]

    for (const scenario of scenarios) {
      cleanup()
      navigate.mockReset()
      const { inquiries, lakebed } = createInquiryLakebedStub()
      lakebedRef.current = lakebed

      render(<scenario.Component props={scenario.props ?? {}} />)
      scenario.fill()
      submitButtonForm(
        screen.getByRole('button', { name: scenario.submitName }),
      )

      await waitFor(() => expect(inquiries()).toHaveLength(1))
      expect(inquiries()[0]).toMatchObject(scenario.expected)
      expect(navigate, scenario.name).not.toHaveBeenCalled()
    }
  })
})
