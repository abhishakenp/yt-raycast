import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LendingTestimonials — a 3-up borrower-testimonials grid on a muted band for a
 * lending or fintech marketing page. A centered heading + description above a
 * responsive 3-up grid of white quote cards, each with a five-star row, a quoted
 * testimonial, an avatar, and a name plus location/loan-type meta. Use to surface
 * real customer success stories on personal-loan, debt-consolidation, or fintech
 * landing pages. All avatars use the alt-driven Image component. Renders fully
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
export const LendingTestimonials = defineCapsule({
  name: 'LendingTestimonials',
  description:
    '3-up borrower-testimonials grid on a muted band for a lending or fintech marketing page: centered heading + description above a responsive 3-up grid of white quote cards, each with a five-star row, a quoted testimonial, an avatar and a name plus location/loan-type meta. Use to surface real customer success stories on personal-loan, debt-consolidation, or fintech landing pages. Avatars use the alt-driven Image component.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'What our borrowers say'
    const testimonialsDesc =
      props.description ??
      'Real stories from real people who achieved their financial goals.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I needed $12,000 for a kitchen renovation. The application took literally 90 seconds, and I had the money in my account the next morning. No stress, no hidden fees.',
            name: 'Marcus Chen',
            meta: 'Seattle, WA · Home Improvement Loan',
            avatarAlt:
              'professional headshot of a smiling man with short dark hair and beard',
          },
          {
            quote:
              "After my car broke down unexpectedly, I needed $8,000 fast. ClearLoan came through when my bank wouldn't even return my call. The rate was better than my credit union too.",
            name: 'Jennifer Park',
            meta: 'Denver, CO · Auto Repair Loan',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair wearing casual attire',
          },
          {
            quote:
              "I consolidated $22,000 across three credit cards. My rate dropped from 24% to 9.5%, and I'm saving over $400 a month. I can finally see a path to being debt-free.",
            name: 'David Rodriguez',
            meta: 'Austin, TX · Debt Consolidation',
            avatarAlt:
              'professional headshot of a smiling man with glasses and business casual attire',
          },
        ]
    return (
      <section className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <TestimonialGrid columns={3}>
            {testimonialItems.map((t) => {
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
