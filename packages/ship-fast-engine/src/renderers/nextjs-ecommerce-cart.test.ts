// @vitest-environment jsdom

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentType, HTMLAttributes, ReactNode } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderNextProject } from './nextjs/index'

vi.mock('next/link', async () => {
  const React = await import('react')
  return {
    default({
      children,
      href,
      ...props
    }: {
      children: ReactNode
      href: string
    }) {
      return React.createElement('a', { href, ...props }, children)
    },
  }
})

vi.mock('framer-motion', async () => {
  const React = await import('react')
  type MotionMockProps = HTMLAttributes<HTMLElement> & {
    animate?: unknown
    exit?: unknown
    initial?: unknown
    transition?: unknown
    whileHover?: unknown
  }
  const element = (tag) =>
    React.forwardRef<HTMLElement, MotionMockProps>(
      (
        {
          animate: _animate,
          children,
          exit: _exit,
          initial: _initial,
          transition: _transition,
          whileHover: _whileHover,
          ...props
        },
        ref,
      ) => React.createElement(tag, { ...props, ref }, children),
    )

  return {
    AnimatePresence({ children }: { children: ReactNode }) {
      return React.createElement(React.Fragment, null, children)
    },
    motion: {
      article: element('article'),
      aside: element('aside'),
      div: element('div'),
    },
    useReducedMotion: () => true,
  }
})

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
})

for (const key of [
  'document',
  'Element',
  'HTMLButtonElement',
  'HTMLElement',
  'localStorage',
  'MutationObserver',
  'navigator',
  'Node',
  'window',
] as const) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: Reflect.get(dom.window, key),
  })
}

const { act, cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const React = await import('react')

type GeneratedCartProviderModule = {
  CartProvider: ComponentType<{ children: ReactNode }>
}

type GeneratedProductCardModule = {
  default: ComponentType<{ product: GeneratedProduct; cta?: string }>
}

type GeneratedCartDrawerModule = {
  default: ComponentType
}

type GeneratedCheckoutViewModule = {
  default: ComponentType
}

type GeneratedProduct = {
  handle: string
  metadata?: {
    rating?: number
    reviewsCount?: number
  }
  subtitle?: string
  tags?: Array<{ value: string }>
  thumbnail?: string
  title: string
  variants: Array<{
    calculated_price?: {
      calculated_amount?: number
      currency_code?: string
      original_amount?: number
    }
    id: string
  }>
}

type AddControl = {
  calls: string[]
  release?: () => void
  wait?: Promise<void>
}

declare global {
  var __shipFastMedusaAddControl: AddControl | undefined
}

function isCartProviderModule(
  value: unknown,
): value is GeneratedCartProviderModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'CartProvider') === 'function'
  )
}

function isProductCardModule(
  value: unknown,
): value is GeneratedProductCardModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'default') === 'function'
  )
}

function isCartDrawerModule(
  value: unknown,
): value is GeneratedCartDrawerModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'default') === 'function'
  )
}

function isCheckoutViewModule(
  value: unknown,
): value is GeneratedCheckoutViewModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'default') === 'function'
  )
}

function writeGeneratedFile(root: string, path: string, source: string): void {
  const filePath = join(root, path)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, source)
}

function writeGeneratedDependencyStubs(root: string): void {
  writeGeneratedFile(
    root,
    'node_modules/next/package.json',
    JSON.stringify({
      exports: {
        './link': './link.js',
      },
      name: 'next',
      type: 'module',
    }),
  )
  writeGeneratedFile(
    root,
    'node_modules/next/link.js',
    `
import React from 'react'

export default function Link({ children, href, ...props }) {
  return React.createElement('a', { href, ...props }, children)
}
`,
  )
  writeGeneratedFile(
    root,
    'node_modules/framer-motion/package.json',
    JSON.stringify({
      main: './index.js',
      name: 'framer-motion',
      type: 'module',
    }),
  )
  writeGeneratedFile(
    root,
    'node_modules/framer-motion/index.js',
    `
import React from 'react'

const element = (tag) =>
  React.forwardRef(function MotionElement(
    { animate, children, exit, initial, transition, whileHover, ...props },
    ref,
  ) {
    return React.createElement(tag, { ...props, ref }, children)
  })

export function AnimatePresence({ children }) {
  return React.createElement(React.Fragment, null, children)
}

export const motion = {
  article: element('article'),
  aside: element('aside'),
  div: element('div'),
}

export function useReducedMotion() {
  return true
}
`,
  )
}

function product(title: string, variantId: string): GeneratedProduct {
  return {
    handle: title.toLowerCase().replaceAll(/\s+/g, '-'),
    title,
    variants: [
      {
        calculated_price: {
          calculated_amount: 1200,
          currency_code: 'USD',
        },
        id: variantId,
      },
    ],
  }
}

function buttonNamed(name: string): HTMLButtonElement {
  const element = screen.getByRole('button', { name })
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Expected "${name}" to resolve to a button element`)
  }
  return element
}

afterEach(() => {
  cleanup()
  delete globalThis.__shipFastMedusaAddControl
  globalThis.localStorage?.clear()
})

describe('generated Next ecommerce cart behavior', () => {
  it('shows add loading only on the product whose cart mutation is pending', async () => {
    const generated = renderNextProject(
      {
        projectName: 'Scoped Cart',
        siteType: 'ecommerce',
        pages: [{ id: 'home', route: '/', sections: [] }],
      },
      {},
    )
    const root = mkdtempSync(join(process.cwd(), '.tmp-ship-fast-next-cart-'))

    try {
      writeGeneratedDependencyStubs(root)
      for (const [path, source] of Object.entries(generated.files)) {
        writeGeneratedFile(root, path, source)
      }
      writeGeneratedFile(
        root,
        'lib/medusa.js',
        `
let cart = { id: 'cart_1', completed_at: null, items: [] }

export async function getRegions() {
  return [{ id: 'region_1' }]
}

export async function createCart() {
  return cart
}

export async function getCart() {
  return cart
}

export async function addLineItem(_cartId, variantId, quantity = 1) {
  globalThis.__shipFastMedusaAddControl?.calls.push(variantId)
  await globalThis.__shipFastMedusaAddControl?.wait
  cart = {
    ...cart,
    items: [
      ...cart.items,
      { id: 'line_' + variantId, title: variantId, quantity },
    ],
  }
  return cart
}

export async function updateLineItem() {
  return cart
}

export async function removeLineItem() {
  return cart
}
`,
      )

      const cartProviderModule: unknown = await import(
        pathToFileURL(join(root, 'components/ecommerce/CartProvider.jsx')).href
      )
      const productCardModule: unknown = await import(
        `${pathToFileURL(join(root, 'components/ecommerce/ProductCard.jsx')).href}?case=${Date.now()}`
      )

      if (!isCartProviderModule(cartProviderModule)) {
        throw new Error('Generated CartProvider module did not load')
      }
      if (!isProductCardModule(productCardModule)) {
        throw new Error('Generated ProductCard module did not load')
      }

      const first = product('Alpha Serum', 'variant_alpha')
      const second = product('Beta Cream', 'variant_beta')
      let releaseAdd = () => {}
      globalThis.__shipFastMedusaAddControl = {
        calls: [],
        wait: new Promise<void>((resolve) => {
          releaseAdd = resolve
        }),
      }

      render(
        React.createElement(
          cartProviderModule.CartProvider,
          null,
          React.createElement(productCardModule.default, {
            cta: 'Add Alpha',
            product: first,
          }),
          React.createElement(productCardModule.default, {
            cta: 'Add Beta',
            product: second,
          }),
        ),
      )

      await waitFor(() => {
        expect(buttonNamed('Add Alpha').disabled).toBe(false)
      })

      fireEvent.click(buttonNamed('Add Alpha'))

      await waitFor(() => {
        expect(buttonNamed('Adding…').disabled).toBe(true)
      })
      expect(buttonNamed('Add Beta').disabled).toBe(false)
      expect(globalThis.__shipFastMedusaAddControl.calls).toEqual([
        'variant_alpha',
      ])

      await act(async () => {
        releaseAdd()
      })

      await waitFor(() => {
        expect(buttonNamed('Add Alpha').disabled).toBe(false)
      })
    } finally {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it('treats malformed cart item collections as an empty cart instead of crashing', async () => {
    const generated = renderNextProject(
      {
        projectName: 'Malformed Cart',
        siteType: 'ecommerce',
        pages: [{ id: 'home', route: '/', sections: [] }],
      },
      {},
    )
    const root = mkdtempSync(join(process.cwd(), '.tmp-ship-fast-next-cart-'))
    let restoreConsoleError: (() => void) | undefined

    try {
      writeGeneratedDependencyStubs(root)
      for (const [path, source] of Object.entries(generated.files)) {
        writeGeneratedFile(root, path, source)
      }
      writeGeneratedFile(
        root,
        'lib/medusa.js',
        `
const malformedCart = {
  id: 'cart_malformed',
  completed_at: null,
  items: { stale: true },
  total: 0,
  region: { currency_code: 'USD' },
}

export async function getRegions() {
  return [{ id: 'region_1' }]
}

export async function createCart() {
  return malformedCart
}

export async function getCart() {
  return malformedCart
}

export async function addLineItem() {
  return malformedCart
}

export async function updateLineItem() {
  return malformedCart
}

export async function removeLineItem() {
  return malformedCart
}
`,
      )

      const cartProviderModule: unknown = await import(
        pathToFileURL(join(root, 'components/ecommerce/CartProvider.jsx')).href
      )
      const cartDrawerModule: unknown = await import(
        `${pathToFileURL(join(root, 'components/ecommerce/CartDrawer.jsx')).href}?case=malformed-${Date.now()}`
      )

      if (!isCartProviderModule(cartProviderModule)) {
        throw new Error('Generated CartProvider module did not load')
      }
      if (!isCartDrawerModule(cartDrawerModule)) {
        throw new Error('Generated CartDrawer module did not load')
      }

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      restoreConsoleError = () => consoleError.mockRestore()

      render(
        React.createElement(
          cartProviderModule.CartProvider,
          null,
          React.createElement(cartDrawerModule.default),
        ),
      )

      const toggle = await screen.findByRole('button', {
        name: 'Shopping cart',
      })
      expect((toggle as HTMLButtonElement).disabled).toBe(false)

      fireEvent.click(toggle)

      expect(await screen.findByText('Your cart is empty.')).toBeTruthy()
      expect(screen.getByText('Subtotal')).toBeTruthy()
      expect(screen.getByText('$0.00')).toBeTruthy()
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      restoreConsoleError?.()
      rmSync(root, { force: true, recursive: true })
    }
  })

  it('keeps generated checkout renderable when the cart item collection is malformed', async () => {
    const generated = renderNextProject(
      {
        projectName: 'Malformed Checkout',
        siteType: 'ecommerce',
        pages: [{ id: 'home', route: '/', sections: [] }],
      },
      {},
    )
    const root = mkdtempSync(join(process.cwd(), '.tmp-ship-fast-next-cart-'))
    let restoreConsoleError: (() => void) | undefined

    try {
      writeGeneratedDependencyStubs(root)
      for (const [path, source] of Object.entries(generated.files)) {
        writeGeneratedFile(root, path, source)
      }
      writeGeneratedFile(
        root,
        'lib/medusa.js',
        `
const malformedCart = {
  id: 'cart_malformed_checkout',
  completed_at: null,
  items: { stale: true },
  region: { currency_code: 'USD' },
  subtotal: 0,
  shipping_total: 0,
  tax_total: 0,
  total: 0,
}

export async function getRegions() {
  return [{ id: 'region_1' }]
}

export async function createCart() {
  return malformedCart
}

export async function getCart() {
  return malformedCart
}

export async function addLineItem() {
  return malformedCart
}

export async function updateLineItem() {
  return malformedCart
}

export async function removeLineItem() {
  return malformedCart
}

export async function completeCart() {
  return null
}

export async function createPaymentSessions() {
  return null
}

export async function listShippingOptions() {
  return []
}

export async function setShippingMethod() {
  return malformedCart
}

export async function updateStoreCart() {
  return malformedCart
}
`,
      )

      const cartProviderModule: unknown = await import(
        pathToFileURL(join(root, 'components/ecommerce/CartProvider.jsx')).href
      )
      const checkoutViewModule: unknown = await import(
        `${pathToFileURL(join(root, 'components/ecommerce/CheckoutView.jsx')).href}?case=malformed-checkout-${Date.now()}`
      )

      if (!isCartProviderModule(cartProviderModule)) {
        throw new Error('Generated CartProvider module did not load')
      }
      if (!isCheckoutViewModule(checkoutViewModule)) {
        throw new Error('Generated CheckoutView module did not load')
      }

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      restoreConsoleError = () => consoleError.mockRestore()

      render(
        React.createElement(
          cartProviderModule.CartProvider,
          null,
          React.createElement(checkoutViewModule.default),
        ),
      )

      expect(await screen.findByText(/your cart is empty/i)).toBeTruthy()
      expect(screen.queryByLabelText('Order summary')).toBeNull()
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      restoreConsoleError?.()
      rmSync(root, { force: true, recursive: true })
    }
  })
})
