import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NutritionNavbar — sticky translucent top navigation bar for a nutrition-coaching /
 * wellness site. A backdrop-blurred, border-bottomed header pinned to the top with a
 * decorative leaf brand mark + wordmark on the left, horizontal muted-to-primary nav
 * links centered (desktop), and a "Sign In" text link plus a filled primary pill CTA
 * on the right. Every link and CTA routes through useNavigate so PageSwitch can swap
 * pages. Use as the sticky site header for nutrition coaches, dietitians, meal-plan
 * subscriptions, diet / wellness programs, weight-loss or healthy-eating services.
 */
export const NutritionNavbar = defineComponent({
  name: "NutritionNavbar",
  description:
    "Sticky translucent top navigation bar for a nutrition-coaching / wellness site: a backdrop-blurred, border-bottomed header with a decorative leaf brand mark + wordmark on the left, horizontal muted-to-primary nav links (desktop), a 'Sign In' text link, and a filled primary pill CTA on the right. All links and CTAs route through useNavigate. Use as the sticky site header for nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs, weight-loss or healthy-eating services and fitness-nutrition apps.",
  props: z.object({
    /** Brand name shown beside the leaf mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Secondary text link on the right (e.g. account sign-in). */
    signInLabel: z.string().optional(),
    /** Filled primary pill CTA label (also its navigation target). */
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nourish"
    const nav = props.nav?.length
      ? props.nav
      : ["Approach", "Stories", "Plans", "FAQ"]
    const signInLabel = props.signInLabel ?? "Sign In"
    const ctaLabel = props.ctaLabel ?? "Start Free Trial"

    const LeafMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LeafMark className="size-8 text-primary" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {brand}
              </span>
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(signInLabel)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
              >
                {signInLabel}
              </button>
              <button
                type="button"
                onClick={() => go(ctaLabel)}
                className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})
