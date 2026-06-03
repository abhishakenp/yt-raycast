import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogPostNavbar — sticky publication navigation bar for an editorial blog
 * post / article detail page. A translucent, border-bottomed header pinned to
 * the top of the viewport: a simple text brand name on the left (clickable, routes
 * via useNavigate), a horizontal set of nav links in the center (desktop), and
 * a hamburger menu button on mobile that routes to the first nav item. Every link
 * routes through useNavigate so labels can drive page-switching. Use as the sticky
 * site header for a blog, magazine, journal, or editorial publication.
 */
export const BlogPostNavbar = defineComponent({
  name: "BlogPostNavbar",
  description:
    "Sticky publication navigation bar for an editorial blog post / article detail page: a translucent, border-bottomed header pinned to the top with a clickable text brand name on the left, horizontal nav links in the center (desktop), and a hamburger menu button on mobile that routes to the first nav item via useNavigate. Use as the sticky site header for blogs, magazines, journals, or editorial publications.",
  props: z.object({
    /** Publication / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the mobile hamburger menu (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Studio Journal"
    const nav = props.nav?.length
      ? props.nav
      : ["Articles", "Authors", "Topics", "About"]
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <nav
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(brand)}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(homeTarget)}
              className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    )
  },
})
