import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AnalyticsHeader — sticky top header bar for a SaaS analytics dashboard. A
 * blurred, border-bottomed row pinned to the top: on the left a mobile
 * hamburger toggle plus the page title and a subtitle/greeting; on the right an
 * inline search field (md+), a date-filter icon button, and a solid primary
 * Export action with a download glyph. Every control routes through useNavigate
 * (the search form submits to navigate). Use as the page-level toolbar above
 * dashboard content for analytics overviews, admin panels, reporting consoles,
 * or any data-product surface that needs a title + search + export row. Renders
 * fully with no props via baked-in "Dashboard Overview" defaults.
 */
export const AnalyticsHeader = defineComponent({
  name: "AnalyticsHeader",
  description:
    "Sticky top header bar for a SaaS analytics dashboard: a backdrop-blurred, border-bottomed row pinned to the top with a mobile hamburger toggle plus page title and subtitle/greeting on the left, and an inline search field (md+), a date-filter icon button, and a solid primary Export action with a download glyph on the right. Every control routes through useNavigate and the search form submits to navigate. Use as the page-level toolbar above dashboard content for analytics overviews, admin panels, reporting consoles, or any data-product surface needing a title + search + export row.",
  props: z.object({
    /** Page title shown on the left. */
    title: z.string().optional(),
    /** Subtitle / greeting under the title. */
    subtitle: z.string().optional(),
    /** Placeholder text for the search field. */
    searchPlaceholder: z.string().optional(),
    /** Label for the primary Export action. */
    exportLabel: z.string().optional(),
    /** Navigation target for the mobile hamburger toggle. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const headerTitle = props.title ?? "Dashboard Overview"
    const headerSubtitle =
      props.subtitle ?? "Welcome back, here's what's happening"
    const searchPlaceholder = props.searchPlaceholder ?? "Search analytics..."
    const exportLabel = props.exportLabel ?? "Export"
    const homeTarget = props.homeTarget ?? "Dashboard"

    // ---- Inline icons (decorative, currentColor) ----
    const iconProps = {
      width: 20,
      height: 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      "aria-hidden": true,
    }

    return (
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => go(homeTarget)}
              className="-ml-2 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <svg {...iconProps} width={24} height={24}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {headerTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                go(searchPlaceholder)
              }}
              className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-2 md:flex"
            >
              <svg
                {...iconProps}
                width={16}
                height={16}
                className="text-muted-foreground"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                aria-label="Search analytics"
                className="w-48 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              />
            </form>
            <button
              type="button"
              aria-label="Date filter"
              onClick={() => go("Date filter")}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <svg {...iconProps}>
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(exportLabel)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <svg {...iconProps} width={16} height={16}>
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{exportLabel}</span>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
