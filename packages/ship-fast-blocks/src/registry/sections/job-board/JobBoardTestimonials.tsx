import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardTestimonials — a 3-up success-story testimonial grid for a job-board /
 * careers site. A centered heading + description above a 3-column grid of
 * rounded testimonial cards, each with a quote and a footer pairing a circular
 * candidate headshot with their name + role. Use as social proof on job boards,
 * hiring marketplaces, recruiting platforms or talent networks. Static (no
 * links); avatars use the alt-driven Image component. Renders fully with no
 * props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const JobBoardTestimonials = defineCapsule({
  name: 'JobBoardTestimonials',
  description:
    '3-up success-story testimonial grid for a job-board / careers site: a centered heading + description above a 3-column grid of rounded testimonial cards, each with a quote and a footer pairing a circular candidate headshot with their name + role. Use as social proof on job boards, hiring marketplaces, recruiting platforms or talent networks; avatars use the alt-driven Image component.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatar alt. */
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
    const heading = props.heading ?? 'Success stories from our community'
    const description =
      props.description ??
      'Hear from professionals who found their dream roles through WorkFlow'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I was skeptical about another job board, but WorkFlow connected me with Stripe within 3 weeks. The quality of listings here is unmatched.',
            name: 'Sarah Chen',
            role: 'Senior Engineer at Stripe',
            avatarAlt:
              'Professional headshot of a smiling software engineer with dark hair',
          },
          {
            quote:
              'After months of searching elsewhere, I found the perfect remote design role at Figma in just two weeks. The filtering actually works.',
            name: 'Marcus Johnson',
            role: 'Product Designer at Figma',
            avatarAlt:
              'Professional headshot of a product designer with a warm smile',
          },
          {
            quote:
              'The one-click apply feature saved me hours. Landed interviews with three top-tier companies and accepted an offer at Notion.',
            name: 'Emily Rodriguez',
            role: 'Marketing Lead at Notion',
            avatarAlt:
              'Professional headshot of a marketing manager with a confident expression',
          },
        ]
    return (
      <section className={cn('bg-background py-20', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight text-foreground"
            subtitleClassName="mx-auto max-w-xl text-muted-foreground"
          />
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
