import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * AuthNavbar — sticky site header for Authly, a developer authentication-as-a-service
 * product (think Clerk / Auth0). Thin configuration over the shared `SiteNav`
 * composite: a sharp sans wordmark beside an inline keyhole / shield line mark,
 * centered nav links on desktop (Product, Docs, Pricing, Customers), and a
 * high-contrast "Start Free" CTA that routes to sign-up. Use as the header for
 * auth platforms, identity APIs, login SDKs, or any developer-first SaaS where
 * getting started fast matters. Renders fully with no props.
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
    "Sticky developer-auth product header (Authly, an authentication-as-a-service like Clerk / Auth0) with a sharp wordmark, centered desktop nav links (Product, Docs, Pricing, Customers), command plan search, Shoo account dropdown, selected-plan badge, a high-contrast fullstack 'Start Free' CTA, and a real mobile drawer. Navigation routes through useNavigate; auth/search/conversion state is shared through Lakebed. Use as the header for auth platforms, identity APIs, login SDKs, or any developer-first SaaS landing page.",
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
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Product', 'Docs', 'Pricing', 'Customers']
    const brand = props.brand ?? 'Authly'
    const ctaLabel = props.ctaLabel ?? 'Start Free'
    const ctaTarget = props.ctaTarget ?? 'Sign Up'

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(props.homeTarget ?? 'Home')}
            className="min-w-0 gap-3"
          >
            <BrandLogo brand={brand} className="size-7">
              <LogoImage
                className="size-7"
                fallback={
                  <KeyholeMark className="size-7 shrink-0 text-primary" />
                }
              />
              <LogoLabel className="truncate text-xl font-semibold tracking-tight text-foreground" />
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
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            plan={ctaLabel}
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
            homeTarget={props.homeTarget ?? 'Home'}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
