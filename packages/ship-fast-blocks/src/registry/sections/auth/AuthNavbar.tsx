import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import {
  SaasAccountButton,
  SaasMobileMenu,
  SaasSearchButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AuthNavbar — sticky site header for Authly, a developer authentication-as-a-service
 * product (think Clerk / Auth0). Thin configuration over the shared `SiteNav`
 * composite: a keyhole mark set in a filled primary tile beside a sharp sans
 * wordmark, centered nav links on desktop (Product, Docs, Pricing, Customers),
 * and search / account / menu actions on the right. The bar reads as frosted
 * glass over the page. Use as the header for auth platforms, identity APIs,
 * login SDKs, or any developer-first SaaS. Renders fully with no props.
 */
function KeyholeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.39 4.27 6.46L8 22h8l-1.27-6.54A7 7 0 0 0 12 2Z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  )
}

export const AuthNavbar = defineCapsule({
  name: 'AuthNavbar',
  description:
    'Sticky developer-auth product header (Authly, an authentication-as-a-service like Clerk / Auth0) with a keyhole brand tile, a sharp wordmark, centered desktop nav links (Product, Docs, Pricing, Customers), command plan search, Shoo account dropdown, and a real mobile drawer, all on a frosted-glass bar. Navigation routes through route hrefs; auth/search/conversion state is shared through Lakebed. Use as the header for auth platforms, identity APIs, login SDKs, or any developer-first SaaS landing page.',
  props: z.object({
    /** Product / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Product', 'Docs', 'Pricing', 'Customers']
    const brand = props.brand ?? 'Authly'

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-border/70 bg-background/80 backdrop-blur-md',
          props.className,
        )}
        rowClassName="min-w-0 gap-3"
      >
        <NavbarBrand
          href={props.homeTarget ?? 'Home'}
          className="group min-w-0 shrink items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandLogo brand={brand} className="min-w-0 flex-row gap-2.5">
            <LogoImage
              className="size-8 rounded-lg"
              fallback={
                <span className="inline-grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30 transition-transform group-hover:scale-105 motion-reduce:transform-none">
                  <KeyholeMark className="size-4.5" />
                </span>
              }
            />
            <LogoLabel className="hidden truncate text-lg font-semibold tracking-tight text-foreground sm:inline md:text-xl" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="shrink-0 gap-1.5 sm:gap-2">
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden rounded-full border border-transparent p-2.5 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="rounded-full border border-transparent p-2.5 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={props.homeTarget ?? 'Home'}
            buttonClassName="rounded-full border border-transparent p-2.5 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
