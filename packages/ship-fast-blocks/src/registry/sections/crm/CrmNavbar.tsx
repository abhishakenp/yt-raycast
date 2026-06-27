import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * CrmNavbar — sticky, translucent top navigation bar for a CRM / sales-platform
 * SaaS site. A backdrop-blurred, border-bottomed header pinned to the top: a
 * bar-chart brand glyph beside the product name on the left, a horizontal set of
 * nav links in the center (desktop), and a "Sign In" text link plus a rounded
 * primary "Start Free Trial" CTA on the right. Every link routes through
 * useNavigate so labels can drive page-switching. Use as the site header for
 * CRM products, sales-pipeline tools, sales-enablement or B2B SaaS marketing
 * pages. Renders fully with no props via baked-in "Pipeline Pro" defaults.
 */
export const CrmNavbar = defineCapsule({
  name: 'CrmNavbar',
  description:
    'Sticky translucent top navigation bar for a CRM / sales-platform SaaS site: backdrop-blurred, border-bottomed header pinned to the top with a bar-chart brand glyph + product name, horizontal nav links, command plan search, Shoo profile dropdown, selected-plan badge, scoped fullstack trial CTA, and a reusable Sheet mobile drawer. Nav links route through useNavigate while conversion CTAs write to shared Lakebed state. Use as the site header for CRM products, sales-pipeline tools, sales-enablement or B2B SaaS marketing pages.',
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
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Pipeline Pro'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Integrations', 'Customers']
    const signInLabel = props.signInLabel ?? 'Sign In'
    const cta = props.cta ?? 'Start Free Trial'
    const homeTarget = props.homeTarget ?? nav[0]

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
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2"
          >
            <LogoMark className="size-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              {brand}
            </span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </nav>
      </header>
    )
  },
})
