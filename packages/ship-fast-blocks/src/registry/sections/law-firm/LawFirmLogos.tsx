import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LawFirmLogos — a quiet "trusted by industry leaders" client logo strip on the
 * card surface, bordered top and bottom. A centered tracked-uppercase heading
 * sits above a faded responsive grid of serif wordmark "logos" that brighten on
 * hover. Restrained, authoritative editorial aesthetic. Each wordmark routes
 * through useNavigate. Use directly under the hero on law-firm, attorney,
 * corporate-counsel, consulting or professional-services pages to establish
 * credibility with recognizable client names. Renders fully with no props via
 * baked-in defaults.
 */
export const LawFirmLogos = defineComponent({
  name: "LawFirmLogos",
  description:
    "Quiet 'trusted by industry leaders' client logo strip on the card surface, bordered top and bottom: a centered tracked-uppercase heading above a faded responsive grid of serif wordmark 'logos' that brighten on hover. Restrained, authoritative editorial aesthetic. Each wordmark routes through useNavigate. Use directly under the hero on law-firm, attorney, corporate-counsel, consulting, accounting or professional-services pages to establish credibility with recognizable client names.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Trusted by Industry Leaders"
    const items = props.items?.length
      ? props.items
      : ["MORGAN", "CITADEL", "VENTURE", "APEX", "MERIDIAN", "CONSOL"]

    return (
      <section
        className={cn(
          "border-y border-border bg-card py-16",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex justify-center font-serif text-lg font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
