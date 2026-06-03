import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * PortfolioNavbar — fixed, blur-backdrop top navigation for a dark, cinematic
 * creative-individual portfolio. A border-bottomed header pinned to the top over
 * a translucent near-black surface: a bold wordmark on the left (brand first name
 * + a cyan accent dot), a horizontal set of nav links in the center (desktop
 * only), and a pill-shaped primary CTA on the right. Every link and the CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for a 3D artist, motion designer, CGI/VFX, art director, animator, or
 * visual designer personal site. Renders fully with no props via baked-in
 * "Kaelen Vance" defaults.
 */
export const PortfolioNavbar = defineComponent({
  name: "PortfolioNavbar",
  description:
    "Fixed blur-backdrop top navigation bar for a dark, cinematic creative-individual portfolio: a border-bottomed header pinned to the top over a translucent near-black surface, with a bold wordmark on the left (brand first name + a cyan accent dot), horizontal nav links in the center on desktop, and a pill-shaped primary CTA on the right. Links and the CTA route through useNavigate for page-switching. Use as the sticky site header for a 3D artist, motion designer, CGI/VFX, art director, animator, or visual designer personal site.",
  props: z.object({
    /** Brand / person name; the first word + a cyan dot form the wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match the site's route labels). */
    nav: z.array(z.string()).optional(),
    /** Navbar CTA button label. */
    navCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Kaelen Vance"
    const brandShort = brand.split(/\s+/)[0] || brand
    const nav = props.nav?.length ? props.nav : ["Work", "About", "Services", "Contact"]
    const navCta = props.navCta ?? "Let's Talk"

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl",
          props.className,
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
          <button
            type="button"
            onClick={() => go(nav[0])}
            aria-label={`${brand} home`}
            className="text-xl font-bold tracking-tight"
          >
            {brandShort}
            <span className="text-primary">.</span>
          </button>
          <ul className="hidden items-center gap-9 md:flex">
            {nav.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(navCta)}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {navCta}
          </button>
        </div>
      </header>
    )
  },
})
