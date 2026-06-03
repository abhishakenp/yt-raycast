import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * KnowledgeBaseHero — centered help-center hero on a raised card surface. A
 * generous, calm masthead: a large heading + supporting paragraph, a wide
 * rounded search field with a leading search icon and a ⌘K hint, and a row of
 * "Popular:" topic chips beneath it. Light, editorial, search-first. The search
 * form submit and every popular-topic chip route through useNavigate. Use as the
 * top hero of a help center, support portal, knowledge base, docs landing or FAQ
 * hub where an article-search-first entry point is wanted. Renders fully with no
 * props via baked-in defaults.
 */
export const KnowledgeBaseHero = defineComponent({
  name: "KnowledgeBaseHero",
  description:
    "Centered help-center hero on a raised card surface: a calm masthead with a large heading + supporting paragraph, a wide rounded search field with a leading search icon and a ⌘K hint, and a row of 'Popular:' topic chips beneath it. Light, editorial, search-first; the search submit and popular-topic chips route through useNavigate. Use as the top hero of a help center, support portal, knowledge base, docs landing or FAQ hub where an article-search-first entry point is wanted.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    searchPlaceholder: z.string().optional(),
    popularLabel: z.string().optional(),
    popular: z.array(z.string()).optional(),
    /** Navigation target when the search form is submitted. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "How can we help you?"
    const subheading =
      props.subheading ??
      "Search our knowledge base for answers, browse by topic, or get in touch with our support team."
    const searchPlaceholder =
      props.searchPlaceholder ?? "Search articles, guides, and documentation..."
    const popularLabel = props.popularLabel ?? "Popular:"
    const popular = props.popular?.length
      ? props.popular
      : ["Getting started", "Account setup", "Billing", "API keys"]
    const searchTarget = props.searchTarget ?? "Search"

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
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="15" y2="15" />
      </svg>
    )

    return (
      <section
        className={cn("border-b border-border bg-card", props.className)}
      >
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            {subheading}
          </p>
          <form
            className="relative mx-auto max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault()
              go(searchTarget)
            }}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <SearchIcon className="size-5" />
            </span>
            <input
              type="search"
              placeholder={searchPlaceholder}
              aria-label="Search help articles"
              className="w-full rounded-xl border border-input bg-background py-4 pl-12 pr-16 text-base text-foreground placeholder-muted-foreground shadow-sm transition-shadow focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
                ⌘K
              </kbd>
            </span>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-muted-foreground">{popularLabel}</span>
            {popular.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => go(topic)}
                className="rounded-full bg-muted px-3 py-1 text-secondary-foreground transition-colors hover:bg-accent"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
