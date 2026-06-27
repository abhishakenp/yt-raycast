// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { ComponentRenderProps } from '@openuidev/react-lang'
import type { ReactElement } from 'react'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
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

import * as registry from '#/registry/all.ts'
import {
  createLibrary,
  isCapsule,
  isDefinedComponent,
  type ShipFastCapsule,
} from '#/capsules/openui.ts'
import { library, componentNames } from '#/library.ts'
import { Button } from '#/registry/primitives/button.tsx'
import { GovernmentPortalNavbar } from '#/registry/sections/government-portal/GovernmentPortalNavbar.tsx'
import { GovernmentPortalFaq } from '#/registry/sections/government-portal/GovernmentPortalFaq.tsx'
import { GovernmentPortalStats } from '#/registry/sections/government-portal/GovernmentPortalStats.tsx'

const renderCapsule = <P,>(
  Component: (props: ComponentRenderProps<P>) => ReactElement,
  props: P,
) => render(<Component props={props} statementId="invariant-test" />)

afterEach(() => {
  cleanup()
})

describe('registry capsule invariants', () => {
  it('every registry capsule is a defineCapsule product (runtime marker)', () => {
    const capsules = Object.values(registry).filter(
      (value): value is ShipFastCapsule => isCapsule(value),
    )
    // The registry ships many capsules (primitives + section families).
    expect(capsules.length).toBeGreaterThan(20)
    for (const capsule of capsules) {
      // isCapsule already verified the marker; assert the structural shape too.
      expect(isCapsule(capsule)).toBe(true)
      expect(typeof capsule.client.name).toBe('string')
      expect(capsule.client.name.length).toBeGreaterThan(0)
      expect(typeof capsule.client.component).toBe('function')
      expect(isDefinedComponent(capsule.client)).toBe(true)
      // Every capsule carries the default Lakebed config stamped by defineCapsule.
      expect(capsule.lakebed).toBeDefined()
      expect(capsule.lakebed?.queries).toBeDefined()
      expect(capsule.lakebed?.mutations).toBeDefined()
    }
  })

  it('defineCapsule stamps data-openui-component on rendered output across families', () => {
    // Representative sample: a leaf primitive + several section capsules.
    // Each is rendered and its root element must carry the capsule name as the
    // data-openui-component attribute — the runtime marker stamped by
    // defineCapsule's wrapper.
    const button = renderCapsule(Button.client.component, { label: 'Click me' })
    expect(
      button.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('Button')

    const navbar = renderCapsule(GovernmentPortalNavbar.client.component, {})
    expect(
      navbar.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('GovernmentPortalNavbar')

    const faq = renderCapsule(GovernmentPortalFaq.client.component, {})
    expect(
      faq.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('GovernmentPortalFaq')

    const stats = renderCapsule(GovernmentPortalStats.client.component, {})
    expect(
      stats.container.firstElementChild?.getAttribute('data-openui-component'),
    ).toBe('GovernmentPortalStats')
  })

  it('isCapsule rejects non-capsule values', () => {
    expect(isCapsule(null)).toBe(false)
    expect(isCapsule(undefined)).toBe(false)
    expect(isCapsule({})).toBe(false)
    expect(isCapsule({ name: 'x' })).toBe(false)
    // A plain function (raw defineComponent output without the wrapper) is not a
    // Ship Fast capsule — it lacks the `client` / `lakebed` envelope.
    expect(isCapsule(() => null)).toBe(false)
  })

  it('assembles the library from registry capsules via the Ship Fast createLibrary wrapper', () => {
    // createLibrary and isCapsule are the Ship Fast wrappers (not OpenUI's
    // defineComponent) — they must be callable functions.
    expect(typeof createLibrary).toBe('function')
    expect(typeof isCapsule).toBe('function')
    // The assembled library exposes every registry capsule by name.
    expect(Object.keys(library.components).length).toBeGreaterThan(20)
    expect(componentNames.length).toBeGreaterThan(20)
    // Every library component is a defined component (has name/props/component).
    for (const name of componentNames) {
      const component = library.components[name]
      expect(component).toBeDefined()
      expect(isDefinedComponent(component)).toBe(true)
    }
  })
})
