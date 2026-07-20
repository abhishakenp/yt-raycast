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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const WeddingHero = defineCapsule({
  name: 'WeddingHero',
  description:
    'Romantic-editorial full-bleed wedding hero: an alt-driven golden-hour ceremony photograph behind a soft foreground overlay, with a sharp-cornered mono save-the-date eyebrow chip, a large serif-italic couple-names headline framed by a delicate hairline flourish with a small primary diamond, the wedding date in mono uppercase tracking plus the venue, a heartfelt lede, and dual sharp-cornered call-to-action buttons (RSVP plus Our Story) with press feedback. Use as the opening viewport of a wedding invitation or celebration site to set an elegant, tender, heartfelt tone.',
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
            <HeroBadge
              variant="pill"
              className="mb-8 rounded-none border-background/30 bg-background/10 px-4 py-2 font-mono text-[11px] tracking-[0.25em]"
            >
              {eyebrow}
            </HeroBadge>

            <HeroHeading className="font-serif text-5xl font-normal italic leading-[1.02] tracking-tight text-balance text-background sm:text-6xl lg:text-7xl">
              {coupleNames}
            </HeroHeading>

            <div
              aria-hidden="true"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <span className="h-px w-14 bg-background/40" />
              <span className="size-1.5 rotate-45 bg-primary" />
              <span className="h-px w-14 bg-background/40" />
            </div>

            <p className="mt-8 font-mono text-sm uppercase tracking-[0.28em] text-background/85">
              {date}
            </p>
            <p className="mt-3 text-base text-background/75">{venue}</p>

            <HeroSubheading
              variant="light"
              className="text-lg leading-8 text-background/80"
            >
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-8 py-3.5 text-sm font-medium active:translate-y-px"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-background/40 bg-background/10 px-8 py-3.5 text-sm font-medium text-background backdrop-blur-sm hover:bg-background/20 active:translate-y-px"
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
