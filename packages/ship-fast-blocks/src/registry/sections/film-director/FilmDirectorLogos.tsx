import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * FilmDirectorLogos — a minimal "trusted by" brand-logo strip for a film
 * director / cinematographer portfolio. A bordered (top + bottom) band with a
 * small centered muted caption above a responsive 2/4/6-column grid of slightly
 * dimmed wordmark-style brand names rendered as bold tracked text. Use as a
 * social-proof / client-roster band beneath the hero for filmmakers, directors,
 * cinematographers, DPs, or production houses.
 */
export const FilmDirectorLogos = defineComponent({
  name: "FilmDirectorLogos",
  description:
    "Minimal 'trusted by' brand-logo strip for a film director / cinematographer portfolio: a bordered (top + bottom) band with a small centered muted caption above a responsive 2/4/6-column grid of slightly dimmed wordmark-style brand names rendered as bold tracked text. Use as a social-proof / client-roster band beneath the hero for filmmakers, directors, cinematographers, DPs, or production houses.",
  props: z.object({
    label: z.string().optional(),
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel =
      props.label ?? "Trusted by leading brands and agencies"
    const logoBrands = props.brands?.length
      ? props.brands
      : ["NIKE", "APPLE", "SONY", "NETFLIX", "SPOTIFY", "ADOBE"]

    return (
      <section
        className={cn("border-y border-border py-16 md:py-24", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-12 text-center text-sm text-muted-foreground">
            {logosLabel}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
            {logoBrands.map((b) => (
              <div key={b} className="flex justify-center">
                <span className="text-base font-semibold tracking-tight text-foreground">
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
