import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EventPlannerHero — kinetic-poster split hero for an elegant event-planning
 * studio. A 7:5 asymmetric layout pairing a left text column (a ticket-stub
 * mono date-band eyebrow, a giant tight-tracked extrabold headline, a relaxed
 * lede, dual squared-off CTAs with hard offset shadows and press feedback, and a
 * collapsed-border KPI ledger) with a tall hard-framed hero photo on the right —
 * a primary-tinted offset frame block behind it and a squared floating planner
 * card (stacked avatar circles, lead-planner name/role and a serif-italic quote,
 * hard primary offset shadow) — over a giant faint serif "RSVP" watermark.
 * Primary CTA records a real Lakebed contact action, secondary CTA routes through
 * section-kit route links, and imagery is alt-driven. Use as the opening hero for
 * wedding/event planners, gala and celebration organizers, or premium hospitality.
 */
export const EventPlannerHero = defineCapsule({
  name: 'EventPlannerHero',
  description:
    'Kinetic-poster split hero for an elegant event-planning studio: a 7:5 asymmetric layout pairing a left text column (a ticket-stub mono date-band eyebrow, a giant tight-tracked extrabold headline, a relaxed lede, dual squared-off CTAs with hard offset shadows and press feedback, and a collapsed-border KPI ledger) with a tall hard-framed hero photo on the right — a primary-tinted offset frame block behind it and a squared floating planner card (stacked avatar circles, lead-planner name/role and a serif-italic quote, hard primary offset shadow) — over a giant faint serif "RSVP" watermark. Primary CTA records a real Lakebed contact action, secondary CTA routes through section-kit route links, and all imagery is alt-driven. Use as the opening hero for wedding/event planners, party, gala and celebration organizers, corporate-event companies, or premium hospitality services.',
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
          'relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-36 lg:pb-28',
          props.className,
        )}
      >
        {/* Giant faint serif watermark — the poster's ghost invitation mark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="absolute -right-4 top-16 select-none font-serif italic leading-none tracking-tighter text-foreground/[0.04] text-[8rem] sm:text-[13rem] lg:text-[19rem]">
            RSVP
          </span>
        </div>

        <Container size="xl" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              {/* Ticket-stub date band eyebrow with a hard primary offset. */}
              <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-background px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {heroEyebrow}
              </span>
              <HeroHeading className="mt-6 mb-6 text-5xl font-extrabold leading-[0.9] tracking-tighter text-balance sm:text-6xl lg:text-7xl">
                {heroHeading}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl text-lg leading-relaxed">
                {heroSub}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-3.5">
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
                  className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0] disabled:pointer-events-none disabled:opacity-70"
                >
                  {heroPrimary}
                </InquiryActionButton>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-2 border-foreground px-8 py-4 font-semibold shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0]"
                >
                  <NavbarRouteLink href={heroSecondary}>
                    {heroSecondary}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              {/* Collapsed-border KPI ledger. */}
              <HeroStats className="mt-12 grid grid-cols-3 gap-0 border-0 border-l border-t border-border pt-0 md:grid-cols-3">
                {heroStats.map((s) => (
                  <HeroStat
                    key={s.label}
                    className="border-b border-r border-border p-4 sm:p-5"
                  >
                    <HeroStatValue className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">
                      {s.value}
                    </HeroStatValue>
                    <HeroStatLabel className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {s.label}
                    </HeroStatLabel>
                  </HeroStat>
                ))}
              </HeroStats>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="relative">
                {/* Primary-tinted offset frame behind the photo. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/40 bg-primary/5 sm:translate-x-4 sm:translate-y-4"
                />
                <HeroMediaPanel
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="relative h-[440px] w-full rounded-none border-2 border-foreground lg:h-[640px]"
                />
                <div className="absolute -bottom-6 -left-3 max-w-[16rem] rounded-none border-2 border-foreground bg-background p-5 shadow-[6px_6px_0_0] shadow-primary/40 sm:-left-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-9 rounded-none border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold tracking-tight text-foreground">
                        {heroCardTitle}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {heroCardRole}
                      </p>
                    </div>
                  </div>
                  <p className="font-serif text-sm italic leading-snug text-foreground/80">
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
