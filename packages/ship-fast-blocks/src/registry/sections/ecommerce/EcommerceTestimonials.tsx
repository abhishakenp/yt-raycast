import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * EcommerceTestimonials — light customer reviews grid for a general online
 * store. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered heading (with optional subheading) above a responsive 1-to-3 column
 * grid of review cards. Each card shows a star rating row driven by the review's
 * numeric 1-5 rating, a customer quote, and an avatar footer with the customer
 * name and a "Verified Buyer" tag. Use to build trust with social proof for any
 * retail storefront, ecommerce shop, or product landing page. Renders fully
 * with no props via baked-in defaults.
 */
export const EcommerceTestimonials = defineCapsule({
  name: 'EcommerceTestimonials',
  description:
    "Light customer reviews grid for a general online store built on the shared TestimonialGrid composite: a centered heading (with optional subheading) above a responsive 1-to-3 column grid of review cards. Each card shows a star rating row driven by the review's numeric 1-5 rating, a customer quote, and an avatar footer with the customer name and a 'Verified Buyer' tag. Use to build trust with social proof for any retail storefront, ecommerce shop, or product landing page when showcasing customer reviews and ratings.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What Our Customers Say'
    const subheading =
      props.subheading ??
      'Thousands of happy shoppers trust us for quality products, fast shipping, and hassle-free returns.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Ordered on a Monday and it arrived two days later, perfectly packaged. The product quality far exceeded what I expected for the price. I'll definitely be shopping here again.",
            name: 'Maya Thompson',
            rating: 5,
            avatarAlt:
              'Smiling headshot of Maya Thompson, a happy online shopper',
          },
          {
            quote:
              'I had to exchange a size and the returns process was completely painless — free label, refund in a day. Customer support actually answered within minutes.',
            name: 'Daniel Rivera',
            rating: 5,
            avatarAlt:
              'Friendly headshot of Daniel Rivera, a satisfied store customer',
          },
          {
            quote:
              'Great selection and the build quality is solid. Took off one star only because shipping was a day later than estimated, but everything else was excellent.',
            name: 'Priya Nair',
            rating: 4,
            avatarAlt:
              'Warm headshot of Priya Nair, a returning online store buyer',
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={subheading}
        items={reviews.map((r) => ({
          quote: r.quote,
          name: r.name,
          rating: r.rating,
          role: 'Verified Buyer',
          avatarAlt: r.avatarAlt,
        }))}
        className={props.className}
      />
    )
  },
})
