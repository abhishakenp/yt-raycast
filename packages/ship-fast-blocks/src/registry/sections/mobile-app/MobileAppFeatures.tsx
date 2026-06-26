import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFeatures — a centered-intro, 6-up feature grid for a clean,
 * minimalist mobile-app marketing page. A centered heading + description sits
 * above a responsive 2-/3-column grid of feature cells, each with a rounded
 * muted icon tile (that warms to the accent color on hover), a short title, and
 * a relaxed description paragraph. Icons rotate through a built-in set of
 * line-style glyphs. No links, no imagery. Use as the core value-prop / feature
 * grid on a habit tracker, fitness / wellness app, productivity or to-do app, or
 * any consumer app landing page. Renders fully with no props via baked-in
 * defaults.
 */
export const MobileAppFeatures = defineComponent({
  name: 'MobileAppFeatures',
  description:
    'Centered-intro 6-up feature grid for a clean, minimalist mobile-app marketing page: a centered heading + description over a responsive 2-/3-column grid of feature cells, each with a rounded muted icon tile (warming to the accent color on hover), a short title, and a relaxed description paragraph; icons rotate through a built-in line-style glyph set. Use as the core value-prop / feature grid on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to succeed'
    const description =
      props.description ??
      "We've stripped away the complexity. DailyFlow gives you just the right tools to build habits that stick—without the overwhelm."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Smart Reminders',
            description:
              'Gentle nudges at the right time. Our AI learns your routine and suggests optimal moments for each habit.',
          },
          {
            title: 'Visual Progress',
            description:
              'Beautiful charts and streak counters that make every small win feel meaningful and motivating.',
          },
          {
            title: 'Self-Compassion Mode',
            description:
              "Miss a day? No problem. We don't break streaks for small slips—life happens, and we get it.",
          },
          {
            title: 'Accountability Groups',
            description:
              'Join small groups of 3-5 people with similar goals. Share progress and celebrate wins together.',
          },
          {
            title: 'Dark Mode',
            description:
              'Easy on the eyes, day or night. Automatic switching based on your system preferences.',
          },
          {
            title: 'Widget Support',
            description:
              'Track habits right from your home screen with beautiful iOS and Android widgets.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="heart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>,
      <svg
        key="phone"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    return (
      <section
        className={cn('py-20 lg:py-32', props.className)}
        aria-labelledby="mobileapp-features-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-features-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <div key={item.title} className="group">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
