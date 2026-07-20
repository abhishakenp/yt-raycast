import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * Coerce a generated review rating (which may arrive as a string, number, or
 * malformed fragment) into a usable numeric star rating. Returns `null` when
 * the value cannot be parsed so the caller can skip rendering a StarRating
 * rather than leaking raw fragments into aria labels.
 */
function coerceRating(rating: unknown): number | null {
  if (typeof rating === 'number' && Number.isFinite(rating)) return rating
  if (typeof rating === 'string') {
    const parsed = Number(rating)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

/**
 * RestaurantTestimonials — editorial guest-review wall for a restaurant page.
 * A left-aligned mono eyebrow and warm serif heading sit over a giant faint
 * serif quotation-mark watermark, above a staggered grid of square-edged
 * hairline-framed cards (alternating vertical offsets). Each card renders a
 * filled star row from the rating, the quoted testimonial, and a guest name
 * paired with a mono review-source label (Google, Yelp, OpenTable). The public
 * `reviews` prop ({quote, name, rating, source}) maps to the composite's items,
 * with `source` shown as the card's meta line via `company`. Use for
 * social-proof on restaurants, bistros, fine dining, or any dining venue.
 * Renders fully with no props via baked defaults.
 */
export const RestaurantTestimonials = defineCapsule({
  name: 'RestaurantTestimonials',
  description:
    'Editorial guest-review wall for a restaurant page: a left-aligned mono eyebrow and warm serif heading over a giant faint serif quotation-mark watermark, above a staggered grid of square-edged hairline-framed cards with alternating vertical offsets. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the guest name with a mono review-source label (Google, Yelp, OpenTable). Use for social-proof on restaurants, bistros, fine dining, or any dining venue.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Guest reviews: quote, name, rating, source/role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.union([z.number(), z.string()]),
          source: z.string().optional(),
          role: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What our guests say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'Every dish arrived plated like art and tasted even better. The pasta was made fresh that morning and the wine pairing was spot on. Easily our best dinner this year.',
            name: 'Elena Rossi',
            rating: 5,
            source: 'Google Review',
          },
          {
            quote:
              'Booked for our anniversary and the team made it unforgettable. Warm service, an unhurried pace, and a tasting menu that kept surprising us course after course.',
            name: 'Marcus Bennett',
            rating: 5,
            source: 'OpenTable',
          },
          {
            quote:
              'The seasonal menu changes often and never misses. The roasted branzino and the burnt-honey dessert are reason enough to come back. Reserve ahead — it fills up fast.',
            name: 'Priya Nair',
            rating: 4,
            source: 'Yelp',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: coerceRating(r.rating) ?? undefined,
      role: r.role,
      company: r.source,
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-top-10 right-2 font-serif text-[12rem] leading-none text-foreground/[0.05] sm:text-[18rem] lg:text-[22rem]"
        >
          &rdquo;
        </Watermark>
        <Container className="relative">
          <TestimonialGrid columns={3} className="gap-10">
            <SectionHeading
              align="left"
              eyebrow="Guest book"
              title={heading}
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-medium tracking-tight sm:text-5xl"
              className="max-w-2xl gap-4"
            />
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
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'rounded-none border-foreground/15 bg-card',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  {__iv__.rating !== undefined && (
                    <StarRating
                      rating={__iv__.rating}
                      size="sm"
                      color="primary"
                    />
                  )}
                  <TestimonialQuote className="font-serif text-lg leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-foreground/12 pt-4">
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
