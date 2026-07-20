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
 * MarketplaceTestimonials — editorial commerce-index review wall for a
 * multi-vendor marketplace. An asymmetric header (left extrabold heading, mono
 * "[ reviews ] avg X / 5" score on the right) sits above a staggered 1-to-3
 * column grid of sharp square review cards. Each card opens with a star row
 * driven by the review's numeric rating beside a mono tabular score, carries
 * the quoted testimonial over a giant faint serif quotation-mark watermark, and
 * closes with a hairline-ruled author footer pairing the reviewer name with a
 * mono uppercase role (Verified Buyer, Seller since 2021, …). The middle card
 * steps down on desktop for a broken-grid rhythm. The public reviews prop maps
 * to the composite's items. Use for social proof on online marketplaces,
 * multi-vendor or maker/artisan platforms, and retail aggregators. Renders fully
 * with no props via baked-in defaults.
 */
export const MarketplaceTestimonials = defineCapsule({
  name: 'MarketplaceTestimonials',
  description:
    "Editorial commerce-index review wall for a multi-vendor marketplace built on the shared TestimonialGrid composite: an asymmetric header (left extrabold heading, mono '[ reviews ] avg X / 5' score right) above a staggered 1-to-3 column grid of sharp square review cards. Each card opens with a star row driven by the review's numeric rating beside a mono tabular score, carries the quoted testimonial over a giant faint serif quotation-mark watermark, and closes with a hairline-ruled author footer pairing the reviewer name with a mono uppercase role (Verified Buyer, Seller since 2021, …); the middle card steps down on desktop. The public reviews prop maps to the composite's items. Use for social proof on online marketplaces, multi-vendor or maker/artisan platforms, and retail aggregators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Buyer / seller reviews: quote, name, rating, role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by buyers and sellers'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "I've furnished half my apartment through MarketHub. Every order arrived fast, beautifully packed, and exactly as pictured. Buyer protection made the one return effortless.",
            name: 'Hannah Cole',
            rating: 5,
            role: 'Verified Buyer',
          },
          {
            quote:
              'Opening a storefront took an afternoon and I made my first sale that same week. The seller tools and built-in payouts let me focus on making, not admin.',
            name: 'Diego Marín',
            rating: 5,
            role: 'Seller since 2021',
          },
          {
            quote:
              'The quality of independent makers here is unreal. I found a ceramicist whose work I now gift to everyone. Reviews and ratings make it easy to shop with confidence.',
            name: 'Aisha Rahman',
            rating: 4,
            role: 'Verified Buyer',
          },
        ]

    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + (review.rating || 0), 0) /
        reviews.length
      : 0

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      role: r.role,
    }))

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
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-label="Marketplace reviews"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Reviews
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-3"
                titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
              />
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ reviews ] avg {averageRating.toFixed(1)} / 5
            </p>
          </div>

          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
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
                    <TestimonialQuote className="relative text-[15px] leading-relaxed">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="border-t border-border pt-4">
                      <span className="flex min-w-0 flex-col">
                        <TestimonialName className="truncate">
                          {__iv__.name}
                        </TestimonialName>
                        {(__iv__.role || __iv__.company || __iv__.meta) && (
                          <TestimonialMeta className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                            {__iv__.role || __iv__.company || __iv__.meta}
                          </TestimonialMeta>
                        )}
                      </span>
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
