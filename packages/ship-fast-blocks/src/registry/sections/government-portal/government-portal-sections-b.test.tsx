// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentRenderProps } from '@openuidev/react-lang'
import type { ReactElement } from 'react'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => ({
    useQuery: () => ({ count: 0, inquiries: [], latest: undefined }),
    useMutation: () => {
      const fn = vi.fn(async () => undefined)
      return Object.assign(fn, {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset: vi.fn(),
      })
    },
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      user: null,
    }),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
  useAuth: () => ({
    isAuthenticated: false,
    isGuest: true,
    isLoading: false,
    user: null,
  }),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

import { isCapsule } from '#/capsules/openui.ts'
import { GovernmentPortalEvents } from './GovernmentPortalEvents.tsx'
import { GovernmentPortalAbout } from './GovernmentPortalAbout.tsx'
import { GovernmentPortalFaq } from './GovernmentPortalFaq.tsx'
import { GovernmentPortalContact } from './GovernmentPortalContact.tsx'

const CONTENT = [
  ['GovernmentPortalEvents', GovernmentPortalEvents],
  ['GovernmentPortalAbout', GovernmentPortalAbout],
  ['GovernmentPortalFaq', GovernmentPortalFaq],
  ['GovernmentPortalContact', GovernmentPortalContact],
] as const

const renderCapsule = <P,>(
  Component: (props: ComponentRenderProps<P>) => ReactElement,
  props: P,
) => render(<Component props={props} statementId="test" />)

afterEach(() => {
  cleanup()
  navigate.mockReset()
})

describe('government-portal sections (batch B)', () => {
  describe('every content capsule is a defineCapsule product', () => {
    for (const [name, capsule] of CONTENT) {
      it(`${name} is a capsule with the correct name and a retrieval-rich description`, () => {
        expect(isCapsule(capsule)).toBe(true)
        expect(capsule.client.name).toBe(name)
        const desc = capsule.client.description.toLowerCase()
        expect(desc).toContain('government')
        expect(desc).toMatch(/tender|notice/)
        expect(desc).toMatch(/public sector|psu|civic|citizen|portal/)
      })
    }
  })

  describe('GovernmentPortalEvents', () => {
    it('renders the four-tab notice board and swaps panels on tab click', () => {
      renderCapsule(GovernmentPortalEvents.client.component, {})
      const tablist = screen.getByRole('tablist')
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(4)
      expect(tablist.textContent).toContain('Tenders')
      expect(tablist.textContent).toContain('Notices')
      expect(tablist.textContent).toContain('Downloads')
      expect(tablist.textContent).toContain('Public Notices')

      // Tenders is active by default — its NIT rows are visible.
      expect(screen.getByText(/NIT No: 07/)).toBeTruthy()

      // Switching to Notices reveals the extension-notice row.
      fireEvent.click(screen.getByRole('tab', { name: 'Notices' }))
      expect(screen.getByText(/Extension Notice for NIT No/)).toBeTruthy()
      // The tenders row is now hidden.
      expect(screen.queryByText(/NIT No: 07/)).toBeNull()
    })

    it('routes a tender row click through useNavigate', () => {
      renderCapsule(GovernmentPortalEvents.client.component, {})
      fireEvent.click(screen.getByRole('button', { name: /NIT No: 07/ }))
      expect(navigate).toHaveBeenCalledWith('/tenders/07')
    })
  })

  describe('GovernmentPortalContact', () => {
    it('renders a grievance / enquiry form with the four fields and a submit flow', async () => {
      const { container } = renderCapsule(
        GovernmentPortalContact.client.component,
        {},
      )
      const form = container.querySelector('form')
      expect(form).not.toBeNull()
      // The four enquiry fields are labelled and present.
      expect(screen.getByLabelText('Name')).toBeTruthy()
      expect(screen.getByLabelText('E-mail')).toBeTruthy()
      expect(screen.getByLabelText('Subject')).toBeTruthy()
      expect(screen.getByLabelText('Message')).toBeTruthy()

      // Submitting the form shows the acknowledgement message via Lakebed.
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'Citizen' },
      })
      fireEvent.change(screen.getByLabelText('E-mail'), {
        target: { value: 'citizen@gov.in' },
      })
      fireEvent.change(screen.getByLabelText('Message'), {
        target: { value: 'Grievance' },
      })
      fireEvent.submit(form!)
      expect(
        await screen.findByText(/Thank you — your enquiry has been received/),
      ).toBeTruthy()
    })

    it('renders the officials directory with email links', () => {
      renderCapsule(GovernmentPortalContact.client.component, {})
      expect(screen.getByText('Officials Directory')).toBeTruthy()
      expect(screen.getByText('Shri Anil Kumar Sharma')).toBeTruthy()
      const mdLink = screen.getByRole('link', { name: 'md@gov-portal.in' })
      expect(mdLink.getAttribute('href')).toBe('mailto:md@gov-portal.in')
    })
  })

  describe('GovernmentPortalAbout', () => {
    it('renders the leader message box and the overview prose column', () => {
      renderCapsule(GovernmentPortalAbout.client.component, {})
      // Leader message box.
      expect(screen.getByText("Managing Director's Message")).toBeTruthy()
      expect(screen.getByText('Sri Anil Kumar Shukla')).toBeTruthy()
      expect(screen.getByText('Managing Director')).toBeTruthy()
      // Overview prose column heading + body.
      expect(screen.getByText('About / Overview')).toBeTruthy()
      expect(screen.getByText(/State Government undertaking/)).toBeTruthy()
    })

    it('routes the read-more link through useNavigate', () => {
      renderCapsule(GovernmentPortalAbout.client.component, {})
      fireEvent.click(screen.getByRole('button', { name: 'Read more...' }))
      expect(navigate).toHaveBeenCalledWith('/about/md-message')
    })
  })

  describe('GovernmentPortalFaq', () => {
    it('renders an accordion whose first item is expanded and toggles on click', () => {
      renderCapsule(GovernmentPortalFaq.client.component, {})
      const questions = screen.getAllByRole('button', {
        name: /How do I|How can I|What documents|Who do I contact/,
      })
      expect(questions.length).toBeGreaterThanOrEqual(4)

      // First item is expanded by default — its answer is visible.
      const firstAnswer = 'Submit your Right to Information request in writing'
      expect(screen.getByText(new RegExp(firstAnswer))).toBeTruthy()

      // The first question button reports aria-expanded=true initially.
      expect(questions[0].getAttribute('aria-expanded')).toBe('true')

      // Clicking the first question collapses it.
      fireEvent.click(questions[0])
      expect(questions[0].getAttribute('aria-expanded')).toBe('false')
      expect(screen.queryByText(new RegExp(firstAnswer))).toBeNull()
    })
  })
})
