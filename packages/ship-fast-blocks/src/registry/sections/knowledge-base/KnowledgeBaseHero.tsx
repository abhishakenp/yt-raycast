import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { FilterChip } from '#/section-kit/index.ts'
import { knowledgeBaseLakebed } from './knowledge-base-lakebed.ts'
import {
  useKbSearch,
  useSyncKbCatalog,
} from './knowledge-base-interactions.tsx'

/**
 * KnowledgeBaseHero — centered help-center hero on a raised card surface. A
 * generous, calm masthead: a large heading + supporting paragraph, a wide
 * rounded search field with a leading search icon and a ⌘K hint, and a row of
 * "Popular:" topic chips beneath it. The search form and every popular-topic
 * chip write shared Lakebed search criteria so article results render inline
 * beneath the search. Light, editorial, search-first. Use as the top hero of a
 * help center, support portal, knowledge base, docs landing or FAQ hub where an
 * article-search-first entry point is wanted. Renders fully with no props via
 * baked-in defaults.
 */
export const KnowledgeBaseHero = defineCapsule({
  name: 'KnowledgeBaseHero',
  description:
    "Centered help-center hero on a raised card surface: a calm masthead with a large heading + supporting paragraph, a wide rounded search field with a leading search icon and a ⌘K hint, and a row of 'Popular:' topic chips beneath it. The search form and popular-topic chips write shared Lakebed search criteria so article results render inline beneath the search. Light, editorial, search-first. Use as the top hero of a help center, support portal, knowledge base, docs landing or FAQ hub where an article-search-first entry point is wanted.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    searchPlaceholder: z.string().optional(),
    popularLabel: z.string().optional(),
    popular: z.array(z.string()).optional(),
    /** Knowledge-base articles seeded into Lakebed. */
    articles: z
      .array(
        z.object({
          title: z.string(),
          slug: z.string(),
          category: z.string(),
          content: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: knowledgeBaseLakebed,
  component: ({ props, lakebed }) => {
    const kbSearch = useKbSearch(lakebed)
    const heading = props.heading ?? 'How can we help you?'
    const subheading =
      props.subheading ??
      'Search our knowledge base for answers, browse by topic, or get in touch with our support team.'
    const searchPlaceholder =
      props.searchPlaceholder ?? 'Search articles, guides, and documentation...'
    const popularLabel = props.popularLabel ?? 'Popular:'
    const popular = props.popular?.length
      ? props.popular
      : ['Getting started', 'Account setup', 'Billing', 'API keys']
    const articles = props.articles?.length
      ? props.articles
      : [
          {
            title: 'Getting started with your account',
            slug: 'getting-started',
            category: 'Getting started',
            content:
              'Learn how to create an account, verify your email, and set up your profile in a few minutes.',
          },
          {
            title: 'Account setup and team management',
            slug: 'account-setup',
            category: 'Account setup',
            content:
              'Invite teammates, assign roles, and manage permissions across your organization.',
          },
          {
            title: 'Billing and subscription plans',
            slug: 'billing',
            category: 'Billing',
            content:
              'Understand your invoice, upgrade or downgrade your plan, and manage payment methods.',
          },
          {
            title: 'Generating and rotating API keys',
            slug: 'api-keys',
            category: 'API keys',
            content:
              'Create secure API keys, rotate them safely, and restrict access by scope.',
          },
        ]

    useSyncKbCatalog(lakebed, articles)

    const queryValue = kbSearch.state?.query ?? ''
    const results = kbSearch.state?.results ?? []

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
        className={cn('border-b border-border bg-card', props.className)}
      >
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            {subheading}
          </p>
          <form
            key={queryValue}
            className="relative mx-auto max-w-2xl"
            role="search"
            aria-label="Knowledge base search"
            onSubmit={kbSearch.submitSearch}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <SearchIcon className="size-5" />
            </span>
            <input
              name="query"
              type="search"
              defaultValue={queryValue}
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
              <FilterChip
                key={topic}
                variant="muted"
                size="sm"
                onClick={() => kbSearch.chooseSearch({ query: topic })}
              >
                {topic}
              </FilterChip>
            ))}
          </div>

          {queryValue ? (
            <div
              className="mx-auto mt-10 max-w-2xl text-left"
              aria-live="polite"
            >
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} article{results.length === 1 ? '' : 's'} for
                &ldquo;{queryValue}&rdquo;
              </p>
              <ul className="space-y-3">
                {results.map((article) => (
                  <Card
                    key={article.id}
                    asChild
                    variant="outline"
                    rounded="xl"
                    padding="sm"
                    className="bg-background transition-colors hover:border-foreground/30"
                  >
                    <li>
                      <p className="text-sm font-medium text-foreground">
                        {article.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {article.category}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {article.content}
                      </p>
                    </li>
                  </Card>
                ))}
                {!results.length ? (
                  <li className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                    No articles match your search.
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    )
  },
})
