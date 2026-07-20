import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * VacationRentalHero — full-bleed, editorial-wanderlust getaway hero for a
 * vacation-rental listing page, composed like a stay-listing plate. A beautiful
 * property photo (rendered through the alt-driven Image component) fills the band
 * beneath layered token-dark scrims and a giant ghost watermark word; a
 * left-aligned column carries a mono index masthead row over a hairline rule, an
 * eyebrow, an oversized extrabold headline, a supporting line, a mono
 * location/rating ledger row with a stamp badge, and a sharp-cornered inline
 * booking ledger with mono "Check in", "Check out", and "Guests" cells plus a
 * squared "Check Availability" button (press feedback). Every action routes
 * through section-kit route links. Inviting and conversion-focused. Use as the
 * opening hero for vacation rentals, beach houses, cabins, villas, or boutique
 * short-stays. Renders fully with no props via baked-in "Azure Cove Retreats"
 * defaults.
 */
export const VacationRentalHero = defineCapsule({
  name: 'VacationRentalHero',
  description:
    'Full-bleed, editorial-wanderlust getaway hero for a vacation-rental listing page: a beautiful property photo rendered through the alt-driven Image component fills the band beneath layered token-dark scrims and a giant ghost watermark word; a left-aligned column carries a mono index masthead row over a hairline rule, an eyebrow, an oversized extrabold headline, a supporting line, a mono location/rating ledger row with a stamp badge, and a sharp-cornered inline booking ledger with mono Check in, Check out, and Guests cells plus a squared Check Availability button with press feedback. Actions route through section-kit route links. Inviting and conversion-focused; use as the opening hero for vacation rentals, beach houses, cabins, villas, or boutique short-stays.',
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

    const watermarkWord = heading.split(' ')[0] ?? ''

    const cells = [
      { label: 'Check in', value: 'Add date' },
      { label: 'Check out', value: 'Add date' },
      { label: 'Guests', value: '2 guests' },
    ]

    return (
      <HeroSection
        variant="full-bleed"
        className={cn('bg-background text-foreground', props.className)}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          w={1600}
          h={1000}
          overlayClassName="bg-foreground/55"
          gradientClassName="bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/20"
        />
        <Watermark className="-bottom-[0.14em] left-[-0.02em] z-0 text-[26vw] text-background/10">
          {watermarkWord}
        </Watermark>

        <Container asChild size="lg">
          <HeroContent className="flex flex-col py-28 sm:py-36">
            <div className="flex max-w-2xl flex-col text-background">
              <div className="flex items-center justify-between gap-4">
                <MonoTag className="text-background/80">
                  Stay N° 01 / Coastal
                </MonoTag>
                <MonoTag className="hidden text-background/60 sm:block">
                  Est. 2019
                </MonoTag>
              </div>
              <div
                aria-hidden="true"
                className="mt-5 mb-7 h-px w-full bg-background/25"
              />
              <span className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-background/85">
                <span className="inline-block size-1.5 rounded-full bg-background" />
                {eyebrow}
              </span>
              <h1 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-background sm:text-6xl lg:text-7xl">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-background/85 sm:text-lg">
                {subheading}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background/85">
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
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
                <span
                  aria-hidden="true"
                  className="h-3 w-px bg-background/30"
                />
                <span className="inline-flex -rotate-2 items-center gap-1.5 border border-background/40 px-2.5 py-1 tracking-[0.16em]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                  </svg>
                  {rating}
                </span>
              </div>
            </div>

            <div className="mt-10 w-full max-w-3xl border border-background/25 bg-background/95 p-1.5 shadow-[10px_10px_0_0] shadow-foreground/25 backdrop-blur-md sm:p-2">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-[1fr_1fr_1fr_auto]">
                {cells.map((cell) => (
                  <div
                    key={cell.label}
                    className="bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {cell.label}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-foreground">
                      {cell.value}
                    </span>
                  </div>
                ))}
                <NavbarRouteLink
                  className="col-span-2 inline-flex items-center justify-center gap-2 bg-primary px-6 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px sm:col-span-1 sm:py-[3.25rem]"
                  href={ctaTarget}
                >
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
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  {ctaLabel}
                </NavbarRouteLink>
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
