import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const UniversityTestimonials = defineCapsule({
  name: 'UniversityTestimonials',
  description:
    'Student and alumni voices band for the University page family with a prestigious, collegiate aesthetic. Composes the shared TestimonialGrid kit composite, mapping a public reviews prop (quote, name, class-year role, rating) into testimonial cards with star ratings and avatars. Use to build trust through authentic graduate and current-student perspectives on a university homepage.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Voices from our community'
    const subheading =
      props.subheading ??
      'Students and alumni on what a Whitmore education made possible.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'The faculty treated me like a colleague from my first seminar. I co-authored a published paper as a sophomore — that opportunity changed my entire trajectory.',
            name: 'Maya Ellison',
            role: 'Class of 2023, Biology',
            rating: 5,
          },
          {
            quote:
              "Whitmore's alumni network opened every door I knocked on. The community here is fierce, generous, and lifelong.",
            name: 'Daniel Okafor',
            role: 'Class of 2019, Economics',
            rating: 5,
          },
          {
            quote:
              'I came for the academics and stayed for the people. Late nights in the library and lifelong friendships defined my four years.',
            name: 'Priya Nair',
            role: 'Class of 2024, Computer Science',
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      rating: r.rating ?? 5,
    }))

    return (
      <section className="bg-muted/30 pt-28 pb-20 text-foreground sm:pt-32 sm:pb-24">
        <Container size="xl" className="px-6">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            columns={3}
            className={props.className}
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
