import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MentalHealthNavbar — a sticky, backdrop-blurred top navigation bar for a
 * therapy / counseling / mental-health practice site. A border-bottomed header
 * pinned to the top with a calming "sun/wellness" brand mark + practice name on
 * the left, horizontal nav links on the right (desktop), a filled primary
 * "Book Session" CTA, and a hamburger toggle on mobile. Calm, warm, sage-and-sand
 * wellness aesthetic. Every link and CTA routes through useNavigate. Use as the
 * sticky site header for therapists, counselors, psychologists, psychiatrists,
 * wellness centers, telehealth or behavioral-health practices.
 */
export const MentalHealthNavbar = defineComponent({
  name: 'MentalHealthNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for a therapy / counseling / mental-health practice site: a border-bottomed header with a calming 'sun/wellness' brand mark + practice name on the left, horizontal nav links on the right (desktop), a filled primary 'Book Session' CTA, and a mobile hamburger toggle. Calm, warm, sage-and-sand wellness aesthetic. All links and CTAs route through useNavigate. Use as the sticky site header for therapists, counselors, psychologists, psychiatrists, wellness centers, telehealth or behavioral-health practices.",
  props: z.object({
    /** Practice / brand name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels; the last item becomes the primary CTA. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo + mobile menu button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** Label + target for the primary "Book Session" CTA button. */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Stillpoint'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Approach', 'Team', 'Pricing', 'FAQ', 'Book Session']
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'
    const bookLabel = props.bookLabel ?? nav[nav.length - 1] ?? 'Book Session'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(bookLabel)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {bookLabel}
              </button>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(homeTarget)}
              className="p-2 text-muted-foreground md:hidden"
            >
              <svg
                className="size-6"
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
        </nav>
      </header>
    )
  },
})
