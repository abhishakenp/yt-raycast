import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'

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
    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-muted py-24 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonialItems.map((t) => (
              <Card key={t.name} rounded="2xl" padding="lg" shadow="sm">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <Star key={i} className="size-5 text-chart-4" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.meta}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
