import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * AboutNavbar — glassy sticky top navigation bar for a modern company / ABOUT
 * page. A backdrop-blurred, border-bottomed header pinned to the top of the
 * viewport: an indigo-to-violet gradient zap-glyph logo tile beside the brand
 * name on the left, a horizontal set of nav links in the center (desktop), and
 * a dark "Work with us" pill CTA with a trailing arrow on the right. Every nav
 * item and the CTA route through useNavigate so labels can drive page-switching.
 * Use as the sticky site header for startups, product studios, agencies, SaaS
 * companies, or any premium brand's about/company page. Renders fully with no
 * props via baked-in "Kinetic Labs" defaults.
 */
export const AboutNavbar = defineCapsule({
  name: 'AboutNavbar',
  description:
    "Glassy sticky top navigation bar for a modern company / ABOUT page: a backdrop-blurred, border-bottomed header pinned to the top with an indigo-to-violet gradient zap-glyph logo tile + brand name on the left, a horizontal set of nav links in the center (desktop), and a dark 'Work with us' pill CTA with a trailing arrow on the right. Every nav item and the CTA route through useNavigate for page-switching. Use as the sticky site header for startups, product studios, agencies, SaaS companies, or any premium brand's about/company page.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Right-side pill CTA label. */
    cta: z.string().optional(),
    /** Navigation target for the right-side CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Kinetic Labs'
    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Values', 'Team', 'Stats']
    const cta = props.cta ?? 'Work with us'
    const ctaTarget = props.ctaTarget ?? 'Get in touch'

    // Shared brand mark — indigo→violet gradient tile + zap glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2.5 text-[1.05rem] font-extrabold tracking-tight text-foreground"
          >
            <BrandLogo brand={brand} fallback={<LogoMark />} />
          </button>
          <ul className="hidden items-center gap-7 text-[0.92rem] font-medium text-muted-foreground md:flex">
            {nav.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(ctaTarget)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
          >
            <span className="hidden sm:inline">{cta}</span>
            <ArrowRight />
          </button>
        </nav>
      </header>
    )
  },
})
