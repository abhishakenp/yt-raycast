import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * MarketingNavbar — glassy, sticky top navigation bar for a product-marketing /
 * SaaS landing page. A backdrop-blurred, border-bottomed header pinned to the
 * top with an indigo brand-initial logo tile + product name on the left,
 * centered/right horizontal nav links on desktop, and a "Log in" outline button
 * plus a filled primary "Get started" CTA on the right (with a hamburger button
 * on mobile). Clean, premium indigo-on-light aesthetic. Every link and CTA
 * routes through useNavigate. Use as the sticky site header for B2B SaaS,
 * team/project-management tools, developer platforms, or modern software products.
 */
export const MarketingNavbar = defineCapsule({
  name: 'MarketingNavbar',
  description:
    "Glassy, sticky, backdrop-blurred top navigation bar for a product-marketing / SaaS landing page: border-bottomed header with an indigo brand-initial logo tile + product name on the left, horizontal nav links on the right (desktop), and a 'Log in' outline button plus a filled primary 'Get started' CTA, collapsing to a hamburger on mobile. Clean, premium indigo-on-light aesthetic. All links and CTAs route through useNavigate. Use as the sticky site header for B2B SaaS, team/project-management tools, developer platforms, workspaces, or modern software products.",
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Flowstate'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Customers']
    const homeTarget = props.homeTarget ?? 'Features'
    const loginLabel = props.loginLabel ?? 'Log in'
    const ctaLabel = props.ctaLabel ?? 'Get started'
    const ctaTarget = props.ctaTarget ?? 'Start free trial'

    // Brand logo mark — indigo tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground',
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
          'border-border/60 bg-background/85 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60',
          props.className,
        )}
        containerClassName="max-w-6xl px-6"
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2 text-xl font-extrabold tracking-tight text-foreground"
          >
            <BrandLogo brand={brand}>
              <LogoImage fallback={<LogoMark />} />
              <LogoLabel />
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
          <button
            type="button"
            onClick={() => go(loginLabel)}
            className="hidden rounded-xl border border-border bg-muted/60 px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
          >
            {loginLabel}
          </button>
          <button
            type="button"
            onClick={() => go(ctaTarget)}
            className="hidden rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            {ctaLabel}
          </button>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
