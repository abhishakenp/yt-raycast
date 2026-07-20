import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * VacationRentalTestimonials — an editorial-wanderlust guest-reviews wall for a
 * vacation-rental listing page. An asymmetric mono-eyebrow intro row sits above a
 * staggered set of sharp-cornered review plates, each led by a giant ghost
 * quotation mark, a foreground star rating, the quote, a bold guest name, and a
 * mono "Verified guest" source line. Theme-token only. Use to surface social
 * proof on a vacation rental, beach house, cabin, villa, or boutique short-stay
 * page. Renders fully with no props via baked-in defaults.
 */
const COLS = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
} as const

export const VacationRentalTestimonials = defineCapsule({
  name: 'VacationRentalTestimonials',
  description:
    'Editorial-wanderlust guest-reviews wall for a vacation-rental listing page: an asymmetric mono-eyebrow intro row above a staggered set of sharp-cornered review plates, each led by a giant ghost quotation mark, a foreground star rating, the quote, a bold guest name, and a mono Verified guest source line. Theme-token only. Use to surface social proof on a vacation rental, beach house, cabin, villa, or boutique short-stay page.',
  props: z.object({
    /** Section heading above the reviews grid. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Review cards: quote, name, rating, and optional role/company meta. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    /** Column count for the responsive grid. */
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The most relaxing week we've had in years. Waking up to the sound of the waves and that view from the deck — we never wanted to leave.",
            name: 'Maya & Daniel R.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a smiling couple on vacation',
          },
          {
            quote:
              "Spotless, stylish, and even better than the photos. The kitchen was a dream and the host's local recommendations made the trip.",
            name: 'Priya N.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a happy woman traveler',
          },
          {
            quote:
              "Brought the whole family, dog included. The pool was perfect for the kids and check-in could not have been easier. We're already planning our return.",
            name: 'Tom & Greta L.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a cheerful family on holiday',
          },
        ]

    const columns = props.columns ?? 3
    const heading = props.heading ?? 'Loved by guests'
    const subheading =
      props.subheading ??
      "Hundreds of five-star stays — here's what recent guests had to say."

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <MonoTag className="mb-4 block">Reviews / Guests</MonoTag>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {subheading}
            </p>
          </div>

          <div className={cn('grid grid-cols-1 gap-4', COLS[columns])}>
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
              const stars = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'relative gap-4 overflow-hidden rounded-none border-border p-7',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[7rem] leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <div
                    aria-hidden="true"
                    className="relative flex items-center gap-0.5 text-foreground"
                  >
                    {Array.from({ length: stars }).map((_, s) => (
                      <svg
                        key={s}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                      </svg>
                    ))}
                  </div>
                  <TestimonialQuote className="relative leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="relative mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="text-base font-bold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
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
