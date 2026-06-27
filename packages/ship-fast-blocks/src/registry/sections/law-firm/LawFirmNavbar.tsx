import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * LawFirmNavbar — sticky top navigation bar for a corporate / trial law-firm
 * site. A bordered header pinned to the top on the card surface: a squared
 * brand tile bearing the firm initial beside a two-line serif wordmark (firm
 * name + tracked-uppercase tagline) on the left, a row of quiet monochrome nav
 * links plus a solid "Free Consultation" CTA on the right (desktop), and a
 * hamburger menu button on mobile. Refined, authoritative, serif-driven
 * editorial aesthetic with sharp squared corners. Every link routes through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for law firms, attorneys, legal practices, solicitors, barristers, corporate
 * counsel, accounting/advisory or any premium professional-services site.
 * Renders fully with no props via baked-in "Reinhart & Associates" defaults.
 */
export const LawFirmNavbar = defineCapsule({
  name: 'LawFirmNavbar',
  description:
    "Sticky bordered top navigation bar for a corporate / trial law-firm site on the card surface: a squared brand tile bearing the firm initial beside a two-line serif wordmark (firm name + tracked-uppercase tagline) on the left, a row of quiet monochrome nav links plus a solid 'Free Consultation' CTA on the right (desktop), and a hamburger menu button on mobile. Refined, authoritative, serif-driven editorial aesthetic with sharp squared corners. Links route through useNavigate for page-switching. Use as the sticky site header for law firms, attorneys, legal practices, solicitors, barristers, corporate counsel, litigation boutiques, estate-planning, tax or accounting/advisory firms.",
  props: z.object({
    /** Firm / brand name shown in the wordmark and brand tile initial. */
    brand: z.string().optional(),
    /** Tracked-uppercase tagline shown under the firm name. */
    tagline: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** CTA button label on the right of the bar. */
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Reinhart & Associates'
    const tagline = props.tagline ?? 'Attorneys at Law'
    const nav = props.nav?.length
      ? props.nav
      : ['Practice Areas', 'Attorneys', 'Testimonials', 'FAQ', 'Contact']
    const ctaLabel = props.ctaLabel ?? 'Free Consultation'

    const brandInitial =
      brand
        .replace(/[^A-Za-z]/g, '')
        .charAt(0)
        .toUpperCase() || 'R'

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-card',
          props.className,
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3 text-left"
            >
              <span
                className="grid size-10 place-items-center rounded-sm bg-primary font-serif text-lg font-bold text-primary-foreground"
                aria-hidden="true"
              >
                {brandInitial}
              </span>
              <span className="block">
                <span className="block font-serif text-xl font-semibold tracking-tight text-foreground">
                  {brand}
                </span>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                  {tagline}
                </span>
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
              </button>
            </div>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={nav[0]}
              cta={{ label: ctaLabel, target: nav[nav.length - 1] }}
              buttonClassName="p-2 text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
