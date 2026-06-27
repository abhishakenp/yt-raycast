import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * EventVenue — a venue-spotlight split for a conference or event page. A muted
 * band with a two-column layout: on the left a heading, description, and a list
 * of detail rows (address, getting there, hotels) each with a bordered icon tile;
 * on the right a large 16:10 hero photo above a 3-up square photo collage, all
 * alt-driven. Use to highlight the location, directions, and lodging for tech
 * conference, summit, festival, or workshop pages.
 */
export const EventVenue = defineCapsule({
  name: 'EventVenue',
  description:
    'Venue-spotlight split for a conference or event page: a muted band with a two-column layout — on the left a heading, description, and a list of detail rows (address, getting there, hotels) each with a bordered icon tile; on the right a large 16:10 hero photo above a 3-up square photo collage, all alt-driven via the Image component. Use to highlight the location, directions, and lodging for tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Section heading (venue name). */
    heading: z.string().optional(),
    /** Description paragraph about the venue. */
    description: z.string().optional(),
    /** Alt text for the large hero photo. */
    imageAlt: z.string().optional(),
    /** Alt-text descriptions for the 3-up collage photos. */
    collage: z.array(z.string()).optional(),
    /** Detail rows (address, directions, hotels). */
    details: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Palace of Fine Arts'
    const description =
      props.description ??
      "Join us at one of San Francisco's most iconic venues. The Palace of Fine Arts offers stunning Beaux-Arts architecture, beautiful grounds for networking breaks, and world-class facilities for our technical sessions."
    const imageAlt =
      props.imageAlt ??
      'Palace of Fine Arts dome and columns with reflecting pond in San Francisco'
    const collage = props.collage?.length
      ? props.collage
      : [
          'Interior of Palace of Fine Arts theater with ornate architecture',
          'Outdoor courtyard at Palace of Fine Arts with columns and gardens',
          'San Francisco marina view near the conference venue at golden hour',
        ]
    const details = props.details?.length
      ? props.details
      : [
          {
            title: 'Address',
            text: '3601 Lyon Street, San Francisco, CA 94123',
          },
          {
            title: 'Getting There',
            text: 'Free shuttle from Embarcadero BART. Parking available on-site.',
          },
          {
            title: 'Hotels',
            text: 'Special rates at nearby hotels. Details sent with ticket confirmation.',
          },
        ]

    const venueIcons: ReactNode[] = [
      <svg
        key="pin"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>,
      <svg
        key="clock"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>,
      <svg
        key="bed"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </svg>,
    ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                {heading}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="mb-8 space-y-4">
                {details.map((d, i) => (
                  <div key={d.title} className="flex items-start gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground">
                      {venueIcons[i % venueIcons.length]}
                    </div>
                    <div>
                      <h4 className="font-medium">{d.title}</h4>
                      <p className="text-sm text-muted-foreground">{d.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  alt={imageAlt}
                  w={1000}
                  h={625}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {collage.map((alt) => (
                  <div
                    key={alt}
                    className="aspect-square overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={alt}
                      w={300}
                      h={300}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
