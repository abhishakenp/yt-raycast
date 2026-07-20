import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

export const SalonBarberTestimonials = defineCapsule({
  name: 'SalonBarberTestimonials',
  description:
    "Barbershop / salon client reviews section rendered as a vintage-lite editorial quote wall. An asymmetric header (mono index eyebrow + serif heading left, mono count right) sits over a giant serif ghost quotation-mark watermark, above a staggered grid of hairline-bordered quote cards — each with a small tabular star rating, a serif quotation, and a mono attribution row pairing the reviewer name with the review source (Google, Yelp). Use it as the social-proof band on any barbershop, salon, or men's grooming homepage, ideally just above the booking call-to-action.",
  props: z.object({
    heading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number().optional(),
          source: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Client Reviews'
    const subheading = 'Trusted by our regulars'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'Cleanest fade in the city. They actually listen, the line-up is razor-sharp, and I walk out looking dialed in every single time.',
            name: 'Marcus Reed',
            rating: 5,
            source: 'Google',
          },
          {
            quote:
              'Hot towel shave and a beard trim that finally looks intentional. The attention to detail here is on another level.',
            name: 'Devin Park',
            rating: 5,
            source: 'Yelp',
          },
          {
            quote:
              'Great cut and a relaxed chair. Booking was easy and they kept me on schedule — only knocked a star for the wait on a busy Saturday.',
            name: 'Andre Cole',
            rating: 4,
            source: 'Google',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-12 left-[-2%] font-serif text-[12rem] leading-none tracking-tighter text-foreground/[0.05] sm:text-[18rem] lg:text-[24rem]">
          &rdquo;
        </Watermark>

        <Container className="relative">
          <div className="flex flex-col gap-5 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <MonoTag tone="primary">{subheading}</MonoTag>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              {String(reviews.length).padStart(2, '0')} / on record
            </MonoTag>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.map((review, i) => {
              const rating = Math.max(0, Math.min(5, review.rating ?? 5))
              return (
                <figure
                  key={review.name}
                  className={cn(
                    'flex flex-col border border-foreground/20 bg-card p-7 sm:p-8',
                    i % 3 === 1 && 'md:translate-y-8',
                    i % 3 === 2 && 'md:translate-y-3',
                  )}
                >
                  <div
                    className="flex gap-0.5 text-sm tabular-nums text-foreground"
                    aria-label={`${rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span
                        key={s}
                        aria-hidden="true"
                        className={
                          s < rating ? 'text-foreground' : 'text-foreground/20'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <blockquote className="mt-5 font-serif text-lg italic leading-snug text-foreground">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-foreground/15 pt-4">
                    <span className="font-serif text-base font-medium text-foreground">
                      {review.name}
                    </span>
                    {review.source ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {review.source}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
