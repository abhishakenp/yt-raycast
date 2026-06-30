import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * CrowdfundingNavbar — sticky, backdrop-blurred top navigation for a
 * crowdfunding / campaign landing page. A border-bottomed header pinned to the
 * top with a decorative leaf/sparkle brand mark in an emerald-token tile beside
 * the campaign name on the left, a horizontal set of muted nav links in the
 * center (hidden on mobile), and a primary "Back This Project" pill CTA on the
 * right. Every link and CTA routes through useNavigate so PageSwitch can swap
 * pages. Use as the sticky site header for Kickstarter / Indiegogo-style
 * campaigns, pre-order launches, fundraisers, or maker/hardware projects.
 */
export const CrowdfundingNavbar = defineCapsule({
  name: 'CrowdfundingNavbar',
  description:
    "Sticky, backdrop-blurred top navigation for a crowdfunding / campaign landing page: a border-bottomed header pinned to the top with a decorative leaf/sparkle brand mark in an emerald-token tile beside the campaign name on the left, a horizontal set of muted nav links in the center (hidden on mobile), and a primary 'Back This Project' pill CTA on the right. Every link and CTA routes through useNavigate so PageSwitch can swap pages. Use as the sticky site header for Kickstarter / Indiegogo-style campaigns, pre-order launches, fundraisers, or maker/hardware projects.",
  props: z.object({
    /** Brand / campaign name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/home button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the primary pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Target label for the primary pill CTA (defaults to the Rewards route). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'EcoBrush'
    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Features', 'Rewards', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Back This Project'
    const ctaTarget = props.ctaTarget ?? nav[2] ?? 'Rewards'

    const LeafMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-full bg-primary text-primary-foreground',
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
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur',
          props.className,
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<LeafMark className="size-8" />}
                labelClassName="text-xl font-semibold tracking-tight"
              />
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
