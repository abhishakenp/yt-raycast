import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * PhotographyNavbar — fixed, translucent top navigation bar for a fine-art /
 * wedding photographer portfolio. A backdrop-blurred header pinned to the top
 * with a hairline bottom border: a serif wordmark brand on the left, evenly
 * spaced horizontal nav links in the center (desktop) where the last item is
 * underline-highlighted as the active/contact link, and a hamburger menu on
 * mobile. Every link routes through useNavigate so labels drive page-switching.
 * Use as the sticky site header for wedding photographers, portrait studios,
 * elopement shooters, or any warm, editorial visual-creative portfolio. Renders
 * fully with no props via baked-in "Elena Vossen" defaults.
 */
export const PhotographyNavbar = defineComponent({
  name: "PhotographyNavbar",
  description:
    "Fixed translucent top navigation bar for a fine-art / wedding photographer portfolio: backdrop-blurred header with a hairline bottom border, a serif wordmark brand on the left, evenly spaced horizontal nav links in the center (desktop) with the last item underline-highlighted as active, and a hamburger menu on mobile. Every link routes through useNavigate for page-switching. Use as the sticky site header for wedding photographers, portrait studios, elopement shooters, or warm editorial visual-creative portfolios.",
  props: z.object({
    /** Photographer / studio name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / hamburger clicks. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Elena Vossen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Services", "About", "Testimonials", "Contact"]
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="font-serif text-2xl font-medium tracking-tight text-foreground"
            >
              {brand}
            </button>
            <div className="hidden items-center space-x-12 md:flex">
              {nav.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    i === nav.length - 1
                      ? "border-b-2 border-foreground pb-0.5 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(homeTarget)}
              className="p-2 text-muted-foreground hover:text-foreground md:hidden"
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
        </nav>
      </header>
    )
  },
})
