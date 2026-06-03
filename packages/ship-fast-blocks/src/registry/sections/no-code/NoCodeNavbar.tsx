import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NoCodeNavbar — sticky, translucent top navigation bar for a clean, bright
 * no-code / app-builder SaaS site. A backdrop-blurred, border-bottomed header
 * pinned to the top with an inverse cube-glyph logo tile beside the brand name
 * on the left, a centered set of nav links (desktop), and a "Sign in" text link
 * plus a filled primary CTA on the right. Every link and CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for no-code / website-builder / page-builder / SaaS platform landing pages.
 * Renders fully with no props via baked-in "Buildr" defaults.
 */
export const NoCodeNavbar = defineComponent({
  name: "NoCodeNavbar",
  description:
    "Sticky translucent top navigation bar for a clean, bright no-code / app-builder SaaS site: backdrop-blurred, border-bottomed header pinned to the top with an inverse cube-glyph logo tile + brand name on the left, centered nav links (desktop), and a 'Sign in' text link plus a filled primary CTA on the right. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for no-code / website-builder / page-builder / form-builder / SaaS platform landing pages.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (should match site routes). */
    nav: z.array(z.string()).optional(),
    /** Text link label on the right (e.g. Sign in). */
    signInLabel: z.string().optional(),
    /** Filled primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the brand button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Buildr"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Templates", "Pricing", "Stories"]
    const signInLabel = props.signInLabel ?? "Sign in"
    const cta = props.cta ?? "Start building free"
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
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
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2"
          >
            <LogoMark className="size-8" />
            <span className="text-xl font-semibold tracking-tight">
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
              onClick={() => go(signInLabel)}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {signInLabel}
            </button>
            <button
              type="button"
              onClick={() => go(cta)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
