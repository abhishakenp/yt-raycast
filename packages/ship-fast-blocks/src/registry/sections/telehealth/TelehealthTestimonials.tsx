import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

export const TelehealthTestimonials = defineComponent({
  name: 'TelehealthTestimonials',
  description:
    'Patient reviews band for a telehealth site, built on the shared TestimonialGrid composite. Renders a centered heading and a three-column grid of patient testimonial cards, each with a star rating, a quote, an avatar, and a name with role or context. Cards collapse to two columns and then one column on smaller screens. Use as social proof near the bottom of a telehealth page to reassure prospective patients before they book a visit.',
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

    return (
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={reviews}
            columns={3}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
