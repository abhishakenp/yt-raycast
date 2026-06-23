import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

/**
 * AuthTestimonials — 3-up developer testimonial wall for Authly, a developer
 * authentication product. Thin configuration over the shared `TestimonialGrid`
 * composite: a centered heading ("Developers ship faster with us") above a
 * responsive card grid where each card renders a star row from the rating, the
 * quoted testimonial, and an attribution pairing the engineer's name with their
 * role and company. The public `reviews` prop ({quote, name, role, company,
 * rating}) maps to the composite's items. Use for social proof on an auth
 * platform, identity API, or login SDK. Renders fully with no props.
 */
export const AuthTestimonials = defineComponent({
  name: "AuthTestimonials",
  description:
    "3-up developer testimonial wall for a developer-auth product built on the shared TestimonialGrid composite: a centered heading ('Developers ship faster with us') above a responsive card grid. Each card renders a star row matching the rating, a quoted testimonial, and an attribution pairing the engineer's name with their role and company. Use for social proof on an auth platform, identity API, or login SDK.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Developer reviews: quote, name, role, company, rating. */
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
    const heading = props.heading ?? "Developers ship faster with us"
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "We ripped out 4,000 lines of homegrown auth and replaced it with Authly in a weekend. SSO, MFA, and passkeys just worked. Our team finally stopped firefighting login bugs.",
            name: "Daniela Cruz",
            role: "CTO",
            company: "Fintech startup",
            rating: 5,
          },
          {
            quote:
              "The SDK is genuinely a joy to use — typed end to end, great docs, and sensible defaults. We had protected routes in production the same day we signed up.",
            name: "Marcus Lee",
            role: "Staff Engineer",
            company: "Datapine",
            rating: 5,
          },
          {
            quote:
              "Authly let us pass our SOC 2 audit without building a security team. Adaptive MFA and breached-password detection came out of the box. Worth every penny.",
            name: "Aisha Okoro",
            role: "Founder",
            company: "Loophole",
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      company: r.company,
      rating: r.rating,
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
