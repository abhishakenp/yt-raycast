import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LandscapingFooter — a slim, calm closing footer for a landscaping / outdoor-
 * design company on the card surface. A bordered-top band: a left brand column
 * (layered-diamond mark + wordmark above a short tagline) sits beside a wrapping
 * row of footer links; a bordered sub-bar below carries an auto-updating
 * copyright line. Stacks centered on mobile, spreads on desktop. The brand button
 * and every link route through useNavigate. Calm, organic and premium with a
 * sage-green accent. Use as the closing site footer for landscapers, lawn-care
 * services, garden designers, hardscaping contractors or grounds-keeping
 * companies. Renders fully with no props via baked-in "Earth & Edge" defaults.
 */
export const LandscapingFooter = defineComponent({
  name: "LandscapingFooter",
  description:
    "Slim, calm closing footer for a landscaping / outdoor-design company on the card surface: a bordered-top band with a left brand column (layered-diamond mark + wordmark above a short tagline) beside a wrapping row of footer links, and a bordered sub-bar below carrying an auto-updating copyright line. Stacks centered on mobile, spreads on desktop; the brand button and every link route through useNavigate. Calm, organic and premium with a sage-green accent. Use as the closing site footer for landscapers, lawn-care services, garden designers, hardscaping contractors or grounds-keeping companies.",
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Earth & Edge"
    const tagline =
      props.tagline ??
      "Premium outdoor design, installation, and maintenance for Portland homes and businesses."
    const note = props.note ?? "All rights reserved."
    const links = props.links?.length
      ? props.links
      : ["Privacy", "Terms", "Careers"]
    const homeTarget = props.homeTarget ?? "Services"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("text-primary", className)}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <footer
        className={cn("border-t border-border bg-card py-12", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="max-w-sm text-center md:text-left">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-3 flex items-center justify-center gap-2 md:justify-start"
              >
                <LogoMark className="size-7" />
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brand}. {note}
          </div>
        </div>
      </footer>
    )
  },
})
