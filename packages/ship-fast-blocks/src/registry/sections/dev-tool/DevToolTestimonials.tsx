import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
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
 * DevToolTestimonials — a 3-up developer testimonials grid for a developer tool
 * / API platform. A centered heading + intro above a responsive 1/3-column grid
 * of bordered cards, each with a 5-star brand-colored rating row, a blockquote,
 * and an author row (alt-driven circular avatar + name + role). Static (no
 * links). Use as social proof to surface engineering-team quotes for developer
 * tools, API platforms, or technical SaaS.
 */
export const DevToolTestimonials = defineCapsule({
  name: 'DevToolTestimonials',
  description:
    '3-up developer testimonials grid for a developer tool / API platform: a centered heading + intro above a responsive 1/3-column grid of bordered cards, each with a 5-star brand-colored rating row, a blockquote, and an author row (alt-driven circular avatar + name + role). Use as social proof to surface engineering-team quotes for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by developers'
    const description =
      props.description ??
      'See what engineering teams are building with DevStack.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'DevStack cut our API development time by 70%. Authentication, storage, and real-time — all working out of the box. We went from prototype to production in under two weeks.',
            name: 'Marcus Chen',
            role: 'CTO, Velocity Labs',
            avatarAlt:
              'professional headshot of a male CTO with beard and glasses smiling',
          },
          {
            quote:
              'The observability features alone are worth the price. We caught a performance issue in staging that would have cost us thousands in production. Support team is incredibly responsive.',
            name: 'Sarah Williams',
            role: 'Engineering Manager, DataFlow',
            avatarAlt:
              'professional headshot of a female engineering manager with dark curly hair',
          },
          {
            quote:
              'We migrated from Firebase to DevStack and reduced our infrastructure costs by 60%. The TypeScript SDK is fantastic — everything is fully typed and documented.',
            name: 'David Park',
            role: 'Senior Developer, NexGen Apps',
            avatarAlt:
              'professional headshot of a male senior developer with short dark hair and friendly smile',
          },
        ]

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="testimonials-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
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
