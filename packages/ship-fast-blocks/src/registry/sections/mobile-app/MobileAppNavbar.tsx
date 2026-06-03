import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MobileAppNavbar — a fixed, backdrop-blurred top navigation bar for a clean,
 * minimalist mobile-app / consumer-product marketing site. A bordered-bottom
 * header pinned to the top: a decorative check-in-circle logo mark + app name on
 * the left, a horizontal set of nav links in the center, and a primary pill CTA
 * button (e.g. "Download App") plus a mobile hamburger on the right. The brand
 * button, links and CTA all route through useNavigate for page-switching. Use as
 * the sticky site header for a habit tracker, fitness / wellness / meditation
 * app, productivity or to-do app, or any App-Store-distributed consumer product.
 * Renders fully with no props via baked-in "DailyFlow" defaults.
 */
export const MobileAppNavbar = defineComponent({
  name: "MobileAppNavbar",
  description:
    "Fixed, backdrop-blurred top navigation bar for a clean, minimalist mobile-app / consumer-product marketing site: a bordered-bottom header pinned to the top with a check-in-circle logo mark + app name on the left, horizontal nav links in the center, and a primary pill CTA button (e.g. 'Download App') plus a mobile hamburger on the right. The brand button, links and CTA route through useNavigate for page-switching. Use as the sticky site header for a habit tracker, fitness / wellness / meditation app, productivity or to-do app, or any App-Store-distributed consumer product landing page.",
  props: z.object({
    /** Brand / app name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Center nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary pill CTA button label on the right. */
    ctaLabel: z.string().optional(),
    /** Route the brand/logo + hamburger return to (usually the homepage). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "DailyFlow"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Reviews"]
    const ctaLabel = props.ctaLabel ?? "Download App"
    const homeTarget = props.homeTarget ?? "Features"

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("text-foreground", className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
              <span className="text-xl font-semibold tracking-tight">{brand}</span>
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
                onClick={() => go(ctaLabel)}
                className="hidden items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                {ctaLabel}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(homeTarget)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
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
