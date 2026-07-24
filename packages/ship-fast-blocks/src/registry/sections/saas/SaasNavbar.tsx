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
import {
  SaasAccountButton,
  SaasIntentBadge,
  SaasMobileMenu,
  SaasPlanActionButton,
  SaasSearchButton,
  SaasMutationSpinner,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasNavbar — sticky kinetic-SaaS top navigation bar for an AI-product / SaaS
 * landing page. Thin configuration over the shared `SiteNav` composite: a
 * backdrop-blurred, hairline-bottomed header with a sharp square clock-glyph
 * brand tile beside the product wordmark, mono uppercase desktop nav links,
 * command plan search, a Shoo profile dropdown, a selected-plan badge, a square
 * hard-offset-shadow "Get Started" CTA with press feedback, and a real mobile
 * drawer (Sheet). Every nav item and the CTA route through route hrefs so labels
 * can drive page-switching while conversion CTAs write to shared Lakebed state.
 * Use as the sticky site header for AI tools, SaaS apps, productivity/scheduling
 * products, developer tools, or modern B2B startups. Renders fully with no props
 * via baked-in "Chronos AI" defaults.
 */
function ClockMark({ className }: { className?: string }) {
  return (
    <span
      className="grid size-7 place-items-center rounded-none bg-primary text-primary-foreground"
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </span>
  )
}

export const SaasNavbar = defineCapsule({
  name: 'SaasNavbar',
  description:
    'Sticky kinetic-SaaS top navigation bar for an AI-product / SaaS landing page: a backdrop-blurred, hairline-bottomed header with a sharp square clock-glyph brand tile + product wordmark, mono uppercase nav links, command plan search, Shoo profile dropdown, selected-plan badge, a square hard-offset-shadow scoped fullstack trial CTA with press feedback, and a real mobile drawer. Nav items route through route hrefs while conversion CTAs write to shared Lakebed state. Use as the sticky site header for AI tools, SaaS apps, productivity/scheduling products, developer tools, or modern B2B startups.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label of the gradient pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Testimonials', 'FAQ']
    const brand = props.brand ?? 'Chronos AI'
    const homeTarget = props.homeTarget ?? 'Home'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Start free trial'

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="min-w-0 gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<ClockMark className="size-4" />}
            />
            <LogoLabel className="truncate text-lg font-extrabold tracking-tight text-foreground" />
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
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaTarget}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Starting
              </>
            }
            className="hidden items-center gap-2 whitespace-nowrap rounded-none bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
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
