import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * SaasNavbar — glassy sticky top navigation bar for an AI-product / SaaS landing
 * page. Thin configuration over the shared `SiteNav` composite: a gradient-tile
 * clock-glyph logo mark beside the product wordmark, horizontal desktop nav
 * links, a pill "Get Started" CTA, and a real mobile drawer (Sheet) on small
 * screens. Every nav item and the CTA route through useNavigate so labels can
 * drive page-switching. Use as the sticky site header for AI tools, SaaS apps,
 * productivity/scheduling products, developer tools, or modern B2B startups.
 * Renders fully with no props via baked-in "Chronos AI" defaults.
 */
const ClockMark = ({ className }: { className?: string }) => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
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

export const SaasNavbar = defineCapsule({
  name: 'SaasNavbar',
  description:
    'Glassy sticky top navigation bar for an AI-product / SaaS landing page: a gradient-tile clock-glyph logo and product wordmark, horizontal desktop nav links, command plan search, Shoo profile dropdown, selected-plan badge, a scoped fullstack trial CTA, and a real mobile drawer. Nav items route through useNavigate while conversion CTAs write to shared Lakebed state. Use as the sticky site header for AI tools, SaaS apps, productivity/scheduling products, developer tools, or modern B2B startups.',
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
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Testimonials', 'FAQ']
    const brand = props.brand ?? 'Chronos AI'
    const homeTarget = props.homeTarget ?? 'Home'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Start free trial'

    return (
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex min-w-0 items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<ClockMark className="size-[18px]" />}
              labelClassName="truncate text-xl font-extrabold tracking-tight text-foreground"
            />
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

          <div className="flex items-center gap-3">
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
              plan={ctaTarget}
              source="navbar"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Starting
                </>
              }
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
            >
              {ctaLabel}
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
