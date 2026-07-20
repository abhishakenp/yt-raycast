import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
} from '#/section-kit/HeroSection.tsx'
import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const TravelAgencyHero = defineCapsule({
  name: 'TravelAgencyHero',
  description:
    "Full-bleed editorial-wanderlust hero for the Travel Agency page family. A breathtaking destination photo fills the band edge-to-edge behind a token darkening scrim and a giant ghost destination watermark, with a mono masthead row (eyebrow left, issue mark right) over a hairline rule, an oversized aspirational heading, supporting copy, a pair of rotated hairline passport-stamp chips, and a sharp-cornered inline itinerary search affordance (Destination / When / Who cells with mono labels plus a 'Find your trip' button, all press-responsive and wired through section-kit route links). Use as the opening viewport of a curated travel-agency / destination-catalog page. All content is prop-driven with baked defaults so it renders with no props.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    imageAlt: z.string().optional(),
    destinationPlaceholder: z.string().optional(),
    datesPlaceholder: z.string().optional(),
    travelersPlaceholder: z.string().optional(),
    searchLabel: z.string().optional(),
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Where will you go next'
    const heading = props.heading ?? 'Journeys worth a lifetime of stories'
    const subheading =
      props.subheading ??
      "Hand-crafted itineraries to the world's most breathtaking destinations, designed around the way you love to travel."
    const imageAlt =
      props.imageAlt ?? 'Breathtaking premium travel destination at golden hour'
    const destinationPlaceholder = props.destinationPlaceholder ?? 'Where to?'
    const datesPlaceholder = props.datesPlaceholder ?? 'Dates'
    const travelersPlaceholder = props.travelersPlaceholder ?? 'Travelers'
    const searchLabel = props.searchLabel ?? 'Find your trip'
    const searchTarget = props.searchTarget ?? 'Plan a Trip'
    const watermark = heading.split(' ')[0]

    const cells = [
      { label: 'Destination', placeholder: destinationPlaceholder },
      { label: 'When', placeholder: datesPlaceholder },
      { label: 'Who', placeholder: travelersPlaceholder },
    ]

    return (
      <HeroSection
        variant="full-bleed"
        className={cn('bg-foreground text-background', props.className)}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          w={1920}
          h={1280}
          overlayClassName="bg-foreground/45"
          gradientClassName="bg-gradient-to-t from-foreground/85 via-foreground/30 to-foreground/25"
        />
        <Watermark className="-bottom-[0.16em] left-[-0.03em] text-[26vw] text-background/[0.06]">
          {watermark}
        </Watermark>

        <Container asChild>
          <HeroContent className="flex min-h-[88vh] flex-col justify-center py-28">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between gap-4 text-background">
                <MonoTag tone="inverted" className="text-background/80">
                  {eyebrow}
                </MonoTag>
                <MonoTag
                  aria-hidden="true"
                  tone="inverted"
                  className="hidden text-background/50 sm:block"
                >
                  Voyage / N° 01
                </MonoTag>
              </div>
              <div
                aria-hidden="true"
                className="mt-5 h-px w-full bg-background/25"
              />
              <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-tight text-background sm:text-6xl lg:text-7xl">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-lg font-light leading-8 text-background/85">
                {subheading}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex -rotate-2 items-center border border-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-background/80">
                  All-inclusive
                </span>
                <span className="inline-flex rotate-1 items-center border border-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-background/80">
                  Advisor-guided
                </span>
              </div>
            </div>

            <div className="mt-12 w-full max-w-4xl border border-background/15 bg-background/95 p-2 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="grid gap-px bg-border sm:grid-cols-[1.3fr_1fr_1fr_auto]">
                {cells.map((cell) => (
                  <FormField
                    key={cell.label}
                    className="flex flex-col gap-1 bg-card px-4 py-3 text-left"
                  >
                    <FormFieldLabel className="mb-0 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {cell.label}
                    </FormFieldLabel>
                    <FormFieldControl
                      type="text"
                      placeholder={cell.placeholder}
                      className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </FormField>
                ))}
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 bg-primary px-7 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={searchTarget}
                >
                  {searchLabel}
                </NavbarRouteLink>
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
