import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FintechNavbar — sticky translucent top navigation for a fintech / neobank
 * landing page. A backdrop-blurred, border-bottomed header pinned to the top
 * of the viewport: a shield-in-square brand logo tile + product name on the
 * left, a horizontal row of nav links in the center, and a "Sign in" text
 * plus a primary "Get started" CTA button on the right (desktop). Every link
 * and CTA routes through useNavigate so labels can drive page-switching.
 * Use as the site header for banking apps, digital wallets, payments
 * products, or any finance startup landing page.
 */
export const FintechNavbar = defineComponent({
  name: "FintechNavbar",
  description:
    "Sticky translucent top navigation bar for a fintech / neobank landing page: backdrop-blurred, border-bottomed header with a brand shield logo tile + product name on the left, horizontal nav links in the center, a 'Sign in' text button, and a primary 'Get started' CTA on the right. All links route through useNavigate for page-switching. Use as the site header for banking apps, digital wallets, payment products, or finance startup landing pages.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vault"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Security", "Pricing", "FAQ"]
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? "Get started"
    const ctaTarget = props.ctaTarget ?? "Open free account"

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
          className="size-[60%]"
        >
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
          >
            <LogoMark className="size-8" />
            {brand}
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
              onClick={() => go("Sign in")}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
