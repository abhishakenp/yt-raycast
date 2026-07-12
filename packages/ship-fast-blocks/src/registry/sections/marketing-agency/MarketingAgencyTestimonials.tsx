import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * MarketingAgencyTestimonials — a 3-up star-rated testimonial grid. A centered
 * eyebrow + heading + description above a responsive grid (1/3 columns) of muted
 * rounded cards, each with a 5-star rating row, a quoted client testimonial, and
 * an author block pairing a round avatar with a name and role. Use for social
 * proof on a marketing / growth agency, SaaS, or B2B services landing page.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
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
    const Star = ({ className }) => (
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
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <div key={t.name} className="rounded-xl bg-muted p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({
                    length: 5,
                  }).map((_, s) => (
                    <Star key={s} className="size-5 text-chart-4" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={`Portrait of ${t.name}, ${t.role}`}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
