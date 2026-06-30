import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

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
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
          >
            <BrandLogo brand={brand} fallback={<LogoMark />} />
          </button>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
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
          </div>
        </nav>
      </header>
    )
  },
})
