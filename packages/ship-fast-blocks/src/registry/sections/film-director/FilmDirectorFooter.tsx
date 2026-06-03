import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FilmDirectorFooter — a slim, inverted footer for a film director or
 * cinematographer portfolio. A dark foreground band with muted text: a single
 * row (stacking on mobile) pairing a dynamic-year copyright line (brand + note)
 * on the left with a small set of inline text links on the right that brighten
 * on hover. Links route through useNavigate. Use as the closing site footer for
 * filmmakers, directors, DPs, or production houses.
 */
export const FilmDirectorFooter = defineComponent({
  name: "FilmDirectorFooter",
  description:
    "Slim, inverted footer for a film director or cinematographer portfolio: a dark foreground band with muted text holding a single row (stacking on mobile) that pairs a dynamic-year copyright line (brand + note) on the left with a small set of inline text links on the right that brighten on hover. Links route through useNavigate. Use as the closing site footer for filmmakers, directors, DPs, or production houses.",
  props: z.object({
    /** Director / studio name shown in the copyright line. */
    brand: z.string().optional(),
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Marcus Chen"
    const footerNote = props.note ?? "All rights reserved."
    const footerLinks = props.links?.length
      ? props.links
      : ["Privacy", "Terms", "Credits"]

    return (
      <footer
        className={cn(
          "bg-foreground py-8 text-background/70",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm">
              © {new Date().getFullYear()} {brand}. {footerNote}
            </p>
            <div className="flex gap-6 text-sm">
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
