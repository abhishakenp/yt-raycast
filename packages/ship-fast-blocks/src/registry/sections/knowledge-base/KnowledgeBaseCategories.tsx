import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * KnowledgeBaseCategories — "browse by category" grid for a help center. A
 * centered heading + description above a responsive 1/2/4-up grid of bordered
 * card buttons, each with a rounded muted icon tile (rotating line glyphs),
 * a title, a short description and an article-count caption; cards lift and tint
 * their border on hover. Calm, light, organized documentation aesthetic. Every
 * category card routes through useNavigate. Use to let visitors browse a
 * knowledge base / support portal by topic. Renders fully with no props via
 * baked-in defaults.
 */
export const KnowledgeBaseCategories = defineComponent({
  name: "KnowledgeBaseCategories",
  description:
    "'Browse by category' grid for a help center: a centered heading + description above a responsive 1/2/4-up grid of bordered card buttons, each with a rounded muted icon tile (rotating line glyphs), a title, a short description and an article-count caption; cards lift and tint their border on hover. Calm, light, organized documentation aesthetic; every category card routes through useNavigate. Use to let visitors browse a knowledge base, support portal or docs site by topic.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          count: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Browse by Category"
    const description =
      props.description ??
      "Find answers organized by topic, from getting started to advanced features."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Getting Started",
            description: "Quick setup guides and first steps",
            count: "24 articles",
          },
          {
            title: "Account Management",
            description: "Profiles, settings, and security",
            count: "18 articles",
          },
          {
            title: "Billing & Plans",
            description: "Payments, invoices, and subscriptions",
            count: "15 articles",
          },
          {
            title: "API & Developers",
            description: "Documentation and code examples",
            count: "42 articles",
          },
          {
            title: "Security & Privacy",
            description: "2FA, SSO, and data protection",
            count: "22 articles",
          },
          {
            title: "Integrations",
            description: "Third-party app connections",
            count: "31 articles",
          },
          {
            title: "Troubleshooting",
            description: "Common issues and solutions",
            count: "28 articles",
          },
          {
            title: "Product Updates",
            description: "Release notes and new features",
            count: "56 articles",
          },
        ]

    const categoryIcons: ReactNode[] = [
      <svg key="bolt" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>,
      <svg key="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>,
      <svg key="card" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>,
      <svg key="code" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 16 2 12 6 8" />
        <polyline points="18 8 22 12 18 16" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>,
      <svg key="shield" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      <svg key="puzzle" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
      </svg>,
      <svg key="wrench" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.4 9.5l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1 1.51" />
      </svg>,
      <svg key="doc" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>,
    ]

    return (
      <section
        className={cn("bg-background py-16 sm:py-20", props.className)}
        aria-labelledby="kb-categories-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2
              id="kb-categories-heading"
              className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
            >
              {heading}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((cat, i) => (
              <button
                key={cat.title}
                type="button"
                onClick={() => go(cat.title)}
                className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/30 hover:shadow-md"
                aria-label={`${cat.title} category, ${cat.count}`}
              >
                <div className="mb-4 grid size-12 place-items-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-accent">
                  {categoryIcons[i % categoryIcons.length]}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                  {cat.title}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <span className="text-xs font-medium text-muted-foreground">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
