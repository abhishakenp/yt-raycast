import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

/**
 * WriterAuthorTestimonials — 3-up critical-praise wall for a literary author
 * page. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered serif heading and subheading above a responsive card grid where each
 * card renders a star row from the rating, a pull-quote blurb, and the critic's
 * name paired with the publication that ran the review. The public `reviews`
 * prop ({quote, name, company, rating}) maps to the composite's items, with the
 * publication shown as the card's meta line via `company`. Use for social-proof
 * and review pull-quotes on novelist, poet, essayist, or memoirist sites.
 * Renders fully with no props via baked critic blurbs from The New York Times,
 * The Guardian, and Booklist.
 */
export const WriterAuthorTestimonials = defineComponent({
  name: "WriterAuthorTestimonials",
  description:
    "3-up critical-praise wall for a literary author page: a centered serif heading and subheading above a responsive card grid. Each card renders a filled star row matching the rating, a pull-quote blurb, and an attribution row pairing the critic's name with the publication that ran the review (The New York Times, The Guardian, Booklist). Use for review pull-quotes and social-proof on novelist, poet, essayist, or memoirist sites.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section subheading shown beneath the heading. */
    subheading: z.string().optional(),
    /** Critic reviews: quote, name, company (publication), rating. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          company: z.string(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Praise"
    const subheading = props.subheading ?? "What critics say"
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Vance writes sentences you want to read aloud. This is a novel of rare grace — patient, luminous, and quietly devastating. A landmark in contemporary fiction.",
            name: "Margaret Holloway",
            company: "The New York Times",
            rating: 5,
          },
          {
            quote:
              "A spellbinding storyteller at the height of her powers. Every chapter turns on a perfectly observed detail, and the ending lingers for days. Unmissable.",
            name: "Daniel Okafor",
            company: "The Guardian",
            rating: 5,
          },
          {
            quote:
              "Richly imagined and beautifully told, Vance's latest confirms her place among the finest novelists working today. Hand this to every reader you know.",
            name: "Susan Whitfield",
            company: "Booklist",
            rating: 5,
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      company: r.company,
      rating: r.rating ?? 5,
    }))

    return (
      <TestimonialGrid
        heading={heading}
        subheading={subheading}
        items={items}
        columns={3}
        className={props.className}
      />
    )
  },
})
