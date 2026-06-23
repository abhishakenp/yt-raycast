import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

/**
 * RealEstateTestimonials — client-review wall for a brokerage. A centered serif
 * header sits above a responsive 1/2/3-column grid of review cards; each card
 * shows a token-toned star rating row, the quote, and an attribution with an
 * initial avatar chip. Defaults cover three buyer/seller stories. Use to build
 * social proof on a real-estate brokerage or agent site. Renders fully with no
 * props via baked-in defaults.
 */
export const RealEstateTestimonials = defineComponent({
  name: "RealEstateTestimonials",
  description:
    "Client-review wall for a brokerage: a centered serif header above a responsive 1/2/3-column grid of review cards, each with a token-toned star rating row, a quote, and an attribution with an initial avatar chip. Defaults cover three buyer/seller stories. Use to build social proof on a real-estate brokerage or agent site.",
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Review cards (rating is 1–5). */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Loved by buyers and sellers"
    const description =
      props.description ??
      "The relationships outlast the closing. Here's what working with our team feels like."
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "They found us a home in a neighborhood we didn't even know to look in — and it was perfect. Negotiated below asking, too.",
            name: "Dana & Marcus Hill",
            rating: 5,
          },
          {
            quote:
              "Sold in nine days, over asking. The staging advice and pricing strategy made all the difference.",
            name: "Priya Raman",
            rating: 5,
          },
          {
            quote:
              "First-time buyers and totally overwhelmed. Our agent explained every step and never once made us feel rushed.",
            name: "Jordan Webb",
            rating: 5,
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={description}
        items={reviews.map((review) => ({
          quote: review.quote,
          name: review.name,
          rating: review.rating,
        }))}
        columns={3}
        className={props.className}
      />
    )
  },
})
