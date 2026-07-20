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
 * AnalyticsNavbar — Swiss data-grid top navigation header for an analytics
 * product marketing site. Composes the shared SiteNav kit composite (sticky,
 * backdrop-blurred, hairline border-bottom) to render a bar-chart brand mark,
 * a crisp wordmark, a desktop link row set in mono uppercase micro-labels
 * (Product, Features, Pricing, Docs), and a sharp-cornered filled-primary
 * "Start Free" call to action with press feedback and a real mobile drawer.
 * Every link and CTA routes through route hrefs. Use it as the first band of
 * any analytics, BI, dashboard, or data-product landing page for a
 * consistent, route-aware site header. Renders fully with no props.
 */
export const AnalyticsNavbar = defineCapsule({
  name: 'AnalyticsNavbar',
  description:
    "Swiss data-grid top navigation header for an analytics product marketing site: sticky backdrop-blurred hairline bar with a bar-chart brand mark, crisp wordmark, mono-uppercase desktop link row (Product, Features, Pricing, Docs), command plan search, Shoo account dropdown, selected-plan badge, and a sharp-cornered filled-primary fullstack 'Start Free' call to action with press feedback and a real mobile drawer. Nav routes use route hrefs while auth/search/conversion use shared Lakebed state. Use it as the first band of any analytics, BI, dashboard, or data-product landing page.",
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
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.18em]"
            >
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
            className="hidden items-center justify-center gap-2 rounded-none bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
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
