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

export const ProductDetailTestimonials = defineCapsule({
  name: 'ProductDetailTestimonials',
  description:
    'Editorial-product social-proof reviews spread for the Product Detail page family, tuned for the premium Aurora Pro Headphones story and built on the shared TestimonialGrid composite. An asymmetric header (left-aligned extrabold tight-tracked heading + subheading, with a mono "[ reviews ]" average-rating readout on the right) sits above a staggered grid of sharp square review cards. Each card opens with a star row driven by the review\'s numeric 1-5 rating beside a mono tabular score, carries the verified-buyer quote over a giant faint serif quotation-mark watermark, and closes with a hairline-ruled author footer pairing an alt-driven avatar chip with the customer name and a mono uppercase role tag; the middle card steps down on desktop. A public `reviews` prop maps cleanly onto grid items so prompts can supply their own quotes, names, roles, and ratings, while Aurora-branded defaults keep the section polished out of the box. Use when composing a single-product detail page or adding a focused proof band to a larger generated site.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by listeners'
    const subheading =
      props.subheading ??
      "Thousands of Aurora owners agree — once you hear it, there's no going back."
    const columns = props.columns ?? 3
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'The soundstage on the Aurora Pro is unreal — instruments have room to breathe and the bass stays tight without ever muddying the vocals.',
            name: 'Maya Chen',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Maya Chen',
          },
          {
            quote:
              "I wear these for eight-hour studio sessions and forget they're on. The cushions are plush and they never clamp or get hot.",
            name: 'Daniel Okafor',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Daniel Okafor',
          },
          {
            quote:
              'Battery life is the real headline — I charged them once and got through a full week of commutes before they asked for more.',
            name: 'Priya Nair',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Priya Nair',
          },
          {
            quote:
              'The active noise cancellation makes open-plan offices and long flights completely silent. Only wish the case were a touch smaller.',
            name: 'Lukas Weber',
            role: 'Verified Buyer',
            rating: 4,
            avatarAlt: 'Portrait of Lukas Weber',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role ?? 'Verified Buyer',
      rating: r.rating ?? 5,
      avatarAlt: r.avatarAlt,
    }))
    const averageRating = items.length
      ? items.reduce((total, review) => total + (review.rating || 0), 0) /
        items.length
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
        className={cn('bg-background py-20 sm:py-24', props.className)}
      >
        <Container size="xl">
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

          <TestimonialGrid columns={columns}>
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
