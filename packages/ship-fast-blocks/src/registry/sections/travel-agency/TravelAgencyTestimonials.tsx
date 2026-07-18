import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

export const TravelAgencyTestimonials = defineCapsule({
  name: 'TravelAgencyTestimonials',
  description:
    'Social-proof testimonials band for the Travel Agency page family. Composes the shared TestimonialGrid kit composite into a three-column set of glowing traveler reviews, each with a quote, name, five-star rating, and the trip booked. Use to build trust before the closing call to action. All reviews are prop-driven with wanderlust-themed defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Our advisor planned a honeymoon we still can't stop talking about — every detail, from the overwater villa to the private sunset cruise, was flawless.",
            name: 'Maya & Daniel Rivera',
            company: 'Honeymoon package, 2025',
            rating: 5,
            avatarAlt: 'Portrait of a smiling honeymoon couple',
          },
          {
            quote:
              'Three countries in two weeks and not a single hiccup. They handled the flights, the transfers, the upgrades — I just showed up and enjoyed.',
            name: 'Priya Nair',
            company: 'Europe grand tour, 2024',
            rating: 5,
            avatarAlt: 'Portrait of a delighted solo traveler',
          },
          {
            quote:
              'Booking our family safari felt effortless. The kids were thrilled, the lodges were stunning, and the whole trip came in right on budget.',
            name: 'James Okafor',
            company: 'Family safari, 2025',
            rating: 5,
            avatarAlt: 'Portrait of a happy family traveler',
          },
        ]
    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <TestimonialGrid
            heading={props.heading ?? 'Trusted by travelers worldwide'}
            subheading={
              props.subheading ??
              "Real journeys, real stories — here's what our travelers say after coming home."
            }
            columns={3}
          >
            {items.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
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
        </Container>
      </section>
    )
  },
})
