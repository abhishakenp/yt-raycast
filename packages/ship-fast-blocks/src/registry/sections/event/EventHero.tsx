import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroContent,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  EventActionButton,
  EventMutationSpinner,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EventHero — kinetic-poster hero for a conference / event landing page. A slanted
 * mono date + city band sits above a poster-scale, fluid extrabold two-line
 * headline; a giant ghost year watermark bleeds behind it. A supporting paragraph,
 * a square-edged CTA pair (register / view agenda) with hard offset shadow + press
 * feedback, and a hairline row of ticket-stub stat chips (attendees / speakers /
 * hours) with tabular numerals finish the composition on a left-anchored,
 * asymmetric canvas. Register records a Lakebed event action; agenda routes through
 * section-kit route links. Use as the opening hero for tech conferences, summits,
 * meetups, workshops, festivals, or any ticketed event.
 */
export const EventHero = defineCapsule({
  name: 'EventHero',
  description:
    'Kinetic-poster hero for a conference / event landing page: a slanted mono date + city band above a poster-scale fluid extrabold two-line headline with a giant ghost year watermark bleeding behind, a supporting paragraph, a square-edged CTA pair (register / view agenda) with a hard offset shadow and press feedback, and a hairline row of ticket-stub stat chips (attendees / speakers / hours of content) with tabular numerals. Left-anchored, asymmetric canvas. Register records a Lakebed event action while agenda routes through section-kit route links. Use as the opening hero for tech conferences, summits, meetups, workshops, festivals, webinars, or any ticketed event landing page.',
  props: z.object({
    /** Date + location eyebrow above the headline. */
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
    /** Inline event-stat strip beneath the hero copy. */
    stats: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: eventLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'September 12–13, 2024 • San Francisco'
    const headingTop = props.headingTop ?? 'Where design meets'
    const headingBottom = props.headingBottom ?? 'engineering excellence'
    const subheading =
      props.subheading ??
      'Join 800+ product designers, frontend engineers, and creative technologists for two days of practical workshops, inspiring talks, and meaningful connections.'
    const primaryCta = props.primaryCta ?? 'Register Now — From $449'
    const secondaryCta = props.secondaryCta ?? 'View Full Agenda'
    const stats = props.stats?.length
      ? props.stats
      : ['800+ Attendees', '24 Speakers', '16+ Hours of Content']

    return (
      <HeroSection
        variant="default"
        className={cn('relative overflow-hidden', props.className)}
      >
        <Watermark className="-right-8 top-24 text-[9rem] leading-none sm:text-[16rem] lg:-right-12 lg:text-[24rem]">
          2024
        </Watermark>
        <HeroContent className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-36 lg:pt-28">
          <Container size="lg" className="px-0 sm:px-0 lg:px-0">
            <div className="max-w-4xl">
              <p className="mb-6 inline-block -rotate-1 border border-foreground bg-foreground px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-[clamp(2.75rem,9vw,6rem)] font-extrabold leading-[0.92] tracking-tight text-balance">
                {headingTop}
                <br className="hidden sm:block" />{' '}
                <span className="text-primary">{headingBottom}</span>
              </h1>
              <HeroSubheading variant="large" className="max-w-2xl text-pretty">
                {subheading}
              </HeroSubheading>
              <div className="flex flex-col gap-4 sm:flex-row">
                <EventActionButton
                  lakebed={lakebed}
                  action="register"
                  label={primaryCta}
                  intentKey="hero-register"
                  source="hero"
                  pendingChildren={
                    <>
                      <EventMutationSpinner />
                      Registering
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-primary px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] hover:shadow-foreground active:translate-x-[5px] active:translate-y-[5px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </EventActionButton>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground bg-background px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <dl className="mt-12 flex flex-col divide-y divide-border border-y border-border sm:flex-row sm:divide-x sm:divide-y-0">
                {stats.map((stat) => {
                  const [value, ...rest] = stat.split(' ')
                  const label = rest.join(' ')
                  return (
                    <div
                      key={stat}
                      className="flex items-baseline gap-2 py-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-1 sm:py-4 sm:pl-5 sm:first:pl-0"
                    >
                      <dt className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">
                        {value}
                      </dt>
                      <dd className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          </Container>
        </HeroContent>
      </HeroSection>
    )
  },
})
