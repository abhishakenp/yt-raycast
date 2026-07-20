import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MusicFestivalHero — kinetic-poster split hero for a multi-day music / arts
 * festival landing page. An asymmetric 7:5 layout: on the left a rotated,
 * dashed mono date ticket-stub chip, a poster-scale condensed uppercase
 * two-line headline, a supporting paragraph, dual sharp CTAs (a hard-offset-
 * shadow buy-tickets button beside an outlined view-lineup button, both with
 * mechanical press feedback), and a collapsed-border KPI ledger with tabular
 * numerals (artists / stages / attendees); on the right a large square-cornered
 * festival crowd photo with a floating perforated early-bird price stub
 * (countdown + starting price). A giant ghost headline word watermark bleeds
 * behind the copy. Both CTAs route through section-kit route links; the photo
 * uses the alt-driven Image component. Use as the opening hero for music
 * festivals, arts festivals, concert series, camping/desert events, or any
 * multi-day ticketed live event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MusicFestivalHero = defineCapsule({
  name: 'MusicFestivalHero',
  description:
    'Kinetic-poster split hero for a multi-day music / arts festival landing page: an asymmetric 7:5 layout with a rotated dashed mono date ticket-stub chip, a poster-scale condensed uppercase two-line headline, a supporting paragraph, dual sharp CTAs (a hard-offset-shadow buy-tickets button beside an outlined view-lineup button, both with press feedback), and a collapsed-border KPI ledger with tabular numerals (artists / stages / attendees) on the left, plus a large square-cornered festival crowd photo with a floating perforated early-bird price stub (countdown + starting price) on the right, all under a giant ghost headline watermark. Both CTAs route through section-kit route links; the photo uses the alt-driven Image component. Use as the opening hero for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed live event.',
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
          'relative overflow-hidden py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-1/3 hidden text-[13rem] leading-[0.8] lg:block">
          {headingBottom.split(' ')[0]}
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <span className="mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full border border-dashed border-foreground/40 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {eyebrow}
              </span>
              <h1 className="mb-6 text-[clamp(2.75rem,9vw,7rem)] font-extrabold uppercase leading-[0.85] tracking-tight">
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-foreground/70">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:shadow-[7px_7px_0_0] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none motion-reduce:transform-none"
                  href={primaryCta}
                >
                  {primaryCta}
                  <ArrowRight />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-[transform,background-color] duration-150 hover:bg-foreground hover:text-background active:translate-y-px motion-reduce:transform-none"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <dl className="mt-10 grid grid-cols-3 border-l border-t border-border">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="border-b border-r border-border p-4"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60">
                      {s.label}
                    </dt>
                    <dd className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={1200}
                h={800}
                className="h-[440px] w-full rounded-none object-cover grayscale-[0.15] lg:h-[560px]"
              />
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between border-2 border-dashed border-foreground/30 bg-card/95 p-5 text-card-foreground backdrop-blur-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-card-foreground/60">
                    {countdownLabel}
                  </p>
                  <p className="text-2xl font-extrabold tabular-nums">
                    {countdownValue}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-card-foreground/60">
                    {priceLabel}
                  </p>
                  <p className="text-2xl font-extrabold tabular-nums text-primary">
                    {priceValue}
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
