import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * HealthcareTestimonials — patient-review grid for a medical-clinic page. A
 * centered eyebrow chip, heading and intro above a responsive 1/2/3-column grid
 * of bordered quote cards; each card shows a row of five accent-colored stars,
 * the quote in curly quotes, and a footer pairing an alt-driven circular avatar
 * with the patient's name and a "patient since" meta line. Use for a
 * testimonials / patient-stories / social-proof section of a doctors' office,
 * primary-care, pediatric or telehealth clinic. Renders fully with no props via
 * baked-in patient-testimonial defaults.
 */
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
export const HealthcareTestimonials = defineCapsule({
  name: 'HealthcareTestimonials',
  description:
    "Patient-review grid for a medical-clinic page: a centered eyebrow chip, heading and intro above a responsive 1/2/3-column grid of bordered quote cards, each showing a row of five accent-colored stars, the quote in curly quotes, and a footer pairing an alt-driven circular avatar with the patient's name and a 'patient since' meta line. Use for a testimonials / patient-stories / social-proof section of a doctors' office, primary-care, pediatric or telehealth clinic.",
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
    return (
      <section
        className={cn('bg-muted py-20 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="testimonials-heading"
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <TestimonialGrid columns={3}>
            {items.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
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
