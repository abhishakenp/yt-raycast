import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { z } from 'zod/v4'

import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'

/**
 * AuthTestimonials — field-report wall for Authly, a developer authentication
 * product. A sticky left rail carries the section heading; the right side is an
 * asymmetric editorial grid of report cards, each opening with a mono note mark
 * and a primary star row, a large quoted testimonial, and an attribution row
 * pairing a mono initials tile with the engineer's name, role, and company.
 * The public `reviews` prop ({quote, name, role, company, rating}) maps to the
 * composite's items. Use for social proof on an auth platform, identity API,
 * or login SDK. Renders fully with no props.
 */
const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '––'

export const AuthTestimonials = defineCapsule({
  name: 'AuthTestimonials',
  description:
    "Field-report testimonial wall for a developer-auth product: a sticky left rail with the heading ('Developers ship faster with us') beside an asymmetric editorial grid of report cards — mono note marks, primary star rows, large quoted testimonials, and attribution rows pairing mono initials tiles with each engineer's name, role, and company. Use for social proof on an auth platform, identity API, or login SDK.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Developer reviews: quote, name, role, company, rating. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Developers ship faster with us'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'We ripped out 4,000 lines of homegrown auth and replaced it with Authly in a weekend. SSO, MFA, and passkeys just worked. Our team finally stopped firefighting login bugs.',
            name: 'Daniela Cruz',
            role: 'CTO',
            company: 'Fintech startup',
            rating: 5,
          },
          {
            quote:
              'The SDK is genuinely a joy to use — typed end to end, great docs, and sensible defaults. We had protected routes in production the same day we signed up.',
            name: 'Marcus Lee',
            role: 'Staff Engineer',
            company: 'Datapine',
            rating: 5,
          },
          {
            quote:
              'Authly let us pass our SOC 2 audit without building a security team. Adaptive MFA and breached-password detection came out of the box. Worth every penny.',
            name: 'Aisha Okoro',
            role: 'Founder',
            company: 'Loophole',
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      company: r.company,
      rating: r.rating,
    }))
    const quoteLayouts = [
      'xl:col-span-7 xl:-rotate-1 max-lg:-rotate-1',
      'xl:col-span-5 xl:translate-y-8 xl:rotate-1 max-lg:rotate-1 max-lg:translate-x-2',
      'xl:col-span-8 xl:col-start-3 xl:rotate-[0.5deg] max-lg:-rotate-[0.6deg] max-lg:-translate-x-2',
    ]

    return (
      <section
        className={cn(
          'overflow-hidden bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
            <div className="relative lg:sticky lg:top-24">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-6 -top-14 select-none font-serif text-[10rem] leading-none text-foreground/[0.06]"
              >
                “
              </span>
              <SectionHeading
                title={heading}
                align="left"
                className="max-w-lg"
                titleClassName="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
              />
              <p className="mt-6 max-w-sm text-sm leading-6 text-pretty text-muted-foreground">
                Engineers who replaced homegrown auth with Authly, quoted with
                permission.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
              {items.map((t, index) => {
                const meta = [t.role, t.company].filter(Boolean).join(' · ')
                const rating = Math.max(0, Math.min(5, t.rating ?? 5))
                return (
                  <TestimonialCard
                    key={t.name}
                    className={cn(
                      'min-w-0 rounded-2xl bg-card p-6 shadow-sm shadow-foreground/5 sm:p-7',
                      quoteLayouts[index % quoteLayouts.length],
                    )}
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="-mx-6 -mt-6 block w-fit rounded-br-xl border-b border-r border-border bg-muted/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground sm:-mx-7 sm:-mt-7">
                        note {String(index + 1).padStart(2, '0')}
                      </span>
                      <StarRating
                        rating={rating}
                        size="sm"
                        color="primary"
                        aria-hidden="true"
                      />
                    </div>
                    <TestimonialQuote className="text-pretty text-base leading-7 sm:text-lg sm:leading-8">
                      “{t.quote}”
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-4 flex-row items-center gap-3 border-t border-border pt-5">
                      <span
                        aria-hidden="true"
                        className="inline-grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted font-mono text-xs font-bold text-foreground"
                      >
                        {initialsFrom(t.name)}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <TestimonialName className="text-base">
                          {t.name}
                        </TestimonialName>
                        {meta ? (
                          <TestimonialMeta className="font-mono text-xs uppercase tracking-[0.12em]">
                            {meta}
                          </TestimonialMeta>
                        ) : null}
                      </span>
                    </TestimonialAuthor>
                  </TestimonialCard>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
