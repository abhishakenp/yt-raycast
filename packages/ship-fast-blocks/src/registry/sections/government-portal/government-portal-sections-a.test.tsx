// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import type { ComponentRenderProps } from '@openuidev/react-lang'
import type { ReactElement } from 'react'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => ({}),
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
import { GovernmentPortalNavbar } from './GovernmentPortalNavbar.tsx'
import { GovernmentPortalHero } from './GovernmentPortalHero.tsx'
import { GovernmentPortalServices } from './GovernmentPortalServices.tsx'
import { GovernmentPortalStats } from './GovernmentPortalStats.tsx'
import { GovernmentPortalFooter } from './GovernmentPortalFooter.tsx'

const NAV_BLUE = '#3346B5'
const TOPBAR_BLUE = '#0792D0'
const FOOTER_INDIGO = '#4B57A0'

const SPINE = [
  ['GovernmentPortalNavbar', GovernmentPortalNavbar],
  ['GovernmentPortalHero', GovernmentPortalHero],
  ['GovernmentPortalServices', GovernmentPortalServices],
  ['GovernmentPortalStats', GovernmentPortalStats],
  ['GovernmentPortalFooter', GovernmentPortalFooter],
] as const

const renderCapsule = <P,>(
  Component: (props: ComponentRenderProps<P>) => ReactElement,
  props: P,
) => render(<Component props={props} statementId="test" />)

afterEach(() => {
  cleanup()
  navigate.mockReset()
  vi.useRealTimers()
})

describe('government-portal sections (batch A — spine)', () => {
  describe('every spine capsule is a defineCapsule product', () => {
    for (const [name, capsule] of SPINE) {
      it(`${name} is a capsule with the correct name and a retrieval-rich description`, () => {
        expect(isCapsule(capsule)).toBe(true)
        expect(capsule.client.name).toBe(name)
        const desc = capsule.client.description.toLowerCase()
        expect(desc).toContain('government')
        expect(desc).toMatch(/tender|psu/)
        expect(desc).toContain('public sector')
        expect(desc).toContain('classic')
        expect(desc).toContain('portal')
      })
    }
  })

  describe('GovernmentPortalNavbar', () => {
    it('renders the three-tier gov header with emblem, org name and mega-nav', () => {
      const { container } = renderCapsule(GovernmentPortalNavbar.client.component, {})
      // Utility top bar carries the light-blue token; mega-nav carries royal-blue.
      expect(container.innerHTML).toContain(TOPBAR_BLUE)
      expect(container.innerHTML).toContain(NAV_BLUE)
      // Official org name + Hindi subtitle render in the white header band
      // (also echoed by the mobile SiteNav brand, so assert presence).
      expect(container.textContent).toContain('TENUGHAT VIDYUT NIGAM LIMITED')
      expect(container.textContent).toMatch(/A Government of Jharkhand Undertaking/)
      // Mega-nav exposes the tender / notice retrieval anchors.
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy()
      expect(screen.getAllByText('Tenders').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Notices').length).toBeGreaterThan(0)
    })

    it('routes top-bar and nav clicks through useNavigate', () => {
      renderCapsule(GovernmentPortalNavbar.client.component, {})
      fireEvent.click(screen.getByRole('button', { name: 'Career' }))
      expect(navigate).toHaveBeenCalledWith('Career')
      fireEvent.click(screen.getByRole('button', { name: 'Events' }))
      expect(navigate).toHaveBeenCalledWith('Events')
    })

    it('nav prop schema accepts flat strings and structured items, rejects bad input', () => {
      const schema = GovernmentPortalNavbar.props
      expect(schema.safeParse({ nav: ['Home', 'About'] }).success).toBe(true)
      expect(
        schema.safeParse({
          nav: [{ label: 'Home', children: ['Sub'] }],
        }).success,
      ).toBe(true)
      expect(schema.safeParse({ nav: [123] }).success).toBe(false)
    })

    it('opens a mobile drawer via the section-kit SiteNav instead of navigating', () => {
      renderCapsule(GovernmentPortalNavbar.client.component, {
        nav: ['Home', 'Tenders', 'Contact'],
      })
      const menuButton = screen.getByRole('button', { name: 'Open menu' })
      fireEvent.click(menuButton)
      // The SiteNav mobile drawer (Sheet/dialog) opens with the nav labels.
      expect(screen.getByRole('dialog')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Tenders' })).toBeTruthy()
      // Opening the drawer must not jump to the first route.
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  describe('GovernmentPortalHero', () => {
    it('renders the notice ticker with gov / tender terms', () => {
      const { container } = renderCapsule(GovernmentPortalHero.client.component, {})
      expect(container.innerHTML).toContain(NAV_BLUE)
      expect(container.innerHTML).toContain(TOPBAR_BLUE)
      // Ticker bar renders the welcome + tender notice text.
      expect(
        screen.getByText(/official portal of Tenughat Vidyut Nigam Limited/),
      ).toBeTruthy()
      expect(screen.getByText(/tender notices/i)).toBeTruthy()
    })

    it('advances the carousel when the next button is clicked', () => {
      renderCapsule(GovernmentPortalHero.client.component, {})
      expect(screen.getByText(/Tenughat Thermal Power Station/)).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(screen.getByText(/Reliable generation/)).toBeTruthy()
    })

    it('auto-advances the carousel on a 5s interval', () => {
      vi.useFakeTimers()
      renderCapsule(GovernmentPortalHero.client.component, {})
      expect(screen.getByText(/Tenughat Thermal Power Station/)).toBeTruthy()
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByText(/Reliable generation/)).toBeTruthy()
    })
  })

  describe('GovernmentPortalServices', () => {
    it('renders the four colored department quick-link cards', () => {
      renderCapsule(GovernmentPortalServices.client.component, {})
      const titles = ['Power Generation', 'Business', 'Environment', 'Sustainability']
      for (const title of titles) {
        const card = screen.getByRole('button', { name: new RegExp(title) })
        // Each card carries its signature color as an inline background.
        expect(card.style.backgroundColor).not.toBe('')
      }
      expect(
        screen.getByText('Citizen Services & Departments'),
      ).toBeTruthy()
    })

    it('routes a card click through useNavigate', () => {
      renderCapsule(GovernmentPortalServices.client.component, {})
      fireEvent.click(screen.getByRole('button', { name: /Power Generation/ }))
      expect(navigate).toHaveBeenCalledWith('Power Generation')
    })
  })

  describe('GovernmentPortalStats', () => {
    it('renders the formal key-figures strip on the gov-blue band', () => {
      const { container } = renderCapsule(GovernmentPortalStats.client.component, {})
      expect(container.innerHTML).toContain(NAV_BLUE)
      expect(screen.getByText('TVNL at a Glance')).toBeTruthy()
      // The section-kit StatGrid composite renders the figure cells.
      expect(screen.getByText('Installed Capacity')).toBeTruthy()
      expect(screen.getByText('420 MW')).toBeTruthy()
    })
  })

  describe('GovernmentPortalFooter', () => {
    it('renders the indigo gov footer with important links + auto-year copyright', () => {
      const { container } = renderCapsule(GovernmentPortalFooter.client.component, {})
      expect(container.innerHTML).toContain(FOOTER_INDIGO)
      expect(screen.getByText('Important Links:')).toBeTruthy()
      const govLink = screen.getByRole('link', { name: 'Government of Jharkhand' })
      expect(govLink.getAttribute('href')).toBe('https://www.jharkhand.gov.in/')
      // Copyright row auto-updates via getFullYear — the year is split across
      // text nodes, so assert it appears in the rendered text content.
      expect(container.textContent).toContain(String(new Date().getFullYear()))
    })

    it('routes the org-name copyright button through useNavigate', () => {
      renderCapsule(GovernmentPortalFooter.client.component, {})
      fireEvent.click(
        screen.getByRole('button', { name: /TENUGHAT VIDYUT NIGAM LIMITED/ }),
      )
      expect(navigate).toHaveBeenCalledWith('TENUGHAT VIDYUT NIGAM LIMITED')
    })
  })

  it('the family carries all three classic-gov chrome tokens in rendered output', () => {
    const all = SPINE.map(([, capsule]) => {
      const { container, unmount } = renderCapsule(capsule.client.component, {})
      const html = container.innerHTML
      unmount()
      return html
    }).join('\n')
    for (const token of [TOPBAR_BLUE, NAV_BLUE, FOOTER_INDIGO]) {
      expect(all).toContain(token)
    }
  })
})
