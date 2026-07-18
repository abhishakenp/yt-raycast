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

const brandMark = (
  <svg
    className="size-8 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3v18h18" />
    <rect x="7" y="11" width="3" height="6" rx="0.5" />
    <rect x="12" y="7" width="3" height="10" rx="0.5" />
    <rect x="17" y="4" width="3" height="13" rx="0.5" />
  </svg>
)

/**
 * AnalyticsNavbar — sharp, data-forward top navigation header for an analytics
 * product marketing site. Composes the shared SiteNav kit composite to render a
 * bar-chart brand mark, a crisp wordmark, a desktop link row (Product, Features,
 * Pricing, Docs), and a sticky filled-primary "Start Free" call to action with a
 * real mobile drawer. Every link and CTA routes through route hrefs. Use it as
 * the first band of any analytics, BI, dashboard, or data-product landing page
 * for a consistent, route-aware site header. Renders fully with no props.
 */
export const AnalyticsNavbar = defineCapsule({
  name: 'AnalyticsNavbar',
  description:
    "Sharp, data-forward top navigation header for an analytics product marketing site. Renders a bar-chart brand mark, crisp wordmark, desktop link row (Product, Features, Pricing, Docs), command plan search, Shoo account dropdown, selected-plan badge, and a sticky filled-primary fullstack 'Start Free' call to action with a real mobile drawer. Nav routes use route hrefs while auth/search/conversion use shared Lakebed state. Use it as the first band of any analytics, BI, dashboard, or data-product landing page.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    sticky: z.boolean().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Pulse Analytics'
    const nav = props.nav?.length
      ? props.nav
      : ['Product', 'Features', 'Pricing', 'Docs']
    const ctaLabel = props.ctaLabel ?? 'Start Free'
    const ctaTarget = props.ctaTarget ?? 'Pricing'

    return (
      <SiteNav
        position={(props.sticky ?? true) ? 'sticky' : 'sticky'}
        height="default"
        className={cn(
          (props.sticky ?? true) ? 'bg-background/95' : 'bg-background',
          props.className,
        )}
      >
        <NavbarBrand
          href={props.homeTarget ?? nav[0]}
          className="min-w-0 gap-3"
        >
          <BrandLogo brand={brand}>
            <LogoImage fallback={brandMark} />
            <LogoLabel className="truncate text-xl font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          {typeof props.phone === 'string' && props.phone.trim() ? (
            <a
              href={`tel:${props.phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground lg:inline"
            >
              {props.phone}
            </a>
          ) : null}
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
            className="hidden items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={props.homeTarget ?? nav[0]}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
