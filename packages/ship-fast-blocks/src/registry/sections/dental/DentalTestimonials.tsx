import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DentalTestimonials — patient-testimonials grid for a dental practice site. On a
 * soft muted band: a centered eyebrow + heading + lede above a responsive
 * 1-to-3 column grid of card-framed reviews, each with a five-star primary
 * rating row, a quoted testimonial, and a footer pairing a round patient avatar
 * with the patient name and a location / since-date meta line. Avatars use the
 * alt-driven Image component. Use to surface social proof for dentists, dental
 * offices, orthodontists, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
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
    'Patient-testimonials grid for a dental practice site on a soft muted band: a centered eyebrow + heading + lede above a responsive 1-to-3 column grid of card-framed reviews, each with a five-star primary rating row, a quoted testimonial, and a footer pairing a round patient avatar with the patient name and a location / since-date meta line. Avatars use the Image component. Use to surface social proof for dentists, dental offices, orthodontists, or clinics.',
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
    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="mb-3 inline-block text-sm tracking-wider text-primary"
            >
              {testimonialsEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <TestimonialGrid columns={3}>
            {testimonialItems.map((t) => {
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
