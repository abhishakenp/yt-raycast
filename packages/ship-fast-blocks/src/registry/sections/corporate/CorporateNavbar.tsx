import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CorporateNavbar — sticky translucent top navigation bar for an enterprise /
 * corporate B2B marketing site. A backdrop-blurred, border-bottomed header pinned
 * to the top with a solid brand-initial logo tile + company name on the left,
 * horizontal nav links on the right (desktop), a secondary text link plus a
 * filled primary "Request Demo" CTA, and a hamburger menu button on mobile.
 * Every link and CTA routes through useNavigate. Use as the sticky site header
 * for enterprise software vendors, SaaS platforms, IT consultancies, or any
 * corporate site that needs gravitas and clear conversion paths.
 */
export const CorporateNavbar = defineComponent({
  name: "CorporateNavbar",
  description:
    "Sticky translucent top navigation bar for an enterprise / corporate B2B site: backdrop-blurred, border-bottomed header with a solid brand-initial logo tile + company name on the left, horizontal nav links and a secondary text link plus a filled primary CTA on the right (desktop), and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for enterprise software, SaaS, IT consultancies, or any corporate site.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Label shown on the primary filled CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button (go(label)). */
    ctaTarget: z.string().optional(),
    /** Label + target for the secondary text link beside the CTA. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nexus"
    const nav = props.nav?.length
      ? props.nav
      : ["Solutions", "Customers", "Pricing", "Investors", "Company"]
    const ctaLabel = props.ctaLabel ?? "Request Demo"
    const ctaTarget = props.ctaTarget ?? "Schedule a Demo"
    const secondaryCta = props.secondaryCta ?? "Explore Solutions"

    const LogoMark = ({
      className,
      inverse,
    }: {
      className?: string
      inverse?: boolean
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg font-bold",
          inverse
            ? "bg-background text-foreground"
            : "bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
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
          aria-label="Main navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-sm" />
              <span className="text-lg font-semibold tracking-tight">
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
                onClick={() => go(secondaryCta)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                {secondaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
