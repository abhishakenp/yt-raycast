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
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
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
 * CrmNavbar — sticky kinetic-SaaS top navigation bar for a CRM /
 * sales-platform site. A backdrop-blurred, hairline-bottomed header pinned to
 * the top: a bar-chart brand glyph beside the product name on the left, mono
 * uppercase nav links in the center (desktop), and command plan search, Shoo
 * profile dropdown, selected-plan badge plus a square hard-shadow "Start Free
 * Trial" CTA with press feedback on the right. Every link routes through
 * route hrefs so labels can drive page-switching. Use as the site header for
 * CRM products, sales-pipeline tools, sales-enablement or B2B SaaS marketing
 * pages. Renders fully with no props via baked-in "Pipeline Pro" defaults.
 */
export const CrmNavbar = defineCapsule({
  name: 'CrmNavbar',
  description:
    'Sticky kinetic-SaaS top navigation bar for a CRM / sales-platform site: backdrop-blurred, hairline-bottomed header pinned to the top with a bar-chart brand glyph + product name, mono uppercase nav links, command plan search, Shoo profile dropdown, selected-plan badge, a square hard-shadow scoped fullstack trial CTA with press feedback, and a reusable Sheet mobile drawer. Nav links route through route hrefs while conversion CTAs write to shared Lakebed state. Use as the site header for CRM products, sales-pipeline tools, sales-enablement or B2B SaaS marketing pages.',
  props: z.object({
    /** Brand / product name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Sign-in text link label on the right. */
    signInLabel: z.string().optional(),
    /** Rounded primary CTA button label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Pipeline Pro'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Integrations', 'Customers']
    const signInLabel = props.signInLabel ?? 'Sign In'
    const cta = props.cta ?? 'Start Free Trial'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight text-foreground" />
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
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
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
            className="hidden items-center gap-2 whitespace-nowrap rounded-none bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
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
