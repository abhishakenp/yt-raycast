import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DentalNavbar — sticky translucent top navigation bar for a dental practice /
 * dentist site. A backdrop-blurred, border-bottomed header pinned to the top
 * with a rounded mint-primary tooth-glyph logo tile + practice name and a small
 * "Dental Care" eyebrow on the left, horizontal nav links on the right
 * (desktop), a filled primary pill CTA (the last nav item, e.g. "Book
 * Appointment"), and a hamburger menu button on mobile. Every link and CTA
 * routes through useNavigate. Use as the sticky site header for dentists,
 * dental offices, orthodontists, or cosmetic / pediatric dental clinics.
 */
export const DentalNavbar = defineComponent({
  name: 'DentalNavbar',
  description:
    "Sticky translucent top navigation bar for a dental practice / dentist site: backdrop-blurred, border-bottomed header with a rounded mint-primary tooth-glyph logo tile + practice name and a 'Dental Care' eyebrow on the left, horizontal nav links on the right (desktop), a filled primary pill CTA built from the last nav item (e.g. 'Book Appointment'), and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for dentists, dental offices, orthodontists, or cosmetic / pediatric dental clinics.",
  props: z.object({
    /** Practice / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Small eyebrow line under the brand name. */
    tagline: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Bright Smile'
    const tagline = props.tagline ?? 'Dental Care'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Our Team', 'Reviews', 'FAQ', 'Book Appointment']

    const ToothMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )

    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
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
            onClick={() => go(nav[0])}
            className="flex items-center gap-3 text-left"
          >
            <LogoBadge className="size-10" />
            <span className="leading-tight">
              <span className="block text-xl font-semibold text-foreground">
                {brand}
              </span>
              <span className="-mt-1 block text-sm text-muted-foreground">
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
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(nav[nav.length - 1])}
              className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {nav[nav.length - 1]}
            </button>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => go(nav[0])}
            className="p-2 text-muted-foreground md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-6"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>
    )
  },
})
