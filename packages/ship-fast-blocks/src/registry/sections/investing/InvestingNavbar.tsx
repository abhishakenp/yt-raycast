import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * InvestingNavbar — sticky, blurred top navigation bar for a modern investing /
 * fintech brokerage site. A backdrop-blurred, border-bottomed header pinned to
 * the top of the viewport: a trend-line brand glyph tile beside the platform
 * name on the left, a horizontal set of nav links in the center (desktop), and a
 * subtle "Sign in" link plus a filled "Get started" primary button on the right.
 * Every link and CTA routes through useNavigate so labels can drive page
 * switching. Use as the sticky site header for stock brokerages, trading apps,
 * robo-advisors, crypto exchanges, wealth-management or any fintech product.
 * Renders fully with no props via baked-in "Vestora" defaults.
 */
export const InvestingNavbar = defineComponent({
  name: "InvestingNavbar",
  description:
    "Sticky backdrop-blurred top navigation bar for a modern investing / fintech brokerage site: a trend-line brand glyph tile + platform name on the left, horizontal nav links in the center (desktop), and a subtle 'Sign in' link plus a filled 'Get started' primary button on the right. Links and CTAs route through useNavigate for page-switching. Use as the sticky site header for stock brokerages, trading apps, robo-advisors, crypto exchanges or wealth-management products.",
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Subtle right-side "Sign in" link label. */
    signIn: z.string().optional(),
    /** Filled primary "Get started" button label. */
    getStarted: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vestora"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Pricing", "Markets", "Reviews", "FAQ"]
    const signIn = props.signIn ?? "Sign in"
    const getStarted = props.getStarted ?? "Get started"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
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
                onClick={() => go(signIn)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {signIn}
              </button>
              <button
                type="button"
                onClick={() => go(getStarted)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {getStarted}
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
