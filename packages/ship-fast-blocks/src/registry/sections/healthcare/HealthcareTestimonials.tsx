import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * HealthcareTestimonials — staggered patient-stories grid for a medical-clinic
 * page. An asymmetric header (left-aligned mono eyebrow + heading + lede, mono
 * review-count meta right) above a responsive 1/2/3-column grid of square
 * hairline review cards whose middle column steps down on desktop for a calm
 * stagger. Each card opens with a zero-padded mono index numeral opposite a row
 * of five primary stars, followed by the quote and a hairline-topped footer
 * pairing an alt-driven round avatar with the patient's name and a mono
 * "patient since" meta line. Avatars use the alt-driven Image component. Use for
 * a testimonials / patient-stories / social-proof section of a doctors' office,
 * primary-care, pediatric or telehealth clinic. Renders fully with no props via
 * baked-in patient-testimonial defaults.
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
export const HealthcareTestimonials = defineCapsule({
  name: 'HealthcareTestimonials',
  description:
    "Staggered patient-stories grid for a medical-clinic page: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono review-count meta right) above a responsive 1/2/3-column grid of square hairline review cards whose middle column steps down on desktop. Each card opens with a zero-padded mono index numeral opposite a row of five primary stars, followed by the quote and a hairline-topped footer pairing an alt-driven round avatar with the patient's name and a mono 'patient since' meta line. Avatars use the Image component. Use for a testimonials / patient-stories / social-proof section of a doctors' office, primary-care, pediatric or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonials: quote, name, meta line, and avatar alt. */
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
    const eyebrow = props.eyebrow ?? 'Patient Reviews'
    const heading = props.heading ?? 'What our patients say'
    const description =
      props.description ??
      'Real stories from real patients who trust us with their care.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Dr. Chen took the time to actually listen to my concerns. She explained my blood work in detail and created a plan that fit my lifestyle. First doctor I've had in years who truly cares.",
            name: 'David Richardson',
            meta: 'Patient since 2021',
            avatarAlt: 'Portrait of patient David Richardson',
          },
          {
            quote:
              'The virtual visit option is a game-changer. I was able to get my prescription refill during my lunch break without driving across the city. The video quality and connection were perfect.',
            name: 'Jennifer Walsh',
            meta: 'Patient since 2019',
            avatarAlt: 'Portrait of patient Jennifer Walsh',
          },
          {
            quote:
              'As a new mom, I was anxious about finding the right pediatrician. Dr. Torres made us feel so comfortable. He answers all our questions patiently and my daughter actually looks forward to checkups!',
            name: 'Amanda Foster',
            meta: 'Patient since 2022',
            avatarAlt: 'Portrait of patient Amanda Foster',
          },
          {
            quote:
              'Finally a clinic with transparent pricing! I knew exactly what my visit would cost before I even walked in. No surprise bills months later. The online booking is seamless too.',
            name: 'Robert Kim',
            meta: 'Patient since 2020',
            avatarAlt: 'Portrait of patient Robert Kim',
          },
          {
            quote:
              "Dr. Patel is incredible. She made me feel so comfortable during my well-woman exam and addressed concerns I didn't even know I had. The staff is warm and the office is beautiful.",
            name: 'Lisa Thompson',
            meta: 'Patient since 2023',
            avatarAlt: 'Portrait of patient Lisa Thompson',
          },
          {
            quote:
              'I brought my elderly father here after his previous doctor retired. Dr. Mitchell was patient and thorough, explaining everything in terms we both understood. The whole family now comes here.',
            name: 'Marcus Johnson',
            meta: 'Patient since 2022',
            avatarAlt: 'Portrait of patient Marcus Johnson',
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
        className={cn('bg-muted/40 py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              titleId="testimonials-heading"
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
              {String(items.length).padStart(2, '0')} / reviews
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
