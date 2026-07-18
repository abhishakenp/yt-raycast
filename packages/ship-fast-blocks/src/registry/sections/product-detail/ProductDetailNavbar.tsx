import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { kitActionClasses } from '#/section-kit/types.ts'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
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
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
        containerClassName="max-w-7xl px-6 lg:px-8"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-3"
          >
            <BrandLogo brand={brand}>
              <LogoImage fallback={mark} />
              <LogoLabel className="text-xl font-medium text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
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
        </NavbarActions>
      </SiteNav>
    )
  },
})
