import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * ConsultingNavbar — sticky top navigation bar for a management-consulting
 * firm landing page. A border-bottomed, backdrop-blurred header pinned to the
 * top with a solid brand-initial logo tile + firm name on the left, a horizontal
 * set of nav links in the center (desktop), and a primary CTA button plus a
 * hamburger menu icon on the right. The logo and every link route through
 * useNavigate for page-switching. Use as the site header for consulting firms,
 * professional-services groups, corporate advisories, or B2B service businesses.
 * Renders fully with no props via baked-in "Nexus Strategy Partners" defaults.
 */
export const ConsultingNavbar = defineCapsule({
  name: 'ConsultingNavbar',
  description:
    'Sticky top navigation bar for a management-consulting firm landing page: a border-bottomed, backdrop-blurred header with a solid brand-initial logo tile + firm name on the left, horizontal nav links in the center (desktop), a primary CTA button and a hamburger menu icon on the right. Every link and the logo route through useNavigate for page-switching. Use as the site header for consulting firms, professional-services groups, corporate advisories, or B2B service businesses.',
  props: z.object({
    /** Firm / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Label for the primary CTA button on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    /** Navigation target for the logo and mobile hamburger (first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nexus Strategy Partners'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Insights', 'Industries', 'About', 'Careers']
    const ctaLabel = props.ctaLabel ?? 'Contact Us'
    const ctaTarget = props.ctaTarget ?? 'View Case Studies'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-sm bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-3"
          >
            <LogoMark className="size-10 text-lg" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
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
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="hidden rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              {ctaLabel}
            </button>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              cta={{ label: ctaLabel, target: ctaTarget }}
              label="Toggle menu"
              buttonClassName="p-2 text-muted-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
