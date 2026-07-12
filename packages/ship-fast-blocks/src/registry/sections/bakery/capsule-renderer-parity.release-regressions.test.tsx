// @vitest-environment jsdom

import React from 'react'
import { Renderer } from '@openuidev/react-lang'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => {
  const createMutation = () => {
    async function runMutation(..._args: unknown[]) {
      return []
    }

    async function runWithLifecycle(
      lifecycle: {
        onExecutionEnd?: () => void
        onExecutionStart?: () => void
      },
      ...args: unknown[]
    ) {
      lifecycle.onExecutionStart?.()
      try {
        return await run(...args)
      } finally {
        lifecycle.onExecutionEnd?.()
      }
    }

    const run = vi.fn(runMutation)
    return Object.assign(run, {
      isPending: false,
      lastError: null,
      pendingCount: 0,
      reset: vi.fn(),
      runWithLifecycle: vi.fn(runWithLifecycle),
    })
  }

  const addItem = createMutation()
  const syncCatalog = createMutation()
  const fallbackMutation = createMutation()
  const navigate = vi.fn()

  function useMutation(name: string) {
    if (name === 'addItem') return addItem
    if (name === 'syncCatalog') return syncCatalog
    return fallbackMutation
  }

  function useQuery(name: string) {
    if (name === 'cartSummary') {
      return {
        count: 1,
        items: [
          {
            id: 'item-1',
            itemKey: 'country-sourdough',
            label: 'Country Sourdough',
            price: '$9',
            quantity: 1,
          },
        ],
      }
    }
    if (name === 'productCatalog') {
      return [
        {
          id: 'product-1',
          itemKey: 'country-sourdough',
          label: 'Country Sourdough',
          price: '$9',
          subtitle: 'Artisan Breads',
        },
      ]
    }
    if (name === 'commerceSearchState') {
      return { query: '', searches: [], selectedLabel: '' }
    }
    return null
  }

  const lakebed = {
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      isLoading: false,
      user: { isGuest: true },
    }),
    useData: () => null,
    useMutation,
    useQuery,
  }

  return { addItem, fallbackMutation, lakebed, navigate, syncCatalog }
})

vi.mock('#/lib/use-navigate.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#/lib/use-navigate.tsx')>()
  return { ...actual, useNavigate: () => runtime.navigate }
})

vi.mock('@ship-fast/lakebed/react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/react')>()
  return {
    ...actual,
    createLakebedClient: vi.fn(() => runtime.lakebed),
  }
})

const { loadOpenUIRuntimeLibrary } = await import('../../../runtime-library.ts')
const { BakeryMenu } = await import('./BakeryMenu.tsx')
const { BakeryNavbar } = await import('./BakeryNavbar.tsx')

type RenderPath = 'capsule' | 'renderer'

const navbarProps = {
  brand: 'Batch House',
  cartCount: '1',
  className: '',
  nav: ['Home', 'Menu'],
  orderCta: 'Order Online',
  orderTarget: 'Order',
}
const menuProps = {
  addLabel: 'Add',
  breads: [
    {
      description: 'Organic wheat, 36-hour ferment',
      name: 'Country Sourdough',
      price: '$9',
    },
  ],
  cakes: [],
  className: '',
  pastries: [],
}
const source = `
navbar = BakeryNavbar("Batch House", ["Home","Menu"], "Order Online", "Order", "1", "")
menu = BakeryMenu({"addLabel":"Add","breads":[{"description":"Organic wheat, 36-hour ferment","name":"Country Sourdough","price":"$9"}],"cakes":[],"className":"","pastries":[]})
root = Stack([navbar,menu])
`

async function renderBakery(path: RenderPath) {
  if (path === 'capsule') {
    const NavbarCapsule = BakeryNavbar.client.component
    const MenuCapsule = BakeryMenu.client.component
    return render(
      <>
        <NavbarCapsule props={navbarProps} statementId="bakery_navbar" />
        <MenuCapsule props={menuProps} statementId="bakery_menu" />
      </>,
    )
  }

  const library = await loadOpenUIRuntimeLibrary(source)
  return render(React.createElement(Renderer, { library, response: source }))
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: '',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  )
  if (typeof globalThis.PointerEvent === 'undefined') {
    vi.stubGlobal('PointerEvent', MouseEvent)
  }
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  runtime.addItem.mockClear()
  runtime.addItem.runWithLifecycle.mockClear()
  runtime.fallbackMutation.mockClear()
  runtime.navigate.mockClear()
  runtime.syncCatalog.mockClear()
  runtime.syncCatalog.runWithLifecycle.mockClear()
})

describe('Bakery capsule and Renderer interaction parity', () => {
  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s exposes CTA and navigation labels with exact action targets',
    async (path) => {
      const view = await renderBakery(path)
      const menuLink = await view.findByRole('button', { name: 'Menu' })
      const orderCta = await view.findByRole('button', {
        name: 'Order Online',
      })

      expect(menuLink.textContent).toBe('Menu')
      expect(orderCta.textContent).toBe('Order Online')
      fireEvent.click(menuLink)
      fireEvent.click(orderCta)

      expect(runtime.navigate.mock.calls).toEqual([['Menu'], ['Order']])
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s opens the same accessible cart state from the navbar',
    async (path) => {
      const view = await renderBakery(path)
      const cartButton = await view.findByRole('button', { name: 'Cart' })
      expect(cartButton.textContent).toContain('1')
      fireEvent.click(cartButton)

      const cartDialog = await view.findByRole('dialog')
      expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
      expect(within(cartDialog).getByText('Country Sourdough')).toBeTruthy()
      expect(
        within(cartDialog).getByText('You have 1 item in your cart.'),
      ).toBeTruthy()
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s sends the exact accessible menu-item payload to shared cart state',
    async (path) => {
      const view = await renderBakery(path)
      const addButton = await view.findByRole('button', {
        name: 'Add Country Sourdough to cart',
      })
      fireEvent.click(addButton)

      expect(runtime.addItem.runWithLifecycle).toHaveBeenCalledTimes(1)
      expect(runtime.addItem).toHaveBeenCalledWith({
        itemKey: 'Country Sourdough\0$9',
        label: 'Country Sourdough',
        price: '$9',
      })
    },
  )
})
