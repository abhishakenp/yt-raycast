import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { kitActionClasses } from '#/section-kit/types.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceCartButton,
  CommerceMutationSpinner,
} from '../commerce/commerce-interactions.tsx'
import { isProductPurchaseIntent } from './product-purchase-intent.ts'

export const ProductDetailNavbar = defineCapsule({
  name: 'ProductDetailNavbar',
  description:
    'Top navigation header for the Product Detail page family. Renders the Aurora brand mark, focused in-page links (Overview, Features, Reviews, FAQ), a real Lakebed cart drawer button, and a cart-style primary CTA that adds the flagship product to the shared cart instead of routing a label. Use as the first band of a premium product detail page; all content is prop-driven with sensible Aurora Pro Headphones defaults.',
  lakebed: commerceCartLakebed,
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    productTitle: z.string().optional(),
    productPrice: z.string().optional(),
    cta: z
      .object({
        label: z.string(),
        target: z.string().optional(),
        variant: z.enum(['primary', 'outline', 'ghost']).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Aurora'
    const nav = props.nav?.length
      ? props.nav
      : ['Overview', 'Features', 'Reviews', 'FAQ']
    const productTitle = props.productTitle ?? 'Aurora Pro Headphones'
    const productPrice = props.productPrice ?? '$299'
    const cta = props.cta ?? {
      label: 'Add to Cart',
      target: 'Overview',
      variant: 'primary' as const,
    }
    const ctaAddsProduct = isProductPurchaseIntent(cta.label)

    const runCta = () => {
      go(cta.target ?? cta.label)
    }

    const mark = (
      <svg
        width={28}
        height={28}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="7" rx="1.4" />
        <rect x="17" y="13" width="4" height="7" rx="1.4" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-3"
          >
            {mark}
            <span className="text-xl font-medium text-foreground">{brand}</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <CommerceCartButton
              lakebed={lakebed}
              buttonClassName="relative hidden size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted sm:inline-flex"
            />
            {ctaAddsProduct ? (
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{ label: productTitle, price: productPrice }}
                pendingChildren={
                  <>
                    <CommerceMutationSpinner />
                    Adding
                  </>
                }
                className={cn(
                  kitActionClasses(cta.variant),
                  'hidden items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex',
                )}
              >
                {cta.label}
              </CommerceAddItemButton>
            ) : (
              <button
                type="button"
                onClick={runCta}
                className={cn(
                  kitActionClasses(cta.variant),
                  'hidden items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex',
                )}
              >
                {cta.label}
              </button>
            )}

            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={nav[0]}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              footer={(close) => (
                <div className="flex items-center gap-3 pt-1">
                  <CommerceCartButton
                    lakebed={lakebed}
                    buttonClassName="relative inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                  />
                  {ctaAddsProduct ? (
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{ label: productTitle, price: productPrice }}
                      pendingChildren={
                        <>
                          <CommerceMutationSpinner />
                          Adding
                        </>
                      }
                      className={cn(
                        kitActionClasses(cta.variant),
                        'inline-flex flex-1 items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-70',
                      )}
                    >
                      {cta.label}
                    </CommerceAddItemButton>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        runCta()
                        close()
                      }}
                      className={cn(
                        kitActionClasses(cta.variant),
                        'inline-flex flex-1 items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-70',
                      )}
                    >
                      {cta.label}
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </nav>
      </header>
    )
  },
})
