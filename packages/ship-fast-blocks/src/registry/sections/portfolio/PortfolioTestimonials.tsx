import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

/**
 * PortfolioTestimonials — client-review wall for a creative-individual
 * portfolio. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered heading above a responsive card grid where each card renders a star
 * row from the rating, the quoted testimonial, and a client name paired with
 * their role and company. The public `reviews` prop ({quote, name, role,
 * company, rating}) maps to the composite's items. Use for social proof on a
 * designer, motion artist, or director personal site. Renders fully with no
 * props via baked-in defaults.
 */
export const PortfolioTestimonials = defineComponent({
  name: "PortfolioTestimonials",
  description:
    "Client-review wall for a creative-individual portfolio built on the shared TestimonialGrid composite: a centered heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the client name with their role and company. Use for social proof from collaborators and clients on a designer, motion artist, or director personal site.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Client reviews: quote, name, role, company, rating. */
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
    const heading = props.heading ?? "What clients say"
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Kaelen took a half-formed brief and turned it into the most striking launch film we've ever shipped. The craft is obsessive in the best way.",
            name: "Dana Whitfield",
            role: "Creative Director",
            company: "Helios Studio",
            rating: 5,
          },
          {
            quote:
              "Reliable, fast, and genuinely inventive. The 3D work elevated our entire keynote and the feedback from the room was immediate.",
            name: "Marcus Lim",
            role: "Head of Brand",
            company: "Northwind",
            rating: 5,
          },
          {
            quote:
              "A rare mix of art-direction instinct and technical depth. We brief once and trust the result — that's worth everything on a tight timeline.",
            name: "Priya Anand",
            role: "Executive Producer",
            company: "Field & Frame",
            rating: 5,
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        items={reviews.map((r) => ({
          quote: r.quote,
          name: r.name,
          role: r.role,
          company: r.company,
          rating: r.rating,
        }))}
        className={props.className}
      />
    )
  },
})
