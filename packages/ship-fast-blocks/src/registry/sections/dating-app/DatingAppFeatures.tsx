import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * DatingAppFeatures — a 6-up feature grid for a dating / matchmaking app. A
 * centered heading + supporting paragraph above a responsive 1/2/3-column grid of
 * soft muted cards, each with a rounded primary-tinted icon tile (rotating through
 * a built-in set of decorative line icons), a bold title, and a description; cards
 * lift to a faint primary tint on hover. Use to showcase product capabilities —
 * smart matching, verified profiles, conversations, events, video dates, safety —
 * for dating apps, singles platforms, or social-connection products. Renders fully
 * with no props via baked-in "HeartLink" feature defaults.
 */
export const DatingAppFeatures = defineCapsule({
  name: 'DatingAppFeatures',
  description:
    '6-up feature grid for a dating / matchmaking app: a centered heading + supporting paragraph above a responsive 1/2/3-column grid of soft muted cards, each with a rounded primary-tinted icon tile (rotating through a built-in set of decorative line icons), a bold title, and a description; cards lift to a faint primary tint on hover. Use to showcase product capabilities — smart matching, verified profiles, conversations, events, video dates, safety — for dating apps, singles platforms, or social-connection products.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresHeading = props.heading ?? 'Why millions choose HeartLink'
    const featuresDesc =
      props.description ??
      "We've designed every feature to help you find meaningful connections safely and efficiently."
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Smart Matching',
            description:
              "Our AI analyzes 32 compatibility factors—from communication style to relationship goals—to find people you'll genuinely click with.",
          },
          {
            title: 'Verified Profiles',
            description:
              "Every photo is verified through live selfie checks. Know exactly who you're talking to—no catfishing, no surprises.",
          },
          {
            title: 'Meaningful Conversations',
            description:
              'Icebreaker prompts and conversation starters based on shared interests. No more "hey" messages or awkward silences.',
          },
          {
            title: 'Local Events',
            description:
              'Discover singles events, mixers, and group activities in your city. Meet matches in safe, social settings curated by HeartLink.',
          },
          {
            title: 'Video Dates',
            description:
              'Built-in video calling with fun filters and games. Have a mini date from your couch before meeting in person.',
          },
          {
            title: 'Safety First',
            description:
              'Share your date plans with friends, access 24/7 support, and block/report with one tap. Your safety is our priority.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg
        key="chat"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
      <svg
        key="pin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg
        key="globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 018.828 8.828m0 0L5.636 5.636M18.364 18.364L21.556 21.556M18.364 5.636L21.556 2.444M5.636 18.364L2.444 21.556M12 12h.01" />
      </svg>,
      <svg
        key="safety"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {featuresHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{featuresDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl bg-muted p-8 transition-colors hover:bg-primary/5"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
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
