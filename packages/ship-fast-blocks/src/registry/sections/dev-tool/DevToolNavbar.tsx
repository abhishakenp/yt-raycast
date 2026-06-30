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
 * DevToolNavbar — sticky, backdrop-blurred top navigation bar for a developer
 * tool / API platform marketing site. A border-bottomed header pinned to the top
 * with a blue brand "bolt" logo tile + product name on the left, horizontal nav
 * links centered/right on desktop, and a "Sign In" text link plus a filled
 * primary "Get Started" CTA on the right. Clean, light, slate-and-blue product
 * aesthetic. Every link and CTA routes through useNavigate. Use as the sticky
 * site header for developer tools, API platforms, backend-as-a-service, or
 * technical SaaS products.
 */
export const DevToolNavbar = defineCapsule({
  name: 'DevToolNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for a developer tool / API platform site: border-bottomed header with a blue brand 'bolt' logo tile + product name, horizontal nav links on desktop, command plan search, Shoo account dropdown, selected-plan badge, a fullstack 'Get Started' CTA, and a real mobile drawer. Clean, light, slate-and-blue product aesthetic. Navigation routes through useNavigate while auth/search/conversion state is shared through Lakebed. Use as the sticky site header for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** Label for the secondary text link. */
    signInLabel: z.string().optional(),
    /** Label shown on the primary filled CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'DevStack'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Docs', 'Blog']
    const homeTarget = props.homeTarget ?? 'Features'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Start Building Free'

    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
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
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md',
          props.className,
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<BoltMark className="size-8" />}
                labelClassName="text-xl font-semibold text-foreground"
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
                className="hidden items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
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
          </div>
        </div>
      </header>
    )
  },
})
