import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DocsSidebar — persistent left navigation sidebar for a developer
 * DOCUMENTATION / API-reference site. A sticky, scrollable, right-bordered
 * column (hidden on mobile): a search box with an inline magnifier icon at the
 * top, several grouped link sections (uppercase group title + a vertical list of
 * page links, the first link highlighted as active), and a documentation-version
 * <select> at the bottom. The search submit and every link route through
 * useNavigate (never a dead "#"). Use as the left rail of a sidebar-driven docs
 * layout, API reference, SDK guide, or knowledge base. Renders fully with no
 * props via baked-in StackForge section groups.
 */
export const DocsSidebar = defineComponent({
  name: "DocsSidebar",
  description:
    "Persistent left navigation sidebar for a developer DOCUMENTATION / API-reference site: a sticky, scrollable, right-bordered column (hidden on mobile) with a search box + inline magnifier icon at the top, several grouped link sections (uppercase group title + vertical list of page links, the first highlighted as active — e.g. Overview / Core Concepts / SDKs & Tools / Resources) and a documentation-version select at the bottom. The search submit and every link route through useNavigate. Use as the left rail of a sidebar-driven docs layout, API reference, SDK guide, or knowledge base.",
  props: z.object({
    /** Search input placeholder text. */
    searchPlaceholder: z.string().optional(),
    /** Grouped navigation sections: uppercase group title + page link items. */
    groups: z
      .array(
        z.object({
          title: z.string(),
          items: z.array(z.string()),
        }),
      )
      .optional(),
    /** Documentation version options shown in the bottom select. */
    versions: z.array(z.string()).optional(),
    /** Navigation target used when the search form is submitted. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const searchPlaceholder = props.searchPlaceholder ?? "Search docs..."
    const groups = props.groups?.length
      ? props.groups
      : [
          {
            title: "Overview",
            items: ["Introduction", "Quick Start", "Installation"],
          },
          {
            title: "Core Concepts",
            items: [
              "Authentication",
              "Endpoints",
              "Rate Limits",
              "Error Handling",
              "Webhooks",
            ],
          },
          {
            title: "SDKs & Tools",
            items: ["Node.js SDK", "Python SDK", "Go SDK", "CLI Reference"],
          },
          {
            title: "Resources",
            items: ["Changelog", "Community", "Support"],
          },
        ]
    const versions = props.versions?.length
      ? props.versions
      : ["v3.2 (Latest)", "v3.1", "v3.0", "v2.9"]
    const searchTarget = props.searchTarget ?? "Getting Started"

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
      <aside
        className={cn(
          "hidden w-64 shrink-0 border-r border-border lg:block",
          props.className,
        )}
      >
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {/* Search */}
          <form
            className="mb-6"
            onSubmit={(e) => {
              e.preventDefault()
              go(searchTarget)
            }}
          >
            <label htmlFor="docs-sidebar-search" className="sr-only">
              Search documentation
            </label>
            <div className="relative">
              <input
                type="search"
                id="docs-sidebar-search"
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            </div>
          </form>

          {/* Navigation groups */}
          <nav className="space-y-6" aria-label="Sidebar navigation">
            {groups.map((group, gi) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h3>
                <ul className="space-y-1">
                  {(group.items ?? []).map((item, ii) => {
                    const active = gi === 0 && ii === 0
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            active
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                        >
                          {item}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Version selector */}
          <div className="mt-8 border-t border-border pt-6">
            <label htmlFor="docs-version" className="sr-only">
              Documentation version
            </label>
            <select
              id="docs-version"
              className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {versions.map((v) => (
                <option key={v} className="bg-background">
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    )
  },
})
