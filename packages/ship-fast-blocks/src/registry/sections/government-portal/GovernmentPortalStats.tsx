import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { StatGrid } from "#/section-kit/StatGrid.tsx"

/**
 * GovernmentPortalStats — classic Indian-government / public-sector (PSU)
 * key-figures stat strip: a formal "at a glance" band on a royal-blue strip
 * (#3346B5) presenting official institutional statistics (installed capacity
 * MW, generating units, years operational, % plant availability) for civic,
 * municipal, utility, power and electricity-board portals that publish tenders
 * and notices. Use for the at-a-glance metrics strip of a classic government
 * portal.
 */
export const GovernmentPortalStats = defineComponent({
  name: "GovernmentPortalStats",
  description:
    "Formal classic indian government / PSU key-figures band on a royal-blue strip (installed capacity MW, generating units, years operational, % plant availability). Official, institutional statistics for public sector, civic, municipal, utility, power and electricity board portals that publish tenders and notices. Use for the at-a-glance metrics strip of a classic government portal.",
  props: z.object({
    /** Strip heading; render only when non-empty. */
    heading: z.string().optional(),
    /** Key figures shown across the strip. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "TVNL at a Glance"
    const rawStats = props.stats?.length
      ? props.stats
      : [
          { value: "420 MW", label: "Installed Capacity" },
          { value: "4", label: "Generating Units" },
          { value: "30+", label: "Years Operational" },
          { value: "85%", label: "Plant Availability" },
        ]
    const stats = rawStats.map((s) => ({
      value: String(s.value ?? ""),
      label: String(s.label ?? ""),
    }))

    return (
      <section
        className={cn("w-full bg-[#3346B5] text-white", props.className)}
        style={{
          fontFamily: '"Alegreya Sans","Open Sans",system-ui,sans-serif',
        }}
      >
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          {heading ? (
            <h2 className="mb-6 text-center text-[20px] font-semibold tracking-wide">
              {heading}
            </h2>
          ) : null}
          <StatGrid stats={stats} columns={4} />
        </div>
      </section>
    )
  },
})
