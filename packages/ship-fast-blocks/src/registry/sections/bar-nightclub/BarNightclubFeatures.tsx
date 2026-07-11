import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * BarNightclubFeatures — 3-up centered features strip for a cocktail-bar /
 * nightclub page. A responsive row of equal columns, each with a thin
 * circle-bordered line icon (building / music / clock, rotated by index), a
 * medium title, and a muted description paragraph. Quiet, editorial, monochrome
 * — used to summarize the venue's three pillars (e.g. craft cocktails, live DJ
 * sets, late night). Use directly under the hero on bar, nightclub, lounge, or
 * speakeasy pages. Renders fully with no props via baked-in defaults.
 */
export const BarNightclubFeatures = defineCapsule({
  name: 'BarNightclubFeatures',
  description:
    "3-up centered features strip for a cocktail-bar / nightclub page: a responsive row of equal columns, each with a thin circle-bordered line icon (building / music / clock, rotated by index), a medium title, and a muted description paragraph. Quiet, editorial and monochrome, used to summarize the venue's three pillars such as craft cocktails, live DJ sets, and late night. Use directly under the hero on bar, nightclub, lounge, or speakeasy pages.",
  props: z.object({
    /** Three feature cards (title + description). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Craft Cocktails',
            description:
              'Award-winning mixologists creating signature drinks with house-made syrups, rare spirits, and precision technique.',
          },
          {
            title: 'Live DJ Sets',
            description:
              'Resident and guest DJs spinning deep house, techno, and disco every Thursday through Saturday until 4 AM.',
          },
          {
            title: 'Late Night',
            description:
              'Open until 4 AM on weekends. Private booths, VIP sections, and bottle service available all night.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="building"
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
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      <svg
        key="music"
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
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>,
      <svg
        key="clock"
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    return (
      <section className={cn('py-24 lg:py-32', props.className)}>
        <Container>
          <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
            {items.map((f, i) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full border border-border text-foreground">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-3 text-lg font-medium">{f.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
