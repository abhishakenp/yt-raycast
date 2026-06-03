import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NewsCta — "Support Independent Journalism" subscribe call-to-action band for a
 * news / editorial site. On a card surface, a rounded dark inverted panel holds a
 * two-column layout: a heading, supporting description and two buttons (a solid
 * primary subscribe button + a translucent secondary "view plans" button) on the
 * left, and a row of stat tiles (subscribers / journalists / Pulitzer prizes) on
 * the right (desktop only). Both buttons route through useNavigate. Use as the
 * subscription/membership CTA near the bottom of a newspaper, magazine or
 * publication homepage. Renders fully with no props via baked-in defaults.
 */
export const NewsCta = defineComponent({
  name: "NewsCta",
  description:
    "'Support Independent Journalism' subscribe call-to-action band for a news / editorial site: on a card surface a rounded dark inverted panel holds a two-column layout — a heading, description and two buttons (solid primary subscribe + translucent secondary 'view plans') on the left, and a row of stat tiles (subscribers / journalists / Pulitzer prizes) on the right (desktop only). Both buttons route through useNavigate. Use as the subscription/membership CTA near the bottom of a newspaper, magazine or publication homepage.",
  props: z.object({
    /** CTA heading. */
    heading: z.string().optional(),
    /** CTA supporting description. */
    description: z.string().optional(),
    /** Primary button label. */
    primary: z.string().optional(),
    /** Secondary button label. */
    secondary: z.string().optional(),
    /** Stat tiles shown on the right. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Support Independent Journalism"
    const description =
      props.description ??
      "Subscribe today for unlimited access to award-winning reporting, expert analysis, and exclusive features. No paywalls on breaking news—ever."
    const primary = props.primary ?? "Subscribe Now — $1/Week"
    const secondary = props.secondary ?? "View All Plans"
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "2M+", label: "Subscribers" },
          { value: "47", label: "Journalists" },
          { value: "12", label: "Pulitzer Prizes" },
        ]

    return (
      <section className={cn("bg-card py-12 lg:py-16", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-foreground p-8 text-center text-background lg:p-12 lg:text-left">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-background lg:text-3xl">
                  {heading}
                </h2>
                <p className="mt-3 max-w-lg text-background/70">
                  {description}
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(primary)}
                    className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                  >
                    {primary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(secondary)}
                    className="rounded-lg bg-background/10 px-6 py-3 font-medium text-background transition-colors hover:bg-background/20"
                  >
                    {secondary}
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center justify-end gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="min-w-[100px] rounded-lg bg-background/10 p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-background">
                        {s.value}
                      </p>
                      <p className="mt-1 text-xs text-background/70">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
