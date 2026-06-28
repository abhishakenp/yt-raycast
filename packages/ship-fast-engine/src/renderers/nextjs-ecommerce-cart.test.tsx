// @vitest-environment jsdom

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ComponentType, HTMLAttributes, ReactNode } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderNextProject } from './nextjs/index.js'

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
  const element = (tag: string) =>
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

const isCartProviderModule = (
  value: unknown,
): value is GeneratedCartProviderModule =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'CartProvider') === 'function'

const isProductCardModule = (
  value: unknown,
): value is GeneratedProductCardModule =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'default') === 'function'

const writeGeneratedFile = (
  root: string,
  path: string,
  source: string,
): void => {
  const filePath = join(root, path)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, source)
}

const product = (title: string, variantId: string): GeneratedProduct => ({
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
})

const buttonNamed = (name: string): HTMLButtonElement => {
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
        `${pathToFileURL(join(root, 'components/ecommerce/CartProvider.jsx')).href}?case=${Date.now()}`
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
})
