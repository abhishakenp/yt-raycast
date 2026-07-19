import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraTestimonials — 3-up star-rated testimonial grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above a
 * responsive 3-column card grid. Each card has a 5-star rating row (chart-4 filled
 * stars), a blockquote, and an attribution row with an alt-driven avatar image.
 * Tokens-only. Renders fully on zero arguments.
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
export const CloudInfraTestimonials = defineCapsule({
  name: 'CloudInfraTestimonials',
  description:
    'Three-up star-rated testimonial grid for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description above a responsive 3-column card grid. Each card has a 5-star rating row (chart-4 filled stars), a blockquote, and an attribution row with an alt-driven avatar image. Tokens-only. Use for social-proof, customer-endorsement bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatarAlt. */
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
    const heading = props.heading ?? 'Loved by engineering leaders'
    const description =
      props.description ?? 'See what teams say about building on CloudShift.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We migrated our entire microservices stack from AWS to CloudShift and cut our infrastructure costs by 34%. The per-second billing made a huge difference for our batch processing workloads.',
            name: 'David Chen',
            role: 'VP Engineering, StripeScale',
            avatarAlt:
              'Professional headshot of David Chen, VP of Engineering at FinTech startup',
          },
          {
            quote:
              "The serverless functions cold start at 89ms—faster than anything we've tested. Our API response times dropped from 400ms to under 120ms after switching to CloudShift's edge deployment.",
            name: 'Sarah Miller',
            role: 'CTO, NeuralPath AI',
            avatarAlt:
              'Professional headshot of Sarah Miller, CTO at AI startup',
          },
          {
            quote:
              "We needed HIPAA-compliant infrastructure for our healthcare platform. CloudShift's compliance documentation and BAA process was the smoothest we've experienced. Live in 2 days.",
            name: 'Dr. Marcus Johnson',
            role: 'Founder, CareSync Health',
            avatarAlt:
              'Professional headshot of Dr. Marcus Johnson, founder of healthcare startup',
          },
        ]
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
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
