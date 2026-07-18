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
  SaasIntentBadge,
  SaasMobileMenu,
  SaasMutationSpinner,
  SaasPlanActionButton,
  SaasSearchButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * NoCodeNavbar — sticky, translucent top navigation bar for a clean, bright
 * no-code / app-builder SaaS site. A backdrop-blurred, border-bottomed header
 * pinned to the top with an inverse cube-glyph logo tile beside the brand name
 * on the left, a centered set of nav links (desktop), and a "Sign in" text link
 * plus a filled primary CTA on the right. Every link and CTA route through
 * route hrefs so labels can drive page-switching. Use as the sticky site header
 * for no-code / website-builder / page-builder / SaaS platform landing pages.
 * Renders fully with no props via baked-in "Buildr" defaults.
 */
export const NoCodeNavbar = defineCapsule({
  name: 'NoCodeNavbar',
  description:
    'Sticky translucent top navigation bar for a clean, bright no-code / app-builder SaaS site: backdrop-blurred, border-bottomed header pinned to the top with an inverse cube-glyph logo tile + brand name, centered nav links, command plan search, Shoo profile dropdown, selected-plan badge, scoped fullstack CTA, and a reusable Sheet mobile drawer. Nav links route through route hrefs while conversion CTAs write to shared Lakebed state.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (should match site routes). */
    nav: z.array(z.string()).optional(),
    /** Text link label on the right (e.g. Sign in). */
    signInLabel: z.string().optional(),
    /** Filled primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the brand button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Buildr'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Templates', 'Pricing', 'Stories']
    const signInLabel = props.signInLabel ?? 'Sign in'
    const cta = props.cta ?? 'Start building free'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
        containerClassName="max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8" />} />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            label={signInLabel}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={cta}
            plan={cta}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {cta}
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
