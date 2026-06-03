import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DatingAppLogos — a low-contrast "Featured in" press-logo strip for a dating /
 * matchmaking landing page. A subtle muted band bordered top and bottom: a small
 * uppercase tracked label centered above a responsive grid of dimmed press logos,
 * each rendered as a generic circular glyph beside a bold name and routed through
 * useNavigate. Use directly below the hero as social-proof / credibility for dating
 * apps, singles platforms, or any consumer product citing press mentions. Renders
 * fully with no props via baked-in press defaults.
 */
export const DatingAppLogos = defineComponent({
  name: "DatingAppLogos",
  description:
    "Low-contrast 'Featured in' press-logo strip for a dating / matchmaking landing page: a subtle muted band bordered top and bottom with a small uppercase tracked label centered above a responsive grid of dimmed press logos, each a generic circular glyph beside a bold name, routed through useNavigate. Use directly below the hero as social-proof / credibility for dating apps, singles platforms, or any consumer product citing press mentions.",
  props: z.object({
    /** Small uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Press / publication names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosLabel = props.label ?? "Featured in"
    const logoNames = props.names?.length
      ? props.names
      : ["TechCrunch", "Forbes", "Wired", "The Verge", "Bloomberg", "Cosmopolitan"]

    return (
      <section
        className={cn("border-y border-border bg-muted/50 py-12", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {logosLabel}
          </p>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {logoNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="flex items-center gap-2 text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span className="font-bold">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
