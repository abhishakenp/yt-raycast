import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const WeddingHero = defineCapsule({
  name: 'WeddingHero',
  description:
    'Romantic full-bleed wedding hero: an alt-driven golden-hour ceremony photograph behind a soft dark overlay, with an uppercase save-the-date eyebrow pill, a large serif couple-names headline, the wedding date and venue, and dual call-to-action buttons (RSVP plus Our Story). Use as the opening viewport of a wedding invitation or celebration site to set an elegant, heartfelt tone.',
  props: z.object({
    eyebrow: z.string().optional(),
    coupleNames: z.string().optional(),
    date: z.string().optional(),
    venue: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "We're getting married"
    const coupleNames = props.coupleNames ?? 'Ava & Liam'
    const date = props.date ?? 'September 14, 2025'
    const venue = props.venue ?? 'Willowbrook Gardens · Napa Valley'
    const subheading =
      props.subheading ??
      'Two hearts, one beautiful beginning. Join us for an evening of vows, candlelight, and dancing under the stars.'
    const primaryCta = props.primaryCta ?? 'RSVP'
    const primaryTarget = props.primaryTarget ?? 'RSVP'
    const secondaryCta = props.secondaryCta ?? 'Our Story'
    const secondaryTarget = props.secondaryTarget ?? 'Story'
    const imageAlt =
      props.imageAlt ??
      'romantic outdoor wedding ceremony at golden hour with floral arch and soft bokeh'

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-b from-foreground/40 via-transparent to-foreground/70"
        />

        <Container asChild size="4xl">
          <HeroContent className="flex min-h-[88vh] flex-col items-center justify-center py-28 text-center">
            <HeroBadge variant="pill" className="mb-6 py-2">
              {eyebrow}
            </HeroBadge>

            <HeroHeading className="font-serif font-medium text-5xl tracking-normal text-background sm:text-6xl lg:text-7xl">
              {coupleNames}
            </HeroHeading>

            <p className="mt-6 text-lg font-medium uppercase tracking-[0.18em] text-background/80">
              {date}
            </p>
            <p className="mt-2 text-base text-background/80">{venue}</p>

            <HeroSubheading variant="light" className="text-lg leading-8">
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-3 text-sm font-semibold"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-border bg-card/10 px-8 py-3 text-sm font-semibold text-background backdrop-blur-sm hover:bg-card/20"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
