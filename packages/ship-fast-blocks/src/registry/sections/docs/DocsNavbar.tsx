import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DocsNavbar — sticky, blurred top navigation bar for a developer
 * DOCUMENTATION / API-reference site. A border-bottomed header pinned to the top
 * on a translucent background: a neutral stacked-blocks brand logo tile + product
 * name + "/ Docs" context label on the left, a horizontal row of section links
 * plus a search icon button and a GitHub icon button on the right (desktop), and
 * a hamburger menu button on mobile. Every link and icon routes through
 * useNavigate (never a dead "#"), and nav labels match site routes so PageSwitch
 * can swap pages. Use as the sticky site header for docs homes, API references,
 * SDK guides, developer portals, or knowledge bases. Renders fully with no props
 * via baked-in "StackForge" defaults.
 */
export const DocsNavbar = defineComponent({
  name: "DocsNavbar",
  description:
    "Sticky backdrop-blurred top navigation bar for a developer DOCUMENTATION / API-reference site: border-bottomed translucent header pinned to the top with a neutral stacked-blocks brand logo tile + product name + '/ Docs' context label on the left, a horizontal row of section links plus a search icon button and a GitHub icon button on the right (desktop), and a hamburger menu button on mobile. Links and icons route through useNavigate for page-switching; nav labels match site routes. Use as the sticky site header for docs homes, API references, SDK guides, developer portals, or knowledge bases.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Social labels used to resolve the GitHub icon target. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "StackForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Getting Started", "API Reference", "SDKs", "Changelog"]
    const socials = props.socials?.length
      ? props.socials
      : ["Twitter", "GitHub", "Discord"]

    // Brand logo tile — neutral square with a stacked-blocks glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
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

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3"
            >
              <LogoMark className="size-8" />
              <span className="text-lg font-semibold text-foreground">
                {brand}
              </span>
              <span className="mx-1 text-muted-foreground/60">/</span>
              <span className="text-muted-foreground">Docs</span>
            </button>

            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center gap-6 text-sm">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Search documentation"
                  onClick={() => go(nav[0])}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  aria-label="GitHub repository"
                  onClick={() =>
                    go(
                      socials.find((s) => s.toLowerCase().includes("git")) ??
                        nav[0],
                    )
                  }
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => go(nav[0])}
              className="p-2 text-muted-foreground md:hidden"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
