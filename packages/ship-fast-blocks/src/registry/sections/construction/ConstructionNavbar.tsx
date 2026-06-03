import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ConstructionNavbar — sticky top navigation bar for a construction / general
 * contractor site. A backdrop-blurred, border-bottomed header pinned to the
 * top of the viewport with a hard-hat logo tile + brand name on the left,
 * horizontal nav links in the center, and a phone link plus a "Get a Quote"
 * CTA on the right (desktop). Every link and CTA routes through
 * useNavigate so labels can drive page-switching. Use as the sticky site
 * header for construction companies, general contractors, builders, or
 * trades businesses. Renders fully with no props via baked-in defaults.
 */
export const ConstructionNavbar = defineComponent({
  name: "ConstructionNavbar",
  description:
    "Sticky top navigation bar for a construction / general contractor site: backdrop-blurred, border-bottomed header with a hard-hat logo tile + brand name on the left, horizontal nav links in the center, and a phone link plus a 'Get a Quote' CTA on the right (desktop). Links and CTA route through useNavigate for page-switching. Use as the sticky site header for construction firms, contractors, builders, or trades businesses.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; first item drives the logo-home target. */
    nav: z.array(z.string()).optional(),
    /** Phone number shown in the navbar (also navigates on click). */
    phone: z.string().optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "BuiltRight"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Projects", "Process", "Pricing", "Reviews", "FAQ"]
    const phone = props.phone ?? "(206) 555-1234"
    const ctaLabel = props.ctaLabel ?? "Get a Quote"

    const LogoMark = ({
      className,
      tone = "primary",
    }: {
      className?: string
      tone?: "primary" | "foreground"
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-md",
          tone === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
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
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" tone="foreground" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
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
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(phone)}
                className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </button>
              <button
                type="button"
                onClick={() => go(ctaLabel)}
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
