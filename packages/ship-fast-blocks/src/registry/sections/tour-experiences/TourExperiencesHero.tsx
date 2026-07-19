import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * TourExperiencesHero — vivid, full-bleed adventure hero for a guided-tour /
 * expedition brand. A cinematic landscape photo fills the band behind a
 * token-driven dark gradient overlay, with an eyebrow pill, a large headline,
 * supporting copy, and dual CTAs ("Explore Tours" primary + "How it works"
 * outline) that route through useNavigate. A trust strip of rating and tour
 * stats anchors the bottom. Use as the opening hero for tour operators,
 * adventure outfitters, travel-experience marketplaces, and destination guides.
 * Renders fully with no props via baked-in "Wanderwild Tours" defaults.
 */
export const TourExperiencesHero = defineCapsule({
  name: 'TourExperiencesHero',
  description:
    "Vivid full-bleed adventure hero for a guided-tour / expedition brand: a cinematic landscape photo behind a token-driven dark gradient overlay, with an eyebrow pill, a large headline, supporting copy, and dual CTAs ('Explore Tours' primary + 'How it works' outline) that route through useNavigate, plus a bottom trust strip of rating and tour stats. Use as the opening hero for tour operators, adventure outfitters, travel-experience marketplaces, and destination guides.",
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
    const go = useNavigate()
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
          overlayClassName="bg-transparent"
          gradientClassName="bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30"
        />

        <HeroContent className="mx-auto flex min-h-[36rem] max-w-7xl flex-col justify-center px-6 py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <HeroBadge
              variant="pill"
              className="gap-2 py-2 text-sm tracking-normal normal-case"
            >
              <span className="size-2 rounded-full bg-primary" />
              {eyebrow}
            </HeroBadge>
            <HeroHeading className="mt-6 text-background">
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
                variant="primary"
                className="rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                <button type="button" onClick={() => go(primaryTarget)}>
                  {primaryCta}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-background/40 bg-background/10 px-7 py-3.5 text-sm font-semibold text-background backdrop-blur-sm hover:bg-background/20"
              >
                <button type="button" onClick={() => go(secondaryTarget)}>
                  {secondaryCta}
                </button>
              </HeroCta>
            </HeroActions>
          </div>

          <StatGrid
            columns={3}
            gap="compact"
            className="mt-14 max-w-2xl border-t border-background/20 pt-8"
          >
            {stats.map((s) => (
              <StatItem key={s.label} align="center">
                <StatValue
                  size="default"
                  color="inverted"
                  className="text-2xl sm:text-3xl"
                >
                  {s.value}
                </StatValue>
                <StatLabel color="inverted" className="mt-1">
                  {s.label}
                </StatLabel>
              </StatItem>
            ))}
          </StatGrid>
        </HeroContent>
      </HeroSection>
    )
  },
})
