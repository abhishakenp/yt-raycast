import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceTestimonials — customer testimonial wall for an insurance page. A
 * centered eyebrow chip + heading + lede above a responsive grid of muted
 * quote cards (up to 3 columns), each with a 5-star row, a quote, and an
 * alt-driven circular headshot beside the customer name and role. Imagery uses
 * the <Image> component. Use as the social-proof section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
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
export const InsuranceTestimonials = defineCapsule({
  name: 'InsuranceTestimonials',
  description:
    'Customer testimonial wall for an insurance page: a centered eyebrow chip + heading + lede above a responsive grid of muted quote cards (up to 3 columns), each with a 5-star row, a quote, and an alt-driven circular headshot beside the customer name and role. Imagery uses the Image component. Use as the social-proof section for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
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
    const eyebrow = props.eyebrow ?? 'Customer Stories'
    const heading = props.heading ?? 'Trusted by thousands'
    const description =
      props.description ??
      'See what our customers have to say about their experience with SecureLife.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'When a tree fell on our garage during a storm, SecureLife had an adjuster out within 4 hours. The claim was processed in 3 days. Absolutely incredible service when we needed it most.',
            name: 'Michael Chen',
            role: 'Homeowner, Seattle WA',
            avatarAlt:
              'Professional headshot of Michael Chen, a software engineer from Seattle',
          },
          {
            quote:
              'After my accident on I-95, I was stressed and overwhelmed. The SecureLife team walked me through everything, arranged a rental car same-day, and had my vehicle repaired within 2 weeks.',
            name: 'Sarah Mitchell',
            role: 'Marketing Director, Boston MA',
            avatarAlt:
              'Professional headshot of Sarah Mitchell, a marketing director from Boston',
          },
          {
            quote:
              'I switched all my policies to SecureLife and saved $340/year while getting better coverage. The online dashboard makes managing everything so simple.',
            name: 'Jennifer Williams',
            role: 'Small Business Owner, Denver CO',
            avatarAlt:
              'Professional headshot of Jennifer Williams, a small business owner from Denver',
          },
          {
            quote:
              'Setting up life insurance for my growing family was seamless. The agent helped me find the perfect term policy and the rate was 20% lower than my previous provider.',
            name: 'David Park',
            role: 'Teacher, Austin TX',
            avatarAlt:
              'Professional headshot of David Park, a teacher from Austin',
          },
          {
            quote:
              'The mobile app is a game-changer. Filed a windshield claim while waiting for my coffee. Approval came through before my latte was ready. Unbelievably convenient.',
            name: 'Amanda Foster',
            role: 'Nurse, Chicago IL',
            avatarAlt:
              'Professional headshot of Amanda Foster, a nurse from Chicago',
          },
          {
            quote:
              "As a new homeowner, I had a million questions. My SecureLife agent spent an hour on the phone explaining every detail. I finally understand what I'm paying for.",
            name: 'Robert Thompson',
            role: 'Financial Analyst, Miami FL',
            avatarAlt:
              'Professional headshot of Robert Thompson, a financial analyst from Miami',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
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
