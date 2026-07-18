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
import { Container } from '#/section-kit/Container.tsx'

/**
 * MentalHealthTestimonials — a 3-up testimonials grid for a therapy practice. A
 * centered eyebrow + heading + intro above a responsive 1/2/3-column grid of
 * rounded bordered cards, each with a 5-star primary rating row, a quoted client
 * testimonial, and a footer pairing a round client avatar with name + therapy
 * detail. Calm, warm, sage-and-sand wellness aesthetic with soft card shadow.
 * Use as social proof for therapists, counselors, psychologists or wellness
 * centers.
 */
export const MentalHealthTestimonials = defineCapsule({
  name: 'MentalHealthTestimonials',
  description:
    '3-up testimonials grid for a therapy practice: a centered eyebrow + heading + intro above a responsive 1/2/3-column grid of rounded bordered cards, each with a 5-star primary rating row, a quoted client testimonial, and a footer pairing a round client avatar with name + therapy detail. Calm, warm, sage-and-sand wellness aesthetic with soft card shadow. Use as social proof for therapists, counselors, psychologists or wellness centers.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          detail: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Words from our clients'
    const description =
      props.description ??
      'Real stories from people who have found support and healing through our services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'After years of struggling with anxiety, I finally found a therapist who truly understands me. Dr. Chen helped me develop tools I use every day. My life has changed in ways I never thought possible.',
            name: 'David Mitchell',
            detail: 'Individual Therapy • 18 months',
            avatarAlt:
              'Professional headshot of David Mitchell, a client with warm genuine smile',
          },
          {
            quote:
              "Marcus saved our marriage. We were on the verge of separating, and six months of couples therapy gave us the communication tools we desperately needed. We're closer now than we've been in years.",
            name: 'Rebecca & James Torres',
            detail: 'Couples Therapy • 8 months',
            avatarAlt:
              'Professional headshot of Rebecca Torres, a client with confident friendly expression',
          },
          {
            quote:
              'As a parent of a teenager struggling with depression, finding the right help felt overwhelming. The team here made the process simple and my daughter actually looks forward to her sessions with Jennifer.',
            name: 'Michael Chen',
            detail: 'Family Services • 6 months',
            avatarAlt:
              'Professional headshot of Michael Chen, a parent client with thoughtful caring expression',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container size="lg">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <TestimonialGrid columns={3}>
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
