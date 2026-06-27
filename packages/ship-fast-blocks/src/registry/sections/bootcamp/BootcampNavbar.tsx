import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BootcampNavbar — sticky translucent top navigation bar for a coding bootcamp /
 * career-school landing page. A blurred, border-bottomed header pinned to the
 * top of the viewport: a solid brand-initial logo tile beside the academy name
 * on the left, a horizontal set of nav links in the center (desktop), and a
 * rounded primary CTA on the right. The brand button routes to `homeTarget`,
 * nav links route to their own labels, and the CTA routes to `ctaTarget`.
 * Every link routes through useNavigate so labels can drive page-switching.
 * Use as the sticky site header for coding bootcamps, dev academies, vocational
 * tech schools, or any cohort-based education brand.
 */
export const BootcampNavbar = defineCapsule({
  name: 'BootcampNavbar',
  description:
    'Sticky translucent top navigation bar for a coding bootcamp / career-school landing page: blurred, border-bottomed header pinned to the top with a solid brand-initial logo tile + academy name on the left, horizontal nav links in the center (desktop), and a rounded primary CTA on the right. Brand button routes to homeTarget, nav links route to their own labels, and the CTA routes to ctaTarget through useNavigate. Use as the sticky site header for coding bootcamps, dev academies, vocational tech schools, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; each drives its own route target. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand button (first nav item). */
    homeTarget: z.string().optional(),
    /** CTA button route target. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'CodeCraft Academy'
    const nav = props.nav?.length
      ? props.nav
      : ['Curriculum', 'Outcomes', 'Mentors', 'Pricing', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? 'Start Your Application'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand
          .split(' ')
          .map((w) => w.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2"
          >
            <LogoMark className="size-8 text-sm" />
            <span className="text-lg font-semibold">{brand}</span>
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
            className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            Apply Now
          </button>
        </nav>
      </header>
    )
  },
})
