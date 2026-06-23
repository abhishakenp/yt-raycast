import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { StatGrid } from "#/section-kit/StatGrid.tsx"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"
import { cn } from "#/lib/utils.ts"

export const TravelAgencyStats = defineComponent({
  name: "TravelAgencyStats",
  description:
    "Credibility stats band for the Travel Agency page family. Pairs a SectionHeading with the shared StatGrid kit composite to present four trust-building metrics — destinations served, travelers booked, years in business, and average rating. Use to reinforce why travelers choose the agency. All values are prop-driven with premium defaults so it renders with no props.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Why travelers choose us"
    const subheading =
      props.subheading ??
      "Nearly two decades of crafting seamless, unforgettable journeys across the globe."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "120+", label: "Destinations" },
          { value: "85k+", label: "Happy travelers" },
          { value: "18", label: "Years of journeys" },
          { value: "4.9★", label: "Average rating" },
        ]
    return (
      <section className={cn("flex flex-col gap-10", props.className)}>
        <SectionHeading title={heading} subtitle={subheading} />
        <StatGrid stats={stats} columns={4} />
      </section>
    )
  },
})
