import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * HotelResortTestimonials — guest testimonials grid for a luxury hotel /
 * resort & spa site. A muted-surface section with a centered eyebrow + thin
 * heading + paragraph, then a 3-up grid of cards, each with a 5-star rating row
 * in the primary color, a quote, and an avatar beside the guest name and
 * location/date meta. Warm and reassuring. Use to surface reviews and social
 * proof for hotels, resorts, spa retreats, inns, or wellness destinations.
 * Avatars use the alt-driven Image component. Renders fully with no props via
 * baked-in guest defaults.
 */
export const HotelResortTestimonials = defineCapsule({
  name: 'HotelResortTestimonials',
  description:
    'Guest testimonials grid for a luxury hotel / resort & spa site: a muted-surface section with a centered uppercase eyebrow + thin heading + paragraph, then a 3-up grid of cards each with a 5-star rating row in the primary color, a quote, and an avatar beside the guest name and location/date meta. Warm and reassuring; avatars use the alt-driven Image component. Use to surface reviews and social proof for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Guest Experiences'
    const heading = props.heading ?? 'What our guests say'
    const description =
      props.description ??
      'Rated 4.9/5 across 2,400+ reviews on TripAdvisor, Google, and Booking.com'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We celebrated our anniversary here and it exceeded every expectation. The Azure Suite was magnificent, the staff anticipated our needs before we even asked. Already planning our return.',
            name: 'Margaret Chen',
            meta: 'San Francisco, CA • March 2026',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "The spa experience alone is worth the trip. I've visited wellness retreats worldwide and Azure's treatments are simply world-class. The heated pool at sunrise is pure magic.",
            name: 'Robert Mitchell',
            meta: 'London, UK • February 2026',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with short gray hair',
          },
          {
            quote:
              'We hosted our company retreat here and the service was impeccable. From the private dining setup to the team-building activities, everything was flawlessly executed.',
            name: 'Sarah Johnson',
            meta: 'Austin, TX • January 2026',
            avatarAlt:
              'Professional headshot of a confident woman with blonde hair and warm smile',
          },
        ]

    return (
      <TestimonialGrid
        eyebrow={eyebrow}
        heading={heading}
        subheading={description}
        columns={3}
        className={cn(
          'bg-muted pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        {items
          .map((t) => ({
            quote: t.quote,
            name: t.name,
            role: t.meta,
            rating: 5,
            avatarAlt: t.avatarAlt,
          }))
          .map((t) => {
            const __iv__ = t as {
              quote: string
              name: string
              role?: string
              company?: string
              meta?: string
              rating?: number
              avatarAlt?: string
            }
            return (
              <TestimonialCard
                key={__iv__.name}
                className={'rounded-lg bg-card p-8'}
              >
                <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                <TestimonialAuthor>
                  <TestimonialName>{__iv__.name}</TestimonialName>
                  {(__iv__.role || __iv__.company || __iv__.meta) && (
                    <TestimonialMeta>
                      {__iv__.role || __iv__.company || __iv__.meta}
                    </TestimonialMeta>
                  )}
                </TestimonialAuthor>
              </TestimonialCard>
            )
          })}
      </TestimonialGrid>
    )
  },
})
