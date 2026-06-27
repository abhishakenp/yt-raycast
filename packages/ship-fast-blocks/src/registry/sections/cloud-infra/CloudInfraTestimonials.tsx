import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CloudInfraTestimonials — 3-up star-rated testimonial grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above a
 * responsive 3-column card grid. Each card has a 5-star rating row (chart-4 filled
 * stars), a blockquote, and an attribution row with an alt-driven avatar image.
 * Tokens-only. Renders fully on zero arguments.
 */
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('bg-muted/40 py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <article
                key={t.name}
                className="rounded-xl border border-border bg-card p-8"
              >
                <div className="mb-6 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 text-chart-4" />
                  ))}
                </div>
                <blockquote className="mb-6 leading-relaxed text-card-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
