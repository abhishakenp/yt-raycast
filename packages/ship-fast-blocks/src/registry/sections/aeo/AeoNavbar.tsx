import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * AeoNavbar — sticky site header for an Answer-Engine-Optimization (AEO) SaaS.
 * Thin configuration over the shared SiteNav composite: a citation-spark brand
 * mark beside the product name, desktop nav links (Features, How it works,
 * Pricing, FAQ), and a single "Start Free" pill CTA that routes to pricing. A
 * real mobile drawer (Sheet) appears on small screens and every link routes via
 * useNavigate. Use as the sticky header for AEO, generative-search, or
 * brand-citation analytics products. Renders fully with no props via "Citeable"
 * defaults.
 */
const BrandMark = () => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>
  </span>
)

export const AeoNavbar = defineCapsule({
  name: 'AeoNavbar',
  description:
    "Sticky site header for an Answer-Engine-Optimization (AEO) SaaS with a citation-spark brand mark, centered desktop nav links (Features, How it works, Pricing, FAQ), command plan search, Shoo account dropdown, selected-plan badge, a fullstack 'Start Free' CTA, and a real mobile drawer. Navigation routes through useNavigate while search/auth/conversion state is shared through Lakebed. Use as the sticky header for AEO platforms, generative-search visibility tools, or brand-citation analytics products.",
  props: z.object({
    /** Brand / product name shown beside the logo mark. */
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
    const brand = props.brand ?? 'Citeable'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How it works', 'Pricing', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Start Free'
    const ctaTarget = props.ctaTarget ?? 'Pricing'

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
            onClick={() => go(props.homeTarget ?? brand)}
            className="flex min-w-0 items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<BrandMark />}
              labelClassName="truncate text-lg font-semibold text-foreground"
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
              homeTarget={props.homeTarget ?? brand}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
