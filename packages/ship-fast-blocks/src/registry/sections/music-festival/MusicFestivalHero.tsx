import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * MusicFestivalHero — split, editorial hero for a multi-day music / arts
 * festival landing page. A two-column layout: on the left a warm-clay uppercase
 * date eyebrow, a huge two-line headline, a supporting paragraph, dual
 * primary/secondary pill CTAs (buy tickets / view lineup), and a bordered
 * inline KPI strip (artists / stages / attendees); on the right a large rounded
 * festival crowd photo with a floating early-bird price card overlay
 * (countdown + starting price). Both CTAs route through useNavigate; the photo
 * uses the alt-driven Image component. Use as the opening hero for music
 * festivals, arts festivals, concert series, camping/desert events, or any
 * multi-day ticketed live event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
export const MusicFestivalHero = defineCapsule({
  name: 'MusicFestivalHero',
  description:
    'Split, editorial hero for a multi-day music / arts festival landing page: a two-column layout with a warm-clay uppercase date eyebrow, a huge two-line headline, a supporting paragraph, dual primary/secondary pill CTAs (buy tickets / view lineup), and a bordered inline KPI strip (artists / stages / attendees) on the left, plus a large rounded festival crowd photo with a floating early-bird price card overlay (countdown + starting price) on the right. Both CTAs route through useNavigate; the photo uses the alt-driven Image component. Use as the opening hero for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed live event.',
  props: z.object({
    /** Date eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** First line of the headline. */
    headingTop: z.string().optional(),
    /** Second line of the headline. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text for the hero photo. */
    imageAlt: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    /** Floating early-bird price card label (countdown). */
    countdownLabel: z.string().optional(),
    /** Floating early-bird price card countdown value. */
    countdownValue: z.string().optional(),
    /** Floating early-bird price card price label. */
    priceLabel: z.string().optional(),
    /** Floating early-bird price card price value. */
    priceValue: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'August 15-17, 2025'
    const headingTop = props.headingTop ?? 'Three days of'
    const headingBottom = props.headingBottom ?? 'music & magic'
    const subheading =
      props.subheading ??
      'Join 25,000 music lovers in the Mojave Desert for an unforgettable weekend featuring 80+ artists across four stages, immersive art installations, and camping under the stars.'
    const primaryCta = props.primaryCta ?? 'Buy Tickets'
    const secondaryCta = props.secondaryCta ?? 'View Lineup'
    const imageAlt =
      props.imageAlt ??
      'Festival crowd with raised hands silhouetted against orange sunset sky and stage lights'
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '80+',
            label: 'Artists',
          },
          {
            value: '4',
            label: 'Stages',
          },
          {
            value: '25K',
            label: 'Attendees',
          },
        ]
    const countdownLabel = props.countdownLabel ?? 'Early Bird Ends In'
    const countdownValue = props.countdownValue ?? '47 days'
    const priceLabel = props.priceLabel ?? 'Starting at'
    const priceValue = props.priceValue ?? '$249'
    const ArrowRight = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-foreground/70">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex items-center gap-8 border-t border-border pt-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm text-foreground/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={1200}
                h={800}
                className="h-[500px] w-full rounded-xl object-cover lg:h-[600px]"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-xl bg-card/95 p-6 text-card-foreground backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-card-foreground/60">
                      {countdownLabel}
                    </p>
                    <p className="text-2xl font-bold">{countdownValue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-card-foreground/60">
                      {priceLabel}
                    </p>
                    <p className="text-2xl font-bold">{priceValue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
