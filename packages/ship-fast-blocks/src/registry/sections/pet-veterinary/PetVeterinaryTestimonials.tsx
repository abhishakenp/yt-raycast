import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

const DEFAULT_REVIEWS: {
  quote: string
  name: string
  role?: string
  company?: string
  rating?: number
}[] = [
  {
    quote:
      "The team treated Biscuit like he was their own. They were so gentle and patient, and they explained everything in a way that put me completely at ease. We won't go anywhere else.",
    name: 'Sarah Bennett',
    role: 'Dog mom',
    company: 'Biscuit',
    rating: 5,
  },
  {
    quote:
      "When Luna got sick late at night, they saw us right away and stayed calm and kind through the whole scary ordeal. I'm so grateful for their compassion and care.",
    name: 'Marcus Lee',
    role: 'Cat dad',
    company: 'Luna',
    rating: 5,
  },
  {
    quote:
      'Friendly faces, a clean clinic, and a vet who clearly adores animals. Daisy actually wags her tail walking in the door now — that says it all!',
    name: 'Priya Sharma',
    role: 'Dog mom',
    company: 'Daisy',
    rating: 5,
  },
]

export const PetVeterinaryTestimonials = defineCapsule({
  name: 'PetVeterinaryTestimonials',
  description:
    "Warm social-proof band for a veterinary clinic site, composing the TestimonialGrid kit composite into a row of heartfelt pet-parent reviews. Each card shows a five-star rating, a caring quote about real experiences, and an avatar with the reviewer's name, role (e.g. 'Dog mom', 'Cat dad'), and their pet's name. Accepts a public `reviews` prop to override the quotes. Use it to build trust and reassure hesitant pet parents before they book a visit.",
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
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by pets and their people'
    const subheading =
      props.subheading ??
      "Real words from the families and furry friends we're proud to care for."
    const reviews = props.reviews?.length ? props.reviews : DEFAULT_REVIEWS

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      company: r.company,
      rating: r.rating ?? 5,
    }))

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={3}
          />
        </div>
      </section>
    )
  },
})
