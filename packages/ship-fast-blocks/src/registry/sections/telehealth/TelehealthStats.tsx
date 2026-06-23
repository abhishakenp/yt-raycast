import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"
import { StatGrid } from "#/section-kit/StatGrid.tsx"

export const TelehealthStats = defineComponent({
  name: "TelehealthStats",
  description:
    "Trust-building statistics band for a telehealth site. Wraps the shared StatGrid composite in a section with an optional centered SectionHeading and surfaces four key proof points — patients treated, average wait time, satisfaction rating, and number of providers — as bold value-over-label cells in a four-column grid that collapses gracefully on small screens. Use to back up marketing claims with concrete numbers and reinforce confidence before a visitor books.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Trusted by patients nationwide"
    const subheading =
      props.subheading ??
      "Real outcomes from the people who count on us for everyday care."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "2M+", label: "Patients treated" },
          { value: "< 10 min", label: "Average wait time" },
          { value: "4.9/5", label: "Patient satisfaction" },
          { value: "1,200+", label: "Board-certified providers" },
        ]

    return (
      <section className={cn("bg-background py-20 sm:py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {heading ? (
            <SectionHeading title={heading} subtitle={subheading} className="mb-14" />
          ) : null}
          <StatGrid stats={stats} columns={4} />
        </div>
      </section>
    )
  },
})
