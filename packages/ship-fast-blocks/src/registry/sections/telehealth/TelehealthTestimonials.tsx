import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * TelehealthTestimonials — calm clinical + warmth patient-reviews grid for a
 * telehealth site, built on the shared TestimonialGrid composite. An asymmetric
 * header (left-aligned heading + lede, mono review-count meta on the right)
 * above a 1/2/3-column grid of square hairline cards whose middle column steps
 * down on desktop for a calm stagger; each card opens with a zero-padded mono
 * index numeral opposite a primary star-rating row, followed by the quote and a
 * hairline-topped footer pairing the patient name with a mono role/context meta
 * line. Tokens-only. Precise yet warm, telemedicine aesthetic. Use as social
 * proof near the bottom of a telehealth page to reassure prospective patients
 * before they book a visit.
 */
export const TelehealthTestimonials = defineCapsule({
  name: 'TelehealthTestimonials',
  description:
    'Calm clinical + warmth patient-reviews grid for a telehealth site, built on the shared TestimonialGrid composite: an asymmetric header (left-aligned heading + lede, mono review-count meta right) above a 1/2/3-column grid of square hairline cards whose middle column steps down on desktop for a calm stagger. Each card opens with a zero-padded mono index numeral opposite a primary star-rating row, followed by the quote and a hairline-topped footer pairing the patient name with a mono role/context meta line. Tokens-only. Precise yet warm, telemedicine aesthetic. Use as social proof near the bottom of a telehealth page to reassure prospective patients before they book a visit.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by patients everywhere'
    const subheading =
      props.subheading ??
      'Thousands of people trust us for fast, compassionate virtual care.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I saw a doctor from my couch within ten minutes and had my prescription before lunch. Genuinely life-changing for a busy parent.',
            name: 'Maya Thompson',
            role: 'Patient',
            company: 'Austin, TX',
            rating: 5,
          },
          {
            quote:
              'The therapist I matched with really listened. Being able to keep my sessions without rearranging my whole week made all the difference.',
            name: 'Daniel Reyes',
            role: 'Patient',
            company: 'Mental health care',
            rating: 5,
          },
          {
            quote:
              'Kind, professional, and fast. I was nervous about virtual care but it felt just as personal as my old clinic — without the commute.',
            name: 'Priya Nair',
            role: 'Patient',
            company: 'Urgent care visit',
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
        className={cn('bg-muted/30 py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="telehealth-reviews-heading"
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              titleId="telehealth-reviews-heading"
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(reviews.length).padStart(2, '0')} / reviews
            </MonoTag>
          </div>

          <TestimonialGrid columns={3}>
            {reviews.map((t, i) => {
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
                    'gap-5 rounded-none border-border bg-background p-6 shadow-none sm:p-7',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <MonoTag aria-hidden="true" tone="faint">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="flex items-center gap-0.5 text-primary"
                    >
                      {Array.from({ length: stars }).map((_, starIndex) => (
                        <Star key={starIndex} className="size-3.5" />
                      ))}
                    </span>
                  </div>
                  <TestimonialQuote className="text-base leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
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
