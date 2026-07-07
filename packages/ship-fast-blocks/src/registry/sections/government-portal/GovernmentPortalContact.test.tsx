// @vitest-environment jsdom

import type { ComponentType } from 'react'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedQueryStub,
  createLakebedMutationStub,
} from '@ship-fast/lakebed/test-helpers'
import type { InquiryLakebed } from '../contact/inquiry-interactions.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'

type InquiryActionInput = Parameters<
  typeof inquiryLakebed.mutations.recordContactAction
>[1]
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

const lakebedRef: { current: InquiryLakebed | null } = { current: null }

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

if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}

if (
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.scrollIntoView === 'undefined'
) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { GovernmentPortalContact } =
  await import('./GovernmentPortalContact.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createInquiryLakebedStub() {
  let version = 0
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
      return { actions: [], count: 0, latest: undefined }
    },
  })

  const useMutation = createLakebedMutationStub<typeof inquiryLakebed>({
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
    recordContactAction: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (_input: InquiryActionInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)

        try {
          notify()
          return []
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
      provider: 'guest',
      userId: 'guest:local',
      displayName: 'Guest',
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
    }),
    useData: () => ({ actions: [], inquiries }),
    useQuery,
    useMutation,
  }

  return { inquiries: () => inquiries, lakebed }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
})

describe('GovernmentPortalContact fullstack behavior', () => {
  it('submits the grievance form through the Lakebed inquiry mutation', async () => {
    const { inquiries, lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Contact: InquiryComponent = GovernmentPortalContact.client.component

    render(<Contact props={{}} />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Rajesh Kumar' },
    })
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'rajesh@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Pension disbursement delay' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'My pension has not been credited for three months.' },
    })

    const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
    if (!form) throw new Error('Expected submit button inside a form')
    fireEvent.submit(form)

    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(inquiries()[0]).toMatchObject({
      email: 'rajesh@example.com',
      message: 'My pension has not been credited for three months.',
      name: 'Rajesh Kumar',
      source: 'Government portal grievance',
      subject: 'Pension disbursement delay',
    })
    expect(inquiries()[0]?.fieldsJson).toBe(
      JSON.stringify({
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        subject: 'Pension disbursement delay',
        message: 'My pension has not been credited for three months.',
      }),
    )
    expect(screen.getAllByText(/1 total inquiry/i).length).toBeGreaterThan(0)
  })

  it('keeps the officials directory and office address cards rendered', () => {
    const { lakebed } = createInquiryLakebedStub()
    lakebedRef.current = lakebed
    const Contact: InquiryComponent = GovernmentPortalContact.client.component

    render(<Contact props={{}} />)

    expect(screen.getByText('Head Office')).toBeTruthy()
    expect(screen.getByText('Plant Office')).toBeTruthy()
    expect(screen.getByText('Officials Directory')).toBeTruthy()
    expect(screen.getByText('Shri Anil Kumar Sharma')).toBeTruthy()
    expect(screen.getByText('Managing Director')).toBeTruthy()
  })
})
