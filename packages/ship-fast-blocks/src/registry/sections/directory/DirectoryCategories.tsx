import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DirectoryCategories — browse-by-category tile grid for a local-business
 * directory. A card-surface section with a centered heading + description, a
 * responsive 2-to-4-column grid of clickable category tiles (each a rounded
 * bordered card with a tinted rounded icon badge that scales on hover, a title,
 * and a listing-count caption), and a centered "View All" link with a chevron.
 * Icon badge tints rotate through chart-1..5 + primary/accent/secondary tokens.
 * Every tile and the view-all link route through useNavigate. Use to let users
 * browse listing categories on local directories, marketplaces, or city guides.
 */
export const DirectoryCategories = defineComponent({
  name: "DirectoryCategories",
  description:
    "Browse-by-category tile grid for a local-business DIRECTORY: a card-surface section with a centered heading and description, a responsive 2-to-4-column grid of clickable category tiles (each a rounded bordered card with a tinted rounded icon badge that scales on hover, a title, and a listing-count caption), and a centered View All link with a chevron. Icon badge tints rotate through chart-1..5 plus primary/accent/secondary tokens. Every tile and the view-all link route through useNavigate. Use to let users browse listing categories on local directories, business-listing marketplaces, find-a-service platforms, or city guides.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Category tiles (title + listing count). */
    items: z
      .array(z.object({ title: z.string(), count: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Browse by Category"
    const description =
      props.description ??
      "Find exactly what you're looking for across dozens of local business categories"
    const viewAll = props.viewAll ?? "View All 24 Categories"
    const items = props.items?.length
      ? props.items
      : [
          { title: "Restaurants", count: "2,340 listings" },
          { title: "Home Services", count: "1,850 listings" },
          { title: "Beauty & Spas", count: "980 listings" },
          { title: "Health & Medical", count: "1,240 listings" },
          { title: "Real Estate", count: "670 listings" },
          { title: "Automotive", count: "890 listings" },
          { title: "Education", count: "520 listings" },
          { title: "Retail", count: "2,100 listings" },
        ]

    const ChevronRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const categoryIcons: ReactNode[] = [
      <svg
        key="book"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      <svg
        key="bolt"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="smile"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="health"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="home"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="edu"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="retail"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>,
    ]

    const categoryTints = [
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
      "bg-primary/10 text-primary",
      "bg-accent text-accent-foreground",
      "bg-secondary text-secondary-foreground",
    ]

    return (
      <section className={cn("bg-card py-16 lg:py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {items.map((cat, i) => (
              <button
                key={cat.title}
                type="button"
                onClick={() => go(cat.title)}
                className="group rounded-xl border border-border bg-background p-6 text-left transition-all hover:border-muted-foreground/40 hover:shadow-sm"
              >
                <div
                  className={cn(
                    "mb-4 flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                    categoryTints[i % categoryTints.length],
                  )}
                >
                  <span className="size-6 [&>svg]:size-6">
                    {categoryIcons[i % categoryIcons.length]}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold text-foreground">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground">{cat.count}</p>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
