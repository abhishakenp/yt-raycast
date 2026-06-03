import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NewsNavbar — sticky masthead header for a news / editorial publication. A
 * bordered, card-surfaced bar pinned to the top: a newspaper-glyph logo tile
 * beside the publication name on the left, a horizontal row of section links in
 * the center (desktop), and a search icon plus a Subscribe button on the right,
 * with a hamburger menu on mobile. Beneath it sits a dismissible-feeling
 * trending ticker — a "Trending:" label followed by clickable topic links. Every
 * link, the search, the subscribe button and each ticker topic route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for newspapers, magazines, online publications, media brands or blog indexes.
 * Renders fully with no props via baked-in "The Chronicle" defaults.
 */
export const NewsNavbar = defineComponent({
  name: "NewsNavbar",
  description:
    "Sticky masthead header for a news / editorial publication: a bordered card-surfaced bar pinned to the top with a newspaper-glyph logo tile + publication name on the left, a horizontal row of section links in the center (desktop), and a search icon plus a Subscribe button on the right, with a hamburger menu on mobile. Beneath it a trending ticker shows a 'Trending:' label followed by clickable topic links. Section links, search, subscribe and ticker topics route through useNavigate for page-switching. Use as the sticky site header for newspapers, magazines, online publications, media brands or article-heavy blog indexes.",
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar section labels (first item also drives the brand/menu target). */
    nav: z.array(z.string()).optional(),
    /** Label for the search affordance. */
    searchLabel: z.string().optional(),
    /** Subscribe button label on the right. */
    subscribe: z.string().optional(),
    /** Trending ticker label shown under the navbar. */
    tickerLabel: z.string().optional(),
    /** Trending ticker clickable topic links. */
    tickerTopics: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "The Chronicle"
    const nav = props.nav?.length
      ? props.nav
      : ["News", "Politics", "Business", "Tech", "Culture", "Science", "Health"]
    const searchLabel = props.searchLabel ?? "Search"
    const subscribe = props.subscribe ?? "Subscribe"
    const tickerLabel = props.tickerLabel ?? "Trending:"
    const tickerTopics = props.tickerTopics?.length
      ? props.tickerTopics
      : [
          "Climate Summit",
          "AI Regulation",
          "Market Watch",
          "Oscar Nominations",
          "SpaceX Launch",
          "Premier League",
        ]

    const Masthead = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </svg>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-card",
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
              <Masthead className="size-8 text-foreground" />
              <span className="text-xl font-bold tracking-tight lg:text-2xl">
                {brand}
              </span>
            </button>

            <nav className="hidden items-center gap-8 lg:flex">
              {nav.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    i === 0 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label={searchLabel}
                onClick={() => go(searchLabel)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(subscribe)}
                className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
              >
                {subscribe}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground lg:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Trending ticker */}
        <div className="hidden border-t border-border bg-card lg:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-6 py-3 text-sm">
              <span className="font-medium text-foreground">{tickerLabel}</span>
              {tickerTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => go(topic)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {topic}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
    )
  },
})
