import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

/**
 * MarketplaceTestimonials — 3-up review wall for a multi-vendor marketplace /
 * e-commerce page. Thin configuration over the shared `TestimonialGrid`
 * composite: a centered heading above a responsive card grid where each card
 * renders a star row from the rating, the quoted testimonial, and a name paired
 * with the reviewer role (Verified Buyer, Seller since 2021, …). The public
 * `reviews` prop ({quote, name, rating, role}) maps to the composite's items,
 * with `role` shown as the card's meta line. Use for social proof on online
 * marketplaces, multi-vendor or maker/artisan platforms, and retail
 * aggregators. Renders fully with no props via baked-in defaults.
 */
export const MarketplaceTestimonials = defineComponent({
  name: "MarketplaceTestimonials",
  description:
    "3-up review wall for a multi-vendor marketplace / e-commerce page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the reviewer name with their role (Verified Buyer, Seller since 2021, …). The public reviews prop maps to the composite's items. Use for social proof on online marketplaces, multi-vendor or maker/artisan platforms, and retail aggregators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Buyer / seller reviews: quote, name, rating, role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Loved by buyers and sellers"
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "I've furnished half my apartment through MarketHub. Every order arrived fast, beautifully packed, and exactly as pictured. Buyer protection made the one return effortless.",
            name: "Hannah Cole",
            rating: 5,
            role: "Verified Buyer",
          },
          {
            quote:
              "Opening a storefront took an afternoon and I made my first sale that same week. The seller tools and built-in payouts let me focus on making, not admin.",
            name: "Diego Marín",
            rating: 5,
            role: "Seller since 2021",
          },
          {
            quote:
              "The quality of independent makers here is unreal. I found a ceramicist whose work I now gift to everyone. Reviews and ratings make it easy to shop with confidence.",
            name: "Aisha Rahman",
            rating: 4,
            role: "Verified Buyer",
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      role: r.role,
    }))

    return (
      <TestimonialGrid
        heading={heading}
        items={items}
        className={props.className}
      />
    )
  },
})
