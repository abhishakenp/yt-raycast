import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * EcommerceTestimonials — editorial-commerce customer reviews spread for a
 * general online store. An asymmetric header (left-aligned extrabold heading +
 * subheading, mono "[ reviews ]" average rating on the right) above a
 * staggered 1-to-3 column grid of sharp square review cards. Each card opens
 * with a star row driven by the review's numeric 1-5 rating beside a mono
 * tabular score, carries the customer quote over a giant faint serif
 * quotation-mark watermark, and closes with a hairline-ruled author footer —
 * alt-driven avatar chip, customer name, and a mono uppercase "Verified
 * Buyer" tag. The middle card steps down on desktop for a broken-grid rhythm.
 * Use to build trust with social proof for any retail storefront, ecommerce
 * shop, or product landing page. Renders fully with no props via baked-in
 * defaults.
 */
export const EcommerceTestimonials = defineCapsule({
  name: 'EcommerceTestimonials',
  description:
    "Editorial-commerce customer reviews spread for a general online store built on the shared TestimonialGrid composite: an asymmetric header (left-aligned extrabold heading + subheading, mono '[ reviews ]' average rating right) above a staggered 1-to-3 column grid of sharp square review cards. Each card opens with a star row driven by the review's numeric 1-5 rating beside a mono tabular score, carries the customer quote over a giant faint serif quotation-mark watermark, and closes with a hairline-ruled author footer (alt-driven avatar chip, customer name, mono uppercase 'Verified Buyer' tag); the middle card steps down on desktop. Use to build trust with social proof for any retail storefront, ecommerce shop, or product landing page when showcasing customer reviews and ratings.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What Our Customers Say'
    const subheading =
      props.subheading ??
      'Thousands of happy shoppers trust us for quality products, fast shipping, and hassle-free returns.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Ordered on a Monday and it arrived two days later, perfectly packaged. The product quality far exceeded what I expected for the price. I'll definitely be shopping here again.",
            name: 'Maya Thompson',
            rating: 5,
            avatarAlt:
              'Smiling headshot of Maya Thompson, a happy online shopper',
          },
          {
            quote:
              'I had to exchange a size and the returns process was completely painless — free label, refund in a day. Customer support actually answered within minutes.',
            name: 'Daniel Rivera',
            rating: 5,
            avatarAlt:
              'Friendly headshot of Daniel Rivera, a satisfied store customer',
          },
          {
            quote:
              'Great selection and the build quality is solid. Took off one star only because shipping was a day later than estimated, but everything else was excellent.',
            name: 'Priya Nair',
            rating: 4,
            avatarAlt:
              'Warm headshot of Priya Nair, a returning online store buyer',
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
      <section
        aria-label="Customer reviews"
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
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
              .map((r) => ({
                quote: r.quote,
                name: r.name,
                rating: r.rating,
                role: 'Verified Buyer',
                avatarAlt: r.avatarAlt,
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
                        {__iv__.avatarAlt ? (
                          <Image
                            alt={__iv__.avatarAlt}
                            w={80}
                            h={80}
                            loading="lazy"
                            className="size-9 shrink-0 rounded-full border border-border object-cover"
                          />
                        ) : null}
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
