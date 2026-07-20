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
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * RealEstateTestimonials — editorial client-review wall for a luxury brokerage.
 * An asymmetric header (mono index rail + serif heading left, supporting line
 * right) sits above a staggered 1/2/3-column grid of sharp-cornered review
 * plates. Each plate carries a giant ghost serif quotation mark, a tabular star
 * rating, the quote, and a mono-labelled attribution. Defaults cover three
 * buyer/seller stories. Use to build social proof on a real-estate brokerage or
 * agent site. Renders fully with no props via baked-in defaults.
 */
export const RealEstateTestimonials = defineCapsule({
  name: 'RealEstateTestimonials',
  description:
    'Editorial client-review wall for a luxury brokerage: an asymmetric header (mono index rail + serif heading left, supporting line right) above a staggered 1/2/3-column grid of sharp-cornered review plates, each with a giant ghost serif quotation mark, a tabular star rating, the quote, and a mono-labelled attribution. Defaults cover three buyer/seller stories. Use to build social proof on a real-estate brokerage or agent site.',
  props: z.object({
    /** Section heading (serif, large). */
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
    const heading = props.heading ?? 'Loved by buyers and sellers'
    const description =
      props.description ??
      "The relationships outlast the closing. Here's what working with our team feels like."
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "They found us a home in a neighborhood we didn't even know to look in — and it was perfect. Negotiated below asking, too.",
            name: 'Dana & Marcus Hill',
            rating: 5,
          },
          {
            quote:
              'Sold in nine days, over asking. The staging advice and pricing strategy made all the difference.',
            name: 'Priya Raman',
            rating: 5,
          },
          {
            quote:
              'First-time buyers and totally overwhelmed. Our agent explained every step and never once made us feel rushed.',
            name: 'Jordan Webb',
            rating: 5,
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric editorial header. */}
          <div className="mb-12 grid items-end gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:gap-12 lg:mb-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Reviews
                </span>
              </div>
              <h2 className="mt-5 max-w-xl font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>

          <TestimonialGrid columns={3}>
            {reviews.map((review, i) => {
              const rating = Math.max(
                0,
                Math.min(5, Math.round(review.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={`${review.name}-${i}`}
                  className={cn(
                    'relative gap-4 overflow-hidden rounded-none border-border bg-transparent p-6 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-foreground/40 sm:p-8',
                    i % 3 === 1 &&
                      'lg:translate-y-10 lg:hover:translate-y-[calc(2.5rem-0.125rem)]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-3 select-none font-serif leading-none text-foreground/[0.06] text-[8rem]"
                  >
                    &rdquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative font-mono text-xs tracking-[0.2em] tabular-nums"
                  >
                    <span className="text-foreground">
                      {'★'.repeat(rating)}
                    </span>
                    <span className="text-border">
                      {'★'.repeat(5 - rating)}
                    </span>
                  </span>
                  <TestimonialQuote className="relative text-base leading-relaxed text-foreground">
                    {review.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="relative mt-auto border-t border-border pt-4">
                    <TestimonialName className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {review.name}
                    </TestimonialName>
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
