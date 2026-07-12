import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

export const SalonBarberTestimonials = defineCapsule({
  name: 'SalonBarberTestimonials',
  description:
    "Barbershop / salon client reviews section built on the shared TestimonialGrid composite. Renders a grid of star-rated quotes from regulars, each tagged with the review source (Google, Yelp), to build trust around grooming quality and consistency. Use it as the social-proof band on any barbershop, salon, or men's grooming homepage, ideally just above the booking call-to-action.",
  props: z.object({
    heading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number().optional(),
          source: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Client Reviews'
    const subheading = 'Trusted by our regulars'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'Cleanest fade in the city. They actually listen, the line-up is razor-sharp, and I walk out looking dialed in every single time.',
            name: 'Marcus Reed',
            rating: 5,
            source: 'Google',
          },
          {
            quote:
              'Hot towel shave and a beard trim that finally looks intentional. The attention to detail here is on another level.',
            name: 'Devin Park',
            rating: 5,
            source: 'Yelp',
          },
          {
            quote:
              'Great cut and a relaxed chair. Booking was easy and they kept me on schedule — only knocked a star for the wait on a busy Saturday.',
            name: 'Andre Cole',
            rating: 4,
            source: 'Google',
          },
        ]
    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.source,
    }))
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
          />
        </Container>
      </section>
    )
  },
})
