import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * SaasNavbar — glassy sticky top navigation bar for an AI-product / SaaS landing
 * page. A backdrop-blurred, border-bottomed header pinned to the top with a
 * gradient-tile clock-glyph logo + product name on the left, a centered set of
 * horizontal nav links (desktop), a gradient pill "Get Started" CTA on the
 * right, and a hamburger menu button on mobile. Every nav item and the CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for AI tools, SaaS apps, productivity/scheduling products, developer
 * tools, or modern B2B startups. Renders fully with no props via baked-in
 * "Chronos AI" defaults.
 */
export const SaasNavbar = defineComponent({
  name: "SaasNavbar",
  description:
    "Glassy sticky top navigation bar for an AI-product / SaaS landing page: a backdrop-blurred, border-bottomed header pinned to the top with a gradient-tile clock-glyph logo and product name on the left, a centered horizontal set of nav links (desktop), a gradient pill primary CTA on the right, and a hamburger menu button on mobile. Nav items and CTA route through useNavigate for page-switching. Use as the sticky site header for AI tools, SaaS apps, productivity/scheduling products, developer tools, or modern B2B startups.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label of the gradient pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Chronos AI"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "How It Works", "Pricing", "Testimonials", "FAQ"]
    const ctaLabel = props.ctaLabel ?? "Get Started"
    const ctaTarget = props.ctaTarget ?? "Start free trial"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
          >
            <LogoMark />
            {brand}
          </button>
          <ul className="hidden items-center gap-8 text-[0.9375rem] font-medium text-muted-foreground md:flex">
            {nav.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-5 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_1px_3px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="grid size-10 place-items-center rounded-lg text-foreground hover:bg-muted md:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
