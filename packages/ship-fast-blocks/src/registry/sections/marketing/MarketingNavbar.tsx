import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * MarketingNavbar — sticky bold-kinetic top navigation bar for a product-
 * marketing / SaaS landing page. A backdrop-blurred, hairline-bottomed header
 * pinned to the top: a sharp primary brand-initial tile beside the product name
 * on the left, mono uppercase nav links on the right (desktop), and a square
 * hairline "Log in" link plus a square hard-offset-shadow primary "Get started"
 * CTA with press feedback, collapsing to a reusable hamburger drawer on mobile.
 * Confident kinetic-SaaS aesthetic with binary radius; every link and CTA routes
 * through route hrefs. Use as the sticky site header for B2B SaaS,
 * team/project-management tools, developer platforms, or modern software products.
 */
export const MarketingNavbar = defineCapsule({
  name: 'MarketingNavbar',
  description:
    "Sticky bold-kinetic top navigation bar for a product-marketing / SaaS landing page: a backdrop-blurred, hairline-bottomed header with a sharp primary brand-initial tile + product name on the left, mono uppercase nav links on the right (desktop), and a square hairline 'Log in' link plus a square hard-offset-shadow primary 'Get started' CTA with press feedback, collapsing to a hamburger drawer on mobile. Confident kinetic-SaaS aesthetic with binary radius. All links and CTAs route through route hrefs. Use as the sticky site header for B2B SaaS, team/project-management tools, developer platforms, workspaces, or modern software products.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo + hamburger button. */
    homeTarget: z.string().optional(),
    /** Label for the secondary "Log in" button. */
    loginLabel: z.string().optional(),
    /** Label shown on the filled primary CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Flowstate'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Customers']
    const homeTarget = props.homeTarget ?? 'Features'
    const loginLabel = props.loginLabel ?? 'Log in'
    const ctaLabel = props.ctaLabel ?? 'Get started'
    const ctaTarget = props.ctaTarget ?? 'Start free trial'
    const signIn = props.signIn ?? 'Sign in'

    // Brand logo mark — sharp primary tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-primary text-sm font-bold text-primary-foreground',
          className,
        )}
      >
        {brand.charAt(0)}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70',
          props.className,
        )}
        containerClassName="max-w-6xl px-6"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" fallback={<LogoMark />} />
            <LogoLabel className="text-lg font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.14em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarRouteLink
            href={loginLabel}
            className="hidden items-center rounded-none border border-border bg-background px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            {loginLabel}
          </NavbarRouteLink>
          <NavbarRouteLink
            href={ctaTarget}
            className="hidden items-center whitespace-nowrap rounded-none bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none sm:inline-flex"
          >
            {ctaLabel}
          </NavbarRouteLink>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="grid size-10 place-items-center rounded-none border border-border bg-background text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
