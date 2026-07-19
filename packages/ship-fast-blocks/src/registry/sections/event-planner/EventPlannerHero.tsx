import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import {
  InquiryActionButton,
  InquiryMutationSpinner,
} from '../contact/inquiry-interactions.tsx'

/**
 * EventPlannerHero — calm editorial split hero for a luxury event-planning agency.
 * A two-column layout pairing a left text column (uppercase eyebrow, large thin
 * light headline, relaxed lede, dual pill CTAs, and a top-bordered KPI strip) with
 * a tall rounded hero photo on the right that carries a floating planner-team card
 * (stacked avatar circles, lead-planner name/role and an italic quote). Primary
 * CTA records a real Lakebed contact action, secondary CTA routes through
 * useNavigate, and imagery is alt-driven. Use as the opening hero for
 * wedding/event planners, gala and celebration organizers, or premium hospitality.
 */
export const EventPlannerHero = defineCapsule({
  name: 'EventPlannerHero',
  description:
    'Calm editorial split hero for a luxury event-planning agency: a two-column layout pairing a left text column (uppercase eyebrow, large thin light headline, relaxed lede, dual pill CTAs and a top-bordered KPI/stats strip) with a tall rounded hero photo on the right carrying a floating planner-team card (stacked avatar circles, lead-planner name/role and an italic quote). Primary CTA records a real Lakebed contact action, secondary CTA routes through useNavigate, and all imagery is alt-driven. Use as the opening hero for wedding/event planners, party, gala and celebration organizers, corporate-event companies, or premium hospitality services.',
  lakebed: inquiryLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    cardTitle: z.string().optional(),
    cardRole: z.string().optional(),
    cardQuote: z.string().optional(),
    teamAvatars: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Est. 2012 • San Francisco'
    const heroHeading = props.heading ?? 'Crafting Moments That Last Forever'
    const heroSub =
      props.subheading ??
      'We transform your vision into extraordinary experiences. From intimate gatherings to grand celebrations, every detail is thoughtfully designed and flawlessly executed.'
    const heroPrimary = props.primaryCta ?? 'Start Planning'
    const heroSecondary = props.secondaryCta ?? 'View Our Work'
    const heroImageAlt =
      props.imageAlt ??
      'Elegant wedding reception table with floral centerpiece in warm candlelight'
    const heroCardTitle = props.cardTitle ?? 'Sarah & Team'
    const heroCardRole = props.cardRole ?? 'Lead Planners'
    const heroCardQuote = props.cardQuote ?? 'Your dream, our expertise.'
    const heroAvatars = props.teamAvatars?.length
      ? props.teamAvatars
      : [
          'Professional headshot of event planner Sarah Chen with warm smile',
          'Professional headshot of event coordinator Michael Torres',
          'Professional headshot of senior planner Emma Williams',
        ]
    const heroStats = props.stats?.length
      ? props.stats
      : [
          { value: '500+', label: 'Events Planned' },
          { value: '12', label: 'Years Experience' },
          { value: '98%', label: 'Client Satisfaction' },
        ]

    return (
      <HeroSection
        className={cn(
          'px-4 pt-20 pb-20 sm:px-6 lg:px-8 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {heroEyebrow}
              </p>
              <HeroHeading className="mb-6 font-light">
                {heroHeading}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-lg">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <InquiryActionButton
                  lakebed={lakebed}
                  label={heroPrimary}
                  source="Event planner hero"
                  target={heroPrimary}
                  kind="cta"
                  pendingChildren={
                    <>
                      <InquiryMutationSpinner />
                      Recording
                    </>
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {heroPrimary}
                </InquiryActionButton>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full px-8 py-4 font-medium"
                >
                  <button type="button" onClick={() => go(heroSecondary)}>
                    {heroSecondary}
                  </button>
                </HeroCta>
              </HeroActions>
              <HeroStats className="mt-12 flex items-center gap-8 pt-8">
                {heroStats.map((s) => (
                  <HeroStat key={s.label}>
                    <HeroStatValue className="font-light">
                      {s.value}
                    </HeroStatValue>
                    <HeroStatLabel className="mt-0">{s.label}</HeroStatLabel>
                  </HeroStat>
                ))}
              </HeroStats>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <HeroMediaPanel
                  alt={heroImageAlt}
                  w={800}
                  h={1000}

                  className="h-[500px] w-full lg:h-[700px]"
                />
                <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-6 shadow-xl">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-card object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-card-foreground">
                        {heroCardTitle}
                      </p>
                      <p className="text-muted-foreground">{heroCardRole}</p>
                    </div>
                  </div>
                  <p className="text-sm italic text-muted-foreground">
                    &ldquo;{heroCardQuote}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
