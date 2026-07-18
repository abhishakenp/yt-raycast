import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporateTestimonials — 3-up customer testimonial grid for an enterprise /
 * corporate B2B site. A centered section heading above a responsive 1/2/3-column
 * grid of cards with star ratings, a quote, and an avatar + name + role footer.
 * Use to build social proof on SaaS, consultancy, or managed services landing pages.
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
export const CorporateTestimonials = defineCapsule({
  name: 'CorporateTestimonials',
  description:
    '3-up customer testimonial grid for an enterprise / corporate B2B site: centered heading above a responsive 1/2/3-column grid of cards with a 5-star rating row, a quote, and an avatar + name + role footer. Use to build social proof on SaaS, consultancy, or managed services landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
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
    const heading = props.heading ?? 'Trusted by industry leaders'
    const description =
      props.description ??
      'See how leading organizations transformed their operations with Nexus.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Nexus transformed our infrastructure in just 90 days. We reduced operational costs by 40% while improving system reliability. Their team's expertise is unmatched in the industry.",
            name: 'Michael Chen',
            role: 'CTO, Meridian Financial Group',
            avatarAlt:
              'Professional headshot of a smiling male executive in business attire',
          },
          {
            quote:
              'The security and compliance features gave our board complete confidence. We passed our SOC 2 audit with zero findings—a first for our company. Nexus made it possible.',
            name: 'Sarah Williams',
            role: 'CISO, Horizon Healthcare Systems',
            avatarAlt:
              'Professional headshot of a female executive with confident expression',
          },
          {
            quote:
              'We evaluated 12 vendors before choosing Nexus. Their analytics platform helped us identify $3.2M in operational inefficiencies within the first quarter.',
            name: 'David Park',
            role: 'COO, Pacific Logistics Inc.',
            avatarAlt:
              'Professional headshot of a middle-aged male business leader with glasses',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
