import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * PropertyListingTestimonials — editorial review spread for a property portal.
 * An asymmetric header (left-aligned extrabold heading + subheading, mono
 * "[ reviews ] avg N / 5" meta on the right) sits above a staggered 1/2/3-column
 * grid of sharp square review cards. Each card opens with a star row driven by
 * the review's numeric 1-5 rating beside a mono tabular score, carries the quote
 * over a giant faint serif quotation-mark watermark, and closes with a
 * hairline-ruled author footer. The middle card steps down on desktop for a
 * broken-grid rhythm. Defaults cover three renter/buyer stories. Use to build
 * trust on a property marketplace or search portal. Renders fully with no props
 * via baked-in defaults.
 */
export const PropertyListingTestimonials = defineCapsule({
  name: 'PropertyListingTestimonials',
  description:
    "Editorial review spread for a property portal: an asymmetric header (left-aligned extrabold heading + subheading, mono '[ reviews ] avg N / 5' meta right) above a staggered 1/2/3-column grid of sharp square review cards, each opening with a star row driven by the review's numeric 1-5 rating beside a mono tabular score, carrying the quote over a giant faint serif quotation-mark watermark, and closing with a hairline-ruled author footer. Defaults cover three renter/buyer stories. Use to build trust on a property marketplace or search portal.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Review cards (rating is 1–5). */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'People find their place here'
    const description =
      props.description ??
      "Thousands of renters and buyers start their search with us every day. Here's why they stay."
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I filtered to pet-friendly under budget and had three tours booked the same afternoon. Signed a lease that week.',
            name: 'Alyssa Tran',
            rating: 5,
          },
          {
            quote:
              'The saved-search alerts are unreal — I got the listing within an hour of it going live and beat everyone to it.',
            name: 'Devon Carter',
            rating: 5,
          },
          {
            quote:
              "Map search showed me commute times I'd never have checked myself. Found a place ten minutes from work.",
            name: 'Mei Lin',
            rating: 4,
          },
        ]

    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + (review.rating || 0), 0) /
        reviews.length
      : 0

    const Star = ({ filled }: { filled: boolean }) => (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={cn('size-3.5', filled ? 'fill-foreground' : 'fill-border')}
      >
        <path d="M10 1.5l2.47 5.35 5.86.63-4.37 3.96 1.2 5.77L10 14.3l-5.16 2.91 1.2-5.77-4.37-3.96 5.86-.63L10 1.5z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-sm text-muted-foreground sm:text-base"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ reviews ] avg {averageRating.toFixed(1)} / 5
            </p>
          </div>

          <TestimonialGrid columns={3}>
            {reviews
              .map((review) => ({
                quote: review.quote,
                name: review.name,
                rating: review.rating,
              }))
              .map((t, i) => {
                const __iv__ = t as {
                  quote: string
                  name: string
                  role?: string
                  company?: string
                  meta?: string
                  rating?: number
                  avatarAlt?: string
                }
                const filledStars = Math.max(
                  0,
                  Math.min(5, Math.round(__iv__.rating ?? 0)),
                )
                return (
                  <div
                    key={__iv__.name}
                    className={cn(i % 3 === 1 && 'lg:translate-y-10')}
                  >
                    <TestimonialCard className="relative h-full gap-5 overflow-hidden rounded-none p-7 hover:border-foreground/40">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-5 right-3 select-none font-serif text-[7rem] leading-none text-foreground/[0.06]"
                      >
                        &rdquo;
                      </span>
                      {__iv__.rating ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, starIndex) => (
                              <Star
                                key={starIndex}
                                filled={starIndex < filledStars}
                              />
                            ))}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                            {(__iv__.rating ?? 0).toFixed(1)}
                          </span>
                        </div>
                      ) : null}
                      <TestimonialQuote className="relative text-[15px] leading-relaxed">
                        {__iv__.quote}
                      </TestimonialQuote>
                      <TestimonialAuthor className="border-t border-border pt-4">
                        <TestimonialName className="truncate">
                          {__iv__.name}
                        </TestimonialName>
                        {(__iv__.role || __iv__.company || __iv__.meta) && (
                          <TestimonialMeta className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                            {__iv__.role || __iv__.company || __iv__.meta}
                          </TestimonialMeta>
                        )}
                      </TestimonialAuthor>
                    </TestimonialCard>
                  </div>
                )
              })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
