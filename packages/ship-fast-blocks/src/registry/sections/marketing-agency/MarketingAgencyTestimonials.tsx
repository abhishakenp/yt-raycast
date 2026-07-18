import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyTestimonials — a 3-up star-rated testimonial grid. A centered
 * eyebrow + heading + description above a responsive grid (1/3 columns) of muted
 * rounded cards, each with a 5-star rating row, a quoted client testimonial, and
 * an author block pairing a round avatar with a name and role. Use for social
 * proof on a marketing / growth agency, SaaS, or B2B services landing page.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const MarketingAgencyTestimonials = defineCapsule({
  name: 'MarketingAgencyTestimonials',
  description:
    '3-up star-rated testimonial grid: a centered eyebrow + heading + description above a responsive grid (1/3 columns) of muted rounded cards, each with a 5-star rating row, a quoted client testimonial, and an author block pairing a round avatar with a name and role. Use for social proof from founders and marketing leaders on a marketing / growth agency, SaaS, or B2B services landing page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What Clients Say'
    const description =
      props.description ??
      "Don't just take our word for it. Here's what founders and marketing leaders say about working with us."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nexus transformed our marketing. Within 6 months, we went from $50K MRR to $180K MRR. Their data-driven approach and weekly insights helped us understand exactly what was working.',
            name: 'Marcus Chen',
            role: 'CEO, CloudSync',
          },
          {
            quote:
              'Finally, a marketing agency that understands attribution. Nexus built us a proper tracking infrastructure and our CAC dropped by 40% while volume increased. Game changer.',
            name: 'Sarah Mitchell',
            role: 'CMO, Luxe Threads',
          },
          {
            quote:
              "The SEO results have been phenomenal. We're ranking #1 for our top 20 target keywords and organic is now our #1 acquisition channel. Worth every penny.",
            name: 'David Park',
            role: 'Founder, LearnHub',
          },
        ]
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
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
