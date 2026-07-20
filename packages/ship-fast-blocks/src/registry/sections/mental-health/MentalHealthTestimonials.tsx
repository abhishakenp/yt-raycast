import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
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
 * MentalHealthTestimonials — a warm-editorial client-stories grid for a therapy
 * practice. An asymmetric header (left-aligned mono eyebrow + serif heading +
 * lede, mono review-count meta right) above a 1/2/3-column grid of square
 * hairline cards whose middle column steps down on desktop for a calm stagger;
 * each card opens with a zero-padded mono index numeral opposite a five-star
 * primary rating row, followed by a serif-italic quote and a footer pairing a
 * round client avatar with the client name and a mono therapy-detail meta line.
 * Calm, warm, sage-and-sand wellness aesthetic. Avatars use the alt-driven
 * Image component. Use as social proof for therapists, counselors,
 * psychologists or wellness centers.
 */
export const MentalHealthTestimonials = defineCapsule({
  name: 'MentalHealthTestimonials',
  description:
    'Warm-editorial client-stories grid for a therapy practice: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono review-count meta right) above a 1/2/3-column grid of square hairline cards whose middle column steps down on desktop. Each card opens with a zero-padded mono index numeral opposite a five-star primary rating row, followed by a serif-italic quote and a footer pairing a round client avatar with the client name and a mono therapy-detail meta line. Calm, warm, sage-and-sand wellness aesthetic. Avatars use the Image component. Use as social proof for therapists, counselors, psychologists or wellness centers.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          detail: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Words from our clients'
    const description =
      props.description ??
      'Real stories from people who have found support and healing through our services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'After years of struggling with anxiety, I finally found a therapist who truly understands me. Dr. Chen helped me develop tools I use every day. My life has changed in ways I never thought possible.',
            name: 'David Mitchell',
            detail: 'Individual Therapy • 18 months',
            avatarAlt:
              'Professional headshot of David Mitchell, a client with warm genuine smile',
          },
          {
            quote:
              "Marcus saved our marriage. We were on the verge of separating, and six months of couples therapy gave us the communication tools we desperately needed. We're closer now than we've been in years.",
            name: 'Rebecca & James Torres',
            detail: 'Couples Therapy • 8 months',
            avatarAlt:
              'Professional headshot of Rebecca Torres, a client with confident friendly expression',
          },
          {
            quote:
              'As a parent of a teenager struggling with depression, finding the right help felt overwhelming. The team here made the process simple and my daughter actually looks forward to her sessions with Jennifer.',
            name: 'Michael Chen',
            detail: 'Family Services • 6 months',
            avatarAlt:
              'Professional headshot of Michael Chen, a parent client with thoughtful caring expression',
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
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container size="lg">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / stories
            </MonoTag>
          </div>

          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                detail?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-5 rounded-none border-border bg-muted/30 p-6 shadow-none sm:p-7',
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
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className="size-3" />
                      ))}
                    </span>
                  </div>
                  <TestimonialQuote className="font-serif text-lg font-normal italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={80}
                        h={80}
                        loading="lazy"
                        className="size-9 rounded-full object-cover"
                      />
                    ) : null}
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.detail ||
                        __iv__.role ||
                        __iv__.company ||
                        __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          {__iv__.detail ||
                            __iv__.role ||
                            __iv__.company ||
                            __iv__.meta}
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
