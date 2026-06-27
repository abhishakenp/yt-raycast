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
 * CloudInfraNavbar — sticky translucent top navigation bar for a cloud
 * infrastructure / developer-platform SaaS site. A blurred, border-bottomed
 * header pinned to the top: a cloud-glyph logo tile beside the brand name on
 * the left, horizontal nav links in the center, and a "Sign in" text link +
 * "Get Started" primary pill CTA on the right (desktop). Every nav link and
 * CTA routes through useNavigate so labels drive page-switching. Use as the
 * sticky site header for cloud hosting, PaaS, IaaS, serverless, DevOps, or any
 * engineering-focused landing page.
 */
export const CloudInfraNavbar = defineCapsule({
  name: 'CloudInfraNavbar',
  description:
    "Sticky translucent top navigation bar for a cloud / developer-platform SaaS site: blurred backdrop, border-bottomed header with a cloud-glyph logo tile + brand name, horizontal desktop nav links, command plan search, Shoo account dropdown, selected-plan badge, a fullstack 'Get Started' CTA, and a real mobile drawer. Navigation routes through useNavigate while auth/search/conversion state is shared through Lakebed. Use as the site header for cloud hosting, PaaS, IaaS, serverless, DevOps, or engineering-focused landing pages.",
  props: z.object({
    /** Brand / product name shown beside the logo tile and in nav buttons. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the primary CTA button on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the brand logo / home button. */
    homeTarget: z.string().optional(),
    /** Navigation target for the sign-in text link. */
    signInTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'CloudShift'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Showcase', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
              <span className="text-xl font-semibold tracking-tight">
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
                intentLabel={ctaLabel}
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
        </nav>
      </header>
    )
  },
})
