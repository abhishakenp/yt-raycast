import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const TravelAgencyHero = defineCapsule({
  name: 'TravelAgencyHero',
  description:
    "Bespoke, full-bleed wanderlust hero for the Travel Agency page family. Renders a breathtaking destination image behind a token-based dark overlay, with an eyebrow, an oversized aspirational heading, supporting copy, and an inline destination search affordance (Where to? / Dates / Travelers cells plus a 'Find your trip' button wired through section-kit route links). Use as the opening viewport of a premium travel agency page. All content is prop-driven with baked defaults so it renders with no props.",
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

    return (
      <HeroSection
        variant="full-bleed"
        className={cn('bg-background text-foreground', props.className)}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          w={1920}
          h={1280}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent"
        />

        <Container asChild>
          <HeroContent className="flex min-h-[88vh] flex-col justify-center py-28">
            <div className="max-w-3xl">
              <HeroBadge variant="pill" className="py-2 text-sm tracking-wider">
                {eyebrow}
              </HeroBadge>
              <HeroHeading className="mt-6 text-5xl tracking-normal text-background sm:text-6xl lg:text-7xl">
                {heading}
              </HeroHeading>
              <HeroSubheading
                variant="light"
                className="text-lg leading-8 text-background/85 sm:text-lg"
              >
                {subheading}
              </HeroSubheading>
            </div>

            <Card
              variant="default"
              className="mt-12 w-full max-w-4xl bg-card/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-md rounded-3xl p-0"
            >
              <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
                <FormField className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                  <FormFieldLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Destination
                  </FormFieldLabel>
                  <FormFieldControl
                    type="text"
                    placeholder={destinationPlaceholder}
                    className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </FormField>
                <FormField className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                  <FormFieldLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    When
                  </FormFieldLabel>
                  <FormFieldControl
                    type="text"
                    placeholder={datesPlaceholder}
                    className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </FormField>
                <FormField className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                  <FormFieldLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Who
                  </FormFieldLabel>
                  <FormFieldControl
                    type="text"
                    placeholder={travelersPlaceholder}
                    className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </FormField>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  href={searchTarget}
                >
                  {searchLabel}
                </NavbarRouteLink>
              </div>
            </Card>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
