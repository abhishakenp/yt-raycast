import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * InteriorDesignNavbar — fixed, translucent top navigation bar for an upscale
 * interior-design / architecture studio site. A backdrop-blurred, border-
 * bottomed header pinned to the top: a light-weight two-tone wordmark (bold mark
 * + faded suffix) on the left, a horizontal set of nav links in the center, and
 * an outlined square primary CTA on the right (desktop), with a hamburger menu
 * button on mobile. Every link and the CTA route through useNavigate so labels
 * can drive page-switching. Editorial, refined, gallery-like. Use as the sticky
 * site header for interior designers, design studios, architecture firms, home
 * staging or renovation businesses. Renders fully with no props via baked-in
 * "Atelier Studio" defaults.
 */
export const InteriorDesignNavbar = defineComponent({
  name: "InteriorDesignNavbar",
  description:
    "Fixed translucent top navigation bar for an upscale interior-design / architecture studio site: backdrop-blurred, border-bottomed header pinned to the top with a light-weight two-tone wordmark (bold mark + faded suffix) on the left, horizontal nav links in the center, and an outlined square primary CTA on the right (desktop), plus a hamburger menu on mobile. Links and CTA route through useNavigate for page-switching. Editorial, refined and gallery-like. Use as the sticky site header for interior designers, design studios, architecture firms, home staging or renovation businesses.",
  props: z.object({
    /** Brand / studio name; split into bold mark + faded suffix on a space. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Outlined square primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA (defaults to the last nav item / "Contact"). */
    contactTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Atelier Studio"
    const nav = props.nav?.length
      ? props.nav
      : ["Projects", "Services", "Process", "About", "Contact"]
    const cta = props.cta ?? "Book Consultation"
    const contactTarget = props.contactTarget ?? nav[nav.length - 1] ?? "Contact"

    const brandParts = brand.split(" ")
    const brandMark = brandParts[0]
    const brandSuffix = brandParts.slice(1).join(" ")

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-2xl font-light tracking-tight"
            >
              <span className="text-foreground">{brandMark}</span>
              {brandSuffix && (
                <span className="text-muted-foreground">{brandSuffix}</span>
              )}
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => go(contactTarget)}
              className="hidden items-center border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-flex"
            >
              {cta}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
