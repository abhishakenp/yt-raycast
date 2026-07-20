import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TourExperiencesHero — editorial-wanderlust full-bleed plate hero for a
 * guided-tour / expedition brand. A cinematic alt-driven landscape photo fills
 * the band edge-to-edge behind a token-driven foreground gradient, with a giant
 * ghost "WANDERLUST" watermark, a rotated mono passport-stamp eyebrow chip, a
 * huge tight-tracked headline, supporting copy, and dual CTAs ("Explore Tours"
 * inverted + "How it works" outline) that route through section-kit route links.
 * A collapsed-border ledger of rating and tour stats — mono labels, tabular
 * values — anchors the bottom. Use as the opening hero for tour operators,
 * adventure outfitters, travel-experience marketplaces, and destination guides.
 * Renders fully with no props via baked-in "Wanderwild Tours" defaults.
 */
export const TourExperiencesHero = defineCapsule({
  name: 'TourExperiencesHero',
  description:
    "Editorial-wanderlust full-bleed plate hero for a guided-tour / expedition brand: a cinematic alt-driven landscape photo fills the band edge-to-edge behind a token-driven foreground gradient, with a giant ghost 'WANDERLUST' watermark, a rotated mono passport-stamp eyebrow chip, a huge tight-tracked headline, supporting copy, and dual CTAs ('Explore Tours' inverted + 'How it works' outline) that route through section-kit route links, plus a bottom collapsed-border ledger of rating and tour stats with mono labels and tabular values. Use as the opening hero for tour operators, adventure outfitters, travel-experience marketplaces, and destination guides.",
  props: z.object({
    /** Eyebrow / kicker pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary (filled) CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed adventure landscape photo. */
    imageAlt: z.string().optional(),
    /** Trust / stat strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Small-group adventures since 2012'
    const heading = props.heading ?? 'Go beyond the guidebook'
    const subheading =
      props.subheading ??
      'Hand-crafted tours led by local guides who know the hidden trails, the best street food, and the viewpoints that never make the postcards. Big adventures, small footprints.'
    const primaryCta = props.primaryCta ?? 'Explore Tours'
    const primaryTarget = props.primaryTarget ?? 'Tours'
    const secondaryCta = props.secondaryCta ?? 'How it works'
    const secondaryTarget = props.secondaryTarget ?? 'How it works'
    const imageAlt =
      props.imageAlt ??
      'Epic mountain valley at golden hour with a group of travelers hiking a ridgeline trail toward a dramatic sunlit peak'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '4.9/5', label: 'From 12,000+ travelers' },
          { value: '180+', label: 'Destinations worldwide' },
          { value: '60', label: 'Expert local guides' },
        ]

    return (
      <HeroSection
        variant="full-bleed"
        className={cn('bg-foreground text-background', props.className)}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/20"
          gradientClassName="bg-gradient-to-t from-foreground via-foreground/75 to-foreground/25"
        />

        {/* Giant ghost destination watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 -left-2 z-0 select-none whitespace-nowrap font-extrabold leading-none tracking-tighter text-background/[0.06] text-[7rem] sm:text-[11rem] lg:text-[15rem]"
        >
          WANDERLUST
        </span>

        <Container asChild>
          <HeroContent className="flex min-h-[36rem] flex-col justify-center py-32 lg:py-40">
            <div className="max-w-2xl">
              {/* Rotated mono passport-stamp eyebrow. */}
              <span className="inline-flex -rotate-1 items-center gap-2 rounded-none border border-background/40 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background/80 backdrop-blur-sm">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {eyebrow}
              </span>
              <HeroHeading className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-tighter text-background sm:text-6xl lg:text-7xl">
                {heading}
              </HeroHeading>
              <HeroSubheading
                variant="light"
                className="max-w-xl text-lg sm:text-lg"
              >
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-10 flex-col gap-3 sm:flex-row">
                <HeroCta
                  asChild
                  variant="none"
                  className="rounded-none bg-background px-7 py-3.5 text-sm font-semibold text-foreground shadow-[5px_5px_0_0] shadow-primary transition-[transform,box-shadow] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={primaryTarget}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="none"
                  className="rounded-none border border-background/50 px-7 py-3.5 text-sm font-semibold text-background backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-background/10 active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryTarget}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
            </div>

            {/* Collapsed-border stat ledger — mono labels, tabular values. */}
            <dl className="mt-14 grid max-w-2xl grid-cols-1 border-l border-t border-background/25 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="border-b border-r border-background/25 px-5 py-4"
                >
                  <dt className="text-3xl font-extrabold leading-none tracking-tight tabular-nums text-background">
                    {s.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-background/60">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
