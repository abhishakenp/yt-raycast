import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DentalTestimonials — staggered patient-stories grid for a dental practice
 * site. An asymmetric header (left-aligned mono eyebrow + heading + lede, mono
 * index meta right) above a 1-to-3 column grid of square hairline review
 * cards; the middle column steps down on desktop for a calm stagger. Each card
 * opens with a zero-padded mono index numeral opposite a five-star primary
 * rating row, followed by the quote and a footer pairing a round patient
 * avatar with the patient name and a mono location / since-date meta line.
 * Avatars use the alt-driven Image component. Use to surface social proof for
 * dentists, dental offices, orthodontists, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const DentalTestimonials = defineCapsule({
  name: 'DentalTestimonials',
  description:
    'Staggered patient-stories grid for a dental practice site: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono index meta right) above a 1-to-3 column grid of square hairline review cards whose middle column steps down on desktop. Each card opens with a zero-padded mono index numeral opposite a five-star primary rating row, followed by the quote and a footer pairing a round patient avatar with the patient name and a mono location / since-date meta line. Avatars use the Image component. Use to surface social proof for dentists, dental offices, orthodontists, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsEyebrow = props.eyebrow ?? 'Patient Stories'
    const testimonialsHeading = props.heading ?? 'What our patients are saying'
    const testimonialsDesc =
      props.description ??
      "Don't just take our word for it — hear from real patients who have transformed their smiles with us."
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I used to be terrified of the dentist, but Dr. Chen and her team completely changed that. The office is so calming, and they explain every step. I actually look forward to my cleanings now!',
            name: 'Jennifer Martinez',
            meta: 'Portland, OR • Patient since 2021',
            avatarAlt:
              'Portrait of Jennifer Martinez, female patient with bright confident smile',
          },
          {
            quote:
              'Got my Invisalign done here with Dr. Torres and the results are incredible! The process was smooth, payments were manageable, and my teeth look amazing. Best decision I made for my confidence.',
            name: 'David Thompson',
            meta: 'Beaverton, OR • Patient since 2022',
            avatarAlt:
              'Portrait of David Thompson, male patient with healthy white smile',
          },
          {
            quote:
              'Dr. Watson is amazing with kids! My 5-year-old was nervous for her first filling, but Dr. Watson made it fun and painless. The whole family comes here now — our 3 kids love the treasure box!',
            name: 'Amanda Foster',
            meta: 'Lake Oswego, OR • Patient since 2020',
            avatarAlt:
              'Portrait of Amanda Foster, mother and patient with warm genuine smile',
          },
          {
            quote:
              'Had a dental implant done by Dr. Park after losing a tooth in a bike accident. The procedure was way easier than I expected, and the new tooth looks completely natural. Highly recommend!',
            name: 'Robert Chen',
            meta: 'Hillsboro, OR • Patient since 2023',
            avatarAlt:
              'Portrait of Robert Chen, active male patient with athletic appearance',
          },
          {
            quote:
              'As someone without dental insurance, the membership plan has been a lifesaver. I get regular cleanings and save money on my fillings. The team never makes me feel judged about my budget.',
            name: 'Sarah Williams',
            meta: 'Portland, OR • Member since 2022',
            avatarAlt:
              'Portrait of Sarah Williams, young professional patient with natural smile',
          },
          {
            quote:
              'Came in for a same-day emergency appointment when I cracked my tooth on a Friday evening. They fit me in within an hour and fixed it that same visit. The care and speed were incredible!',
            name: 'Michael Brooks',
            meta: 'Tigard, OR • Patient since 2024',
            avatarAlt:
              'Portrait of Michael Brooks, professional male patient with grateful expression',
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
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={testimonialsEyebrow}
              title={testimonialsHeading}
              subtitle={testimonialsDesc}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(testimonialItems.length).padStart(2, '0')} / reviews
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {testimonialItems.map((t, i) => {
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
                    'gap-5 rounded-none border-border bg-background p-6 sm:p-7',
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
                  <TestimonialQuote className="text-sm leading-relaxed sm:text-base">
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
