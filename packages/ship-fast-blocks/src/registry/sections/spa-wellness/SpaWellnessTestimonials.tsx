import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * SpaWellnessTestimonials — editorial staggered guest-review band for a day-spa
 * / wellness page. An asymmetric header (mono index eyebrow + delicate serif
 * heading + calming intro, mono count meta on the right) sits above a 1-to-3
 * column grid of square hairline review cards whose middle column steps down on
 * desktop for a calm stagger. Each card opens with a giant ghost serif
 * quotation mark opposite a primary star rating, followed by a serif guest
 * quote and a hairline-topped footer pairing the guest's name with a mono
 * "Guest" meta label. Use to build trust with social proof from spa guests,
 * members, and first-time visitors. Renders fully with no props via baked-in
 * defaults.
 */
export const SpaWellnessTestimonials = defineCapsule({
  name: 'SpaWellnessTestimonials',
  description:
    "Editorial staggered guest-review band for a day-spa / wellness page: an asymmetric header (mono index eyebrow + delicate serif heading + calming intro, mono count meta right) above a 1-to-3 column grid of square hairline review cards whose middle column steps down on desktop. Each card opens with a giant ghost serif quotation mark opposite a primary star rating, followed by a serif guest quote and a hairline-topped footer pairing the guest's name with a mono Guest meta label. Use to build trust with social proof from spa guests, members, and first-time visitors.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Guest reviews; rating is 1–5 stars. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Guests leave glowing'
    const subheading =
      props.subheading ??
      'Real words from the people who trust us with their moments of rest.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I walked in carrying a week of stress and floated out feeling brand new. The hot stone ritual is pure magic.',
            name: 'Maya R.',
            rating: 5,
          },
          {
            quote:
              'The most serene hour of my month. Every detail, from the tea to the lighting, is thoughtfully done.',
            name: 'Daniel K.',
            rating: 5,
          },
          {
            quote:
              'My skin has never looked better since starting the monthly facial. The therapists genuinely care.',
            name: 'Priya S.',
            rating: 5,
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">04 / Kind Words</MonoTag>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
            >
              {String(reviews.length).padStart(2, '0')} / reviews
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {reviews.map((review, i) => {
              const stars = Math.max(0, Math.min(5, Math.round(review.rating)))
              return (
                <TestimonialCard
                  key={review.name}
                  className={cn(
                    'relative gap-6 overflow-hidden rounded-none border-border bg-background p-7 sm:p-8',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-4 select-none font-serif text-[7rem] leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-0.5 text-primary"
                  >
                    {Array.from({ length: stars }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-3.5" />
                    ))}
                  </span>
                  <TestimonialQuote className="relative font-serif text-lg font-normal leading-relaxed tracking-tight text-foreground">
                    {review.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto items-baseline justify-between border-t border-border pt-5">
                    <TestimonialName className="text-sm font-semibold text-foreground">
                      {review.name}
                    </TestimonialName>
                    <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.15em]">
                      Guest
                    </TestimonialMeta>
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
