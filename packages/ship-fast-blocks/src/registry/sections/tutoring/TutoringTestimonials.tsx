import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { TestimonialGrid } from "#/section-kit/TestimonialGrid.tsx"

const DEFAULT_REVIEWS: {
  quote: string
  name: string
  role?: string
  rating?: number
}[] = [
  {
    quote:
      "My daughter went from dreading math to actually looking forward to her sessions. Her tutor is so patient and kind — her grade jumped a full letter in one term.",
    name: "Maria Alvarez",
    role: "Parent of 10th grader",
    rating: 5,
  },
  {
    quote:
      "I was nervous about the SAT, but my tutor broke everything down and made practice feel doable. My score went up 180 points and I got into my first-choice school.",
    name: "Devon Carter",
    role: "Student, Grade 11",
    rating: 5,
  },
  {
    quote:
      "Booking was easy, the tutor was background-checked, and we got a friendly summary after every session. It's the first thing that's actually worked for my son.",
    name: "James Whitfield",
    role: "Parent",
    rating: 5,
  },
]

export const TutoringTestimonials = defineComponent({
  name: "TutoringTestimonials",
  description:
    "Social-proof band for tutoring sites, composing the TestimonialGrid kit composite into a row of warm parent and student testimonials. Each card shows a five-star rating, a heartfelt quote about real progress, and an avatar with the reviewer's name and role (e.g. 'Parent of 10th grader', 'Student, Grade 11'). Accepts a public `reviews` prop to override the quotes. Use it to build trust and reassure hesitant families before they book.",
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
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Families love learning with us"
    const subheading =
      props.subheading ?? "Real words from the parents and students we've helped grow."
    const reviews = props.reviews?.length ? props.reviews : DEFAULT_REVIEWS

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      rating: r.rating ?? 5,
    }))

    return (
      <section className={"bg-muted/30 py-20 sm:py-24" + (props.className ? " " + props.className : "")}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={props.columns ?? 3}
          />
        </div>
      </section>
    )
  },
})
