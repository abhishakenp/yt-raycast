import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * EventPlannerHero — calm editorial split hero for a luxury event-planning agency.
 * A two-column layout pairing a left text column (uppercase eyebrow, large thin
 * light headline, relaxed lede, dual pill CTAs, and a top-bordered KPI strip) with
 * a tall rounded hero photo on the right that carries a floating planner-team card
 * (stacked avatar circles, lead-planner name/role and an italic quote). Dual CTAs
 * route through useNavigate; imagery is alt-driven. Use as the opening hero for
 * wedding/event planners, gala and celebration organizers, or premium hospitality.
 */
export const EventPlannerHero = defineComponent({
  name: 'EventPlannerHero',
  description:
    'Calm editorial split hero for a luxury event-planning agency: a two-column layout pairing a left text column (uppercase eyebrow, large thin light headline, relaxed lede, dual pill CTAs and a top-bordered KPI/stats strip) with a tall rounded hero photo on the right carrying a floating planner-team card (stacked avatar circles, lead-planner name/role and an italic quote). Dual CTAs route through useNavigate; all imagery is alt-driven. Use as the opening hero for wedding/event planners, party, gala and celebration organizers, corporate-event companies, or premium hospitality services.',
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
  component: ({ props }) => {
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
      <section
        className={cn(
          'px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-32 lg:pt-48',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-light leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroHeading}
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {heroSecondary}
                </button>
              </div>
              <div className="mt-12 flex items-center gap-8 border-t border-border pt-8">
                {heroStats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-light text-foreground">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="h-[500px] w-full rounded-2xl object-cover lg:h-[700px]"
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
        </div>
      </section>
    )
  },
})
