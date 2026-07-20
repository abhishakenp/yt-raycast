import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { kitActionClasses } from '#/section-kit/types.ts'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  NavbarRouteLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
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
    'Editorial-product top navigation header for the Product Detail page family. A sticky, hairline-ruled bar renders the Aurora brand mark beside an extrabold uppercase wordmark, mono uppercase micro-label in-page links (Overview, Features, Reviews, FAQ), a square Lakebed cart drawer chip, and a square ink cart-style primary CTA with press feedback that adds the flagship product to the shared cart instead of routing a label. A real mobile drawer collapses the links on small screens. Use as the first band of a premium product detail page; all content is prop-driven with sensible Aurora Pro Headphones defaults.',
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
    const brand = props.brand ?? 'Aurora'
    const nav = props.nav?.length
      ? props.nav
      : ['Overview', 'Features', 'Reviews', 'FAQ']
    const productTitle = props.productTitle ?? 'Aurora Pro Headphones'
    const productPrice = props.productPrice ?? '$299'
    const cta =
      props.cta ??
      ({
        label: 'Add to Cart',
        target: 'Overview',
        variant: 'primary',
      } satisfies {
        label: string
        target: string
        variant: 'primary'
      })
    const ctaAddsProduct = isProductPurchaseIntent(cta.label)

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
        <NavbarBrand
          href={nav[0]}
          className="text-lg font-extrabold uppercase tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" fallback={mark} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <CommerceCartButton
            lakebed={lakebed}
            buttonClassName="relative hidden size-10 items-center justify-center rounded-none border border-border text-foreground transition-colors hover:bg-muted sm:inline-flex"
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
                'hidden items-center justify-center gap-2 rounded-none font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex',
              )}
            >
              {cta.label}
            </CommerceAddItemButton>
          ) : (
            <NavbarRouteLink
              href={cta.target ?? cta.label}
              className={cn(
                kitActionClasses(cta.variant),
                'hidden items-center justify-center gap-2 rounded-none font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex',
              )}
            >
              {cta.label}
            </NavbarRouteLink>
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
                  buttonClassName="relative inline-flex size-10 items-center justify-center rounded-none border border-border text-foreground transition-colors hover:bg-muted"
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
                      'inline-flex flex-1 items-center justify-center gap-2 rounded-none font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                    )}
                  >
                    {cta.label}
                  </CommerceAddItemButton>
                ) : (
                  <NavbarRouteLink
                    href={cta.target ?? cta.label}
                    onClick={close}
                    className={cn(
                      kitActionClasses(cta.variant),
                      'inline-flex flex-1 items-center justify-center gap-2 rounded-none font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                    )}
                  >
                    {cta.label}
                  </NavbarRouteLink>
                )}
              </div>
            )}
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
