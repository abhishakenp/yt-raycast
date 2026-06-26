import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * EventFeatures — an "everything you get" feature grid for a conference or event
 * page. A centered heading + description above a responsive 3-up (2-up on tablet)
 * grid of feature blocks, each with a rounded icon tile that tints on hover, a
 * title, and a description. Icons rotate through a built-in set. Use to outline
 * what attendees receive (sessions, networking, workshops, swag, venue, party) on
 * tech conference, summit, meetup, festival, or workshop pages.
 */
export const EventFeatures = defineComponent({
  name: 'EventFeatures',
  description:
    "'Everything you get' feature grid for a conference or event page: a centered heading + description above a responsive 3-up (2-up on tablet) grid of feature blocks, each with a rounded icon tile that tints on hover, a title, and a description. Icons rotate through a built-in set (lightbulb, people, wrench, gift, building, party). Use to outline what attendees receive — sessions, networking, workshops, swag, venue, closing party — on tech conference, summit, meetup, festival, or workshop pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Feature items. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to level up'
    const description =
      props.description ??
      'Two packed days of learning, networking, and hands-on experiences designed for modern product teams.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Expert-Led Sessions',
            description:
              'Learn from industry leaders at Vercel, Figma, Linear, and more. Every talk is carefully curated for practical takeaways.',
          },
          {
            title: 'Intimate Networking',
            description:
              'Connect with peers during curated networking sessions, evening socials, and structured breakfast meetups.',
          },
          {
            title: 'Hands-On Workshops',
            description:
              'Deep-dive workshops on React Server Components, design systems, accessibility, and advanced CSS techniques.',
          },
          {
            title: 'Exclusive Swag',
            description:
              'Premium conference kit including limited edition apparel, stickers, notebooks, and tools from our sponsors.',
          },
          {
            title: 'Amazing Venue',
            description:
              'Experience the historic Palace of Fine Arts, with stunning architecture and outdoor spaces perfect for breaks.',
          },
          {
            title: 'Closing Party',
            description:
              'Celebrate with fellow attendees at our exclusive Friday evening party featuring live music, food, and drinks.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="bulb"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
      </svg>,
      <svg
        key="people"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      <svg
        key="wrench"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2.6-2.6z" />
      </svg>,
      <svg
        key="gift"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>,
      <svg
        key="building"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <line x1="9" y1="7" x2="10" y2="7" />
        <line x1="9" y1="11" x2="10" y2="11" />
        <line x1="14" y1="7" x2="15" y2="7" />
        <line x1="14" y1="11" x2="15" y2="11" />
      </svg>,
      <svg
        key="party"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
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
