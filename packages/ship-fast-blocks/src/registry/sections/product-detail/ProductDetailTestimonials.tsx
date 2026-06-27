import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

export const ProductDetailTestimonials = defineCapsule({
  name: 'ProductDetailTestimonials',
  description:
    'Social-proof testimonials band for the Product Detail page family, tuned for the premium Aurora Pro Headphones story. Wraps the shared TestimonialGrid composite to render verified-buyer reviews with per-card star ratings, quotes covering sound, comfort, battery, and active noise cancellation, plus avatar footers. A public `reviews` prop maps cleanly onto grid items so prompts can supply their own quotes, names, roles, and ratings, while sensible Aurora-branded defaults keep the section polished out of the box. Use when composing a single-product detail page or adding a focused proof band to a larger generated site.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by listeners'
    const subheading =
      props.subheading ??
      "Thousands of Aurora owners agree — once you hear it, there's no going back."
    const columns = props.columns ?? 3
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'The soundstage on the Aurora Pro is unreal — instruments have room to breathe and the bass stays tight without ever muddying the vocals.',
            name: 'Maya Chen',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Maya Chen',
          },
          {
            quote:
              "I wear these for eight-hour studio sessions and forget they're on. The cushions are plush and they never clamp or get hot.",
            name: 'Daniel Okafor',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Daniel Okafor',
          },
          {
            quote:
              'Battery life is the real headline — I charged them once and got through a full week of commutes before they asked for more.',
            name: 'Priya Nair',
            role: 'Verified Buyer',
            rating: 5,
            avatarAlt: 'Portrait of Priya Nair',
          },
          {
            quote:
              'The active noise cancellation makes open-plan offices and long flights completely silent. Only wish the case were a touch smaller.',
            name: 'Lukas Weber',
            role: 'Verified Buyer',
            rating: 4,
            avatarAlt: 'Portrait of Lukas Weber',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role ?? 'Verified Buyer',
      rating: r.rating ?? 5,
      avatarAlt: r.avatarAlt,
    }))

    return (
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={columns}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
