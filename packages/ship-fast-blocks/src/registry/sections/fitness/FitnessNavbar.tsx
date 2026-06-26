import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FitnessNavbar — sticky translucent top navigation bar for a gym / fitness-studio
 * site. A backdrop-blurred, border-bottomed header pinned to the top with a square
 * monogram logo tile (first letter of the brand) + short brand wordmark on the left,
 * horizontal muted-to-foreground nav links on the right (desktop), a filled primary
 * pill CTA built from the LAST nav item (e.g. "Start Trial"), and a hamburger menu
 * button on mobile. Every link and CTA routes through useNavigate so PageSwitch can
 * swap pages. Use as the sticky site header for gyms, fitness studios, CrossFit
 * boxes, yoga / pilates / boxing / spin studios or personal-training businesses.
 */
export const FitnessNavbar = defineComponent({
  name: 'FitnessNavbar',
  description:
    "Sticky translucent top navigation bar for a gym / fitness-studio site: a backdrop-blurred, border-bottomed header with a square monogram logo tile (first letter of the brand) + short brand wordmark on the left, horizontal muted-to-foreground nav links on the right (desktop), a filled primary pill CTA built from the LAST nav item (e.g. 'Start Trial'), and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing, spin / cycle studios, or personal-training businesses.",
  props: z.object({
    /** Brand / studio name; first letter forms the monogram, first word is shown. */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Base Fitness Studio'
    const brandShort = brand.split(/\s+/)[0]?.toUpperCase() ?? 'BASE'
    const nav = props.nav?.length
      ? props.nav
      : ['Classes', 'Trainers', 'Schedule', 'Membership', 'Start Trial']
    const navPrimary = nav[nav.length - 1] ?? 'Start Trial'

    return (
      <nav
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span
                className="grid size-8 place-items-center rounded-sm bg-foreground text-sm font-bold text-background"
                aria-hidden="true"
              >
                {brandShort.charAt(0)}
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {brandShort}
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(navPrimary)}
                className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {navPrimary}
              </button>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 md:hidden"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    )
  },
})
