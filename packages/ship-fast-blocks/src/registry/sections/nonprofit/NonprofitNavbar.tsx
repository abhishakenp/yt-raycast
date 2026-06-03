import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NonprofitNavbar — sticky, translucent top navigation bar for a nonprofit /
 * charity / NGO landing page. A backdrop-blurred, border-bottomed header pinned
 * to the top: a layered sprout-glyph logo mark beside the organization name on
 * the left, a horizontal set of nav links plus a pill-shaped primary Donate CTA
 * on the right (desktop), and a hamburger menu button on mobile. Every link and
 * the CTA route through useNavigate so labels can drive page-switching. Use as
 * the sticky site header for nonprofits, charities, NGOs, foundations,
 * humanitarian or community organizations. Renders fully with no props via
 * baked-in "Roots of Hope" defaults.
 */
export const NonprofitNavbar = defineComponent({
  name: "NonprofitNavbar",
  description:
    "Sticky translucent top navigation bar for a nonprofit / charity / NGO landing page: backdrop-blurred, border-bottomed header pinned to the top with a layered sprout-glyph logo mark + organization name on the left, horizontal nav links and a pill-shaped primary Donate CTA on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for nonprofits, charities, NGOs, foundations, humanitarian or community organizations.",
  props: z.object({
    /** Organization / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels shown in the desktop bar. */
    nav: z.array(z.string()).optional(),
    /** Pill-shaped primary Donate CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Roots of Hope"
    const nav = props.nav?.length
      ? props.nav
      : ["Mission", "Impact", "Programs", "Stories"]
    const cta = props.cta ?? "Donate Now"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="group flex items-center gap-2"
            >
              <LogoMark className="size-8 text-foreground/70 transition-colors group-hover:text-foreground" />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {brand}
              </span>
            </button>

            <div className="hidden items-center gap-8 md:flex">
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
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                {cta}
              </button>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 text-muted-foreground hover:text-foreground md:hidden"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
