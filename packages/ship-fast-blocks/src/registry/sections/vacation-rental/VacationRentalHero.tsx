import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * VacationRentalHero — a full-bleed, immersive getaway hero for a vacation-rental
 * listing page. A beautiful property photo (rendered through the alt-driven Image
 * component) fills the band beneath a soft token-dark overlay; centered over it
 * sit an eyebrow, a large airy headline, a supporting line, a location/rating
 * row, and a glassy inline booking bar with "Check in", "Check out", and "Guests"
 * cells plus a "Check Availability" button. Every action routes through
 * useNavigate. Inviting and conversion-focused. Use as the opening hero for
 * vacation rentals, beach houses, cabins, villas, or boutique short-stays.
 * Renders fully with no props via baked-in "Azure Cove Retreats" defaults.
 */
export const VacationRentalHero = defineComponent({
  name: 'VacationRentalHero',
  description:
    'Full-bleed, immersive getaway hero for a vacation-rental listing page: a beautiful property photo rendered through the alt-driven Image component fills the band beneath a soft token-dark overlay; centered over it are an eyebrow, a large airy headline, a supporting line, a location/rating row, and a glassy inline booking bar with Check in, Check out, and Guests cells plus a Check Availability button. Actions route through useNavigate. Inviting and conversion-focused; use as the opening hero for vacation rentals, beach houses, cabins, villas, or boutique short-stays.',
  props: z.object({
    /** Small eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Location line shown with a pin glyph. */
    location: z.string().optional(),
    /** Rating line shown beside the location. */
    rating: z.string().optional(),
    /** Alt text driving the full-bleed property photo. */
    imageAlt: z.string().optional(),
    /** Label of the booking-bar submit button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the booking-bar button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Your seaside escape awaits'
    const heading = props.heading ?? 'A bright, breezy home by the water'
    const subheading =
      props.subheading ??
      'Wake to ocean light, sip coffee on the deck, and unwind in a thoughtfully designed retreat made for slow mornings and golden evenings.'
    const location = props.location ?? 'Carmel Bay, California'
    const rating = props.rating ?? '4.97 · 248 reviews'
    const imageAlt =
      props.imageAlt ??
      'Sunlit modern beach house with floor-to-ceiling windows overlooking a turquoise bay at golden hour'
    const ctaLabel = props.ctaLabel ?? 'Check Availability'
    const ctaTarget = props.ctaTarget ?? 'Book Now'

    const cells = [
      { label: 'Check in', value: 'Add date' },
      { label: 'Check out', value: 'Add date' },
      { label: 'Guests', value: '2 guests' },
    ]

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background text-foreground',
          props.className,
        )}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1600}
            h={1000}
            className="size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-foreground/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
          />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center sm:py-36 lg:px-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/15 px-4 py-1.5 text-sm font-medium text-background backdrop-blur-sm">
            <span className="inline-block size-1.5 rounded-full bg-background" />
            {eyebrow}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-background sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/85">
            {subheading}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-background/90">
            <span className="inline-flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
              </svg>
              {rating}
            </span>
          </div>

          <div className="mt-10 w-full max-w-3xl rounded-2xl border border-background/30 bg-background/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
              {cells.map((cell) => (
                <div
                  key={cell.label}
                  className="rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {cell.label}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-foreground">
                    {cell.value}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:py-[3.25rem]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
