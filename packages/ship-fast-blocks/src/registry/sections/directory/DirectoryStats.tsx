import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * DirectoryStats — compact 4-up statistics band for a local-business directory.
 * A muted, border-topped-and-bottomed strip with a centered responsive grid of
 * big-number metrics (value + label) — typically businesses listed, verified
 * reviews, cities covered, and average rating. Static, no links. Use directly
 * beneath the hero of local directories, listing marketplaces, or
 * review-and-discovery sites to convey scale and trust.
 */
export const DirectoryStats = defineComponent({
  name: "DirectoryStats",
  description:
    "Compact 4-up statistics band for a local-business DIRECTORY: a muted, border-topped-and-bottomed strip with a centered responsive grid of big-number metrics (value plus label) — typically businesses listed, verified reviews, cities covered, and average rating. Static, no links. Use directly beneath the hero of local directories, listing marketplaces, find-a-service platforms, or review-and-discovery sites to convey scale and trust.",
  props: z.object({
    /** Stat tiles (big value + label). */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "12,450+", label: "Local Businesses" },
          { value: "48,200+", label: "Verified Reviews" },
          { value: "156", label: "Cities Covered" },
          { value: "4.8", label: "Average Rating" },
        ]

    return (
      <section
        className={cn("border-y border-border bg-muted py-12", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-semibold text-foreground sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
