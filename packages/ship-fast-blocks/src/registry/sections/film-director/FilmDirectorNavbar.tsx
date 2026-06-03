import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FilmDirectorNavbar — fixed, backdrop-blurred top navigation bar for a film
 * director / cinematographer / DP portfolio. A border-bottomed translucent
 * header pinned to the top with the director's UPPERCASE name on the left, a
 * row of thin minimal text links on the right (desktop), the LAST nav item
 * rendered as a filled primary pill CTA, and a hamburger menu button on mobile.
 * Every link and CTA routes through useNavigate. Use as the sticky site header
 * for filmmakers, directors, cinematographers, DPs, or video production houses
 * wanting a clean, editorial, light-canvas aesthetic.
 */
export const FilmDirectorNavbar = defineComponent({
  name: "FilmDirectorNavbar",
  description:
    "Fixed, backdrop-blurred top navigation bar for a film director / cinematographer / DP portfolio: a border-bottomed translucent header with the director's UPPERCASE name on the left, a row of thin minimal text links on the right (desktop), the last nav item rendered as a filled primary pill CTA, and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for filmmakers, directors, cinematographers, DPs, or video production houses wanting a clean, editorial, light-canvas aesthetic.",
  props: z.object({
    /** Director / studio name shown in the navbar (rendered uppercase). */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Marcus Chen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Services", "About", "Get in Touch"]

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:h-20">
            <button
              type="button"
              onClick={() => go(brand)}
              className="text-lg font-medium tracking-tight md:text-xl"
            >
              {brand.toUpperCase()}
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {nav[nav.length - 1]}
              </button>
            </div>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => go(nav[0])}
              className="p-2 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
