import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * VideoStreamingTestimonials — an inverted, cinematic subscriber-review wall for
 * a video-streaming page. On a bg-foreground/text-background band (token-driven,
 * theme-adaptive) over a giant faint quotation-mark watermark: a mono slate meta
 * rule with a review count, an asymmetric left-aligned header, and a staggered
 * 3-up grid of sharp-cornered review cards — each with a filled star row matching
 * the rating, a quoted review, and an attribution row pairing the subscriber name
 * with a mono review-source slate (App Store, Trustpilot, Google Play). The
 * public `reviews` prop ({quote, name, rating, source}) maps to the composite's
 * cards, with `source` shown as the mono meta line via `company`. Use for social
 * proof on streaming services, OTT apps, or on-demand video platforms. Renders
 * fully with no props.
 */
export const VideoStreamingTestimonials = defineCapsule({
  name: 'VideoStreamingTestimonials',
  description:
    'An inverted, cinematic subscriber-review wall for a video-streaming page: on a bg-foreground/text-background band over a giant faint quotation-mark watermark, a mono slate meta rule with a review count, an asymmetric left-aligned header, and a staggered 3-up grid of sharp-cornered review cards — each with a filled star row matching the rating, a quoted review, and an attribution row pairing the subscriber name with a mono review-source slate (App Store, Trustpilot, Google Play). Tokens-only and theme-adaptive. Use for social proof on streaming services, OTT apps, or on-demand video platforms.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Subscriber reviews: quote, name, rating, source. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          source: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by millions'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Cancelled three other services after switching. The 4K looks unreal on my TV, downloads actually work on flights, and I've never once seen an ad. This is the only subscription I'd fight to keep.",
            name: 'Daniel Okafor',
            rating: 5,
            source: 'App Store',
          },
          {
            quote:
              'The originals alone are worth it, but what sold me is how it just works — same spot on my phone, laptop, and living room TV. Five profiles means the whole house finally stopped fighting over one account.',
            name: 'Sofia Almeida',
            rating: 5,
            source: 'Trustpilot',
          },
          {
            quote:
              'Streams instantly, never buffers, and the recommendations actually nail what I want to watch next. Standard plan is the sweet spot for our family — easily the best value in streaming right now.',
            name: 'Hannah Wei',
            rating: 4,
            source: 'Google Play',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.source,
    }))

    const StarRow = ({ rating }: { rating: number }) => {
      const filled = Math.max(0, Math.min(5, Math.round(rating)))
      return (
        <div
          className="flex items-center gap-1 text-background"
          aria-label={`Rated ${filled} out of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className={cn('size-4', i >= filled && 'text-background/25')}
            >
              <path d="M10 1.5l2.47 5.26 5.78.62-4.32 3.9 1.2 5.72L10 14.9l-5.13 2.6 1.2-5.72L1.75 7.38l5.78-.62L10 1.5Z" />
            </svg>
          ))}
        </div>
      )
    }

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground pb-20 pt-24 text-background lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-4 -top-16 font-serif text-[24rem] leading-none text-background/[0.06] lg:text-[32rem]">
          &rdquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Reviews
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} verified
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            className="mb-12 gap-0"
            titleClassName="text-4xl font-extrabold tracking-tight text-background md:text-5xl"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                    'rounded-none border-background/15 bg-background/[0.04] p-7 transition-colors duration-150 hover:border-background/40',
                    i % 2 === 1 && 'md:translate-y-8',
                  )}
                >
                  <StarRow rating={__iv__.rating ?? 5} />
                  <TestimonialQuote className="text-base leading-relaxed text-background/90">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="flex-col items-start gap-1 border-t border-background/15 pt-4">
                    <TestimonialName className="text-background">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
