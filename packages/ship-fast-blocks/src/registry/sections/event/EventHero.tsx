import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * EventHero — centered, editorial hero for a conference / event landing page. A
 * date + city uppercase eyebrow, a large two-line headline, a supporting
 * paragraph, dual primary/secondary CTAs (register / view agenda), and an inline
 * event-stat strip (attendees / speakers / hours) beneath. Generous vertical
 * padding on a neutral canvas. Both CTAs route through useNavigate. Use as the
 * opening hero for tech conferences, summits, meetups, workshops, festivals, or
 * any ticketed event.
 */
export const EventHero = defineComponent({
  name: 'EventHero',
  description:
    'Centered, editorial hero for a conference / event landing page: a date + city uppercase eyebrow, a large two-line headline, a supporting paragraph, dual primary/secondary CTAs (register / view agenda), and an inline event-stat strip (attendees / speakers / hours of content) beneath. Generous vertical padding on a neutral canvas, content centered in a narrow column. Both CTAs route through useNavigate. Use as the opening hero for tech conferences, summits, meetups, workshops, festivals, webinars, or any ticketed event landing page.',
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
  component: ({ props }) => {
    const go = useNavigate()
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
      <section className={cn('relative overflow-hidden', props.className)}>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {headingTop}
              <br className="hidden sm:block" /> {headingBottom}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {subheading}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {stats.map((stat) => (
                <span key={stat}>{stat}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
