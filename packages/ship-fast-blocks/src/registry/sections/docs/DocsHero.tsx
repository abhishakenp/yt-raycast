import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { docsLakebed } from './docs-lakebed.ts'
import { useDocsSearch, useSyncDocsCatalog } from './docs-interactions.tsx'

/**
 * DocsHero — search-forward hero band for a developer DOCUMENTATION / API-reference
 * home. A centered, clean-aesthetic header: an uppercase "Documentation" eyebrow pill
 * in accent, a large semibold headline, a muted supporting paragraph, then a prominent
 * search bar (an inline magnifier glyph + a real `type="search"` input whose form
 * submit queries a shared Lakebed docs catalog and surfaces matching articles inline),
 * and a row of two CTA pill buttons — a primary "Read the docs" and an outline
 * "Quickstart" — plus an optional ⌘K keyboard hint chip. The search form writes shared
 * Lakebed search state and renders matching docs articles inline; CTA buttons route
 * through useNavigate (never a dead "#"), and labels match site routes so PageSwitch
 * can swap pages. Use as the lead band for docs homes, API references, SDK guides,
 * developer portals, or knowledge bases. Renders fully with no props via baked-in
 * "StackForge" defaults.
 */
export const DocsHero = defineCapsule({
  name: 'DocsHero',
  description:
    "Search-forward centered hero band for a developer DOCUMENTATION / API-reference home: an uppercase 'Documentation' eyebrow pill in accent, a large semibold headline, a muted supporting paragraph, a prominent search bar with an inline magnifier glyph and a real type='search' input whose form submit queries a shared Lakebed docs catalog and surfaces matching articles inline, and a row of two CTA pill buttons (primary 'Read the docs' + outline 'Quickstart') with an optional ⌘K keyboard hint chip. The search form writes shared Lakebed search state and renders matching docs articles inline; CTA buttons route through useNavigate for page-switching. Use as the lead band for docs homes, API references, SDK guides, developer portals, or knowledge bases. Clean developer-docs aesthetic, theme tokens only.",
  props: z.object({
    /** Uppercase eyebrow pill label above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Placeholder text for the search input. */
    searchPlaceholder: z.string().optional(),
    /** Route the search form submit navigates to (must match a site route). */
    searchTarget: z.string().optional(),
    /** Primary CTA pill label. */
    primaryCta: z.string().optional(),
    /** Route the primary CTA navigates to (must match a site route). */
    primaryTarget: z.string().optional(),
    /** Outline CTA pill label. */
    secondaryCta: z.string().optional(),
    /** Route the outline CTA navigates to (must match a site route). */
    secondaryTarget: z.string().optional(),
    /** Docs articles searchable via the hero search box. */
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
  lakebed: docsLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const docsSearch = useDocsSearch(lakebed)
    const eyebrow = props.eyebrow ?? 'Documentation'
    const heading =
      props.heading ?? 'Everything you need to build with StackForge'
    const subheading =
      props.subheading ??
      'Guides, API references, and tutorials to take you from first request to production.'
    const searchPlaceholder = props.searchPlaceholder ?? 'Search the docs...'
    const primaryCta = props.primaryCta ?? 'Read the docs'
    const primaryTarget = props.primaryTarget ?? 'Getting Started'
    const secondaryCta = props.secondaryCta ?? 'Quickstart'
    const secondaryTarget = props.secondaryTarget ?? 'Quick Start'
    const articles = props.articles?.length
      ? props.articles
      : [
          {
            title: 'Getting Started',
            slug: 'getting-started',
            category: 'Overview',
            content:
              'Set up your first StackForge project, install the CLI, and make your first API request in minutes.',
          },
          {
            title: 'Quick Start',
            slug: 'quick-start',
            category: 'Overview',
            content:
              'A fast walkthrough that ships a hello-world integration with authentication and webhooks.',
          },
          {
            title: 'Installation',
            slug: 'installation',
            category: 'Overview',
            content:
              'Install the StackForge SDK for Node.js, Python, Go, or the CLI across all supported platforms.',
          },
          {
            title: 'Authentication',
            slug: 'authentication',
            category: 'Core Concepts',
            content:
              'Issue API keys, exchange OAuth 2.0 tokens, and secure every request with signed headers.',
          },
          {
            title: 'Endpoints',
            slug: 'endpoints',
            category: 'Core Concepts',
            content:
              'Reference for every REST endpoint, including parameters, response shapes, and paginated cursors.',
          },
          {
            title: 'Rate Limits',
            slug: 'rate-limits',
            category: 'Core Concepts',
            content:
              'Understand per-key rate limits, burst allowances, and how to back off correctly on 429s.',
          },
          {
            title: 'Error Handling',
            slug: 'error-handling',
            category: 'Core Concepts',
            content:
              'Map status codes to error types and implement retries with exponential backoff.',
          },
          {
            title: 'Webhooks',
            slug: 'webhooks',
            category: 'Core Concepts',
            content:
              'Subscribe to event webhooks, verify signatures, and replay missed deliveries.',
          },
          {
            title: 'Node.js SDK',
            slug: 'node-sdk',
            category: 'SDKs & Tools',
            content:
              'Type-safe Node.js SDK with streaming helpers, retries, and first-class TypeScript types.',
          },
          {
            title: 'Python SDK',
            slug: 'python-sdk',
            category: 'SDKs & Tools',
            content:
              'Idiomatic Python SDK supporting async and sync clients with automatic retries.',
          },
          {
            title: 'Go SDK',
            slug: 'go-sdk',
            category: 'SDKs & Tools',
            content:
              'Minimal, context-aware Go module for calling StackForge from services and CLIs.',
          },
          {
            title: 'CLI Reference',
            slug: 'cli-reference',
            category: 'SDKs & Tools',
            content:
              'Command-line reference for managing projects, keys, and deployments from the terminal.',
          },
          {
            title: 'Changelog',
            slug: 'changelog',
            category: 'Resources',
            content:
              'Release notes for every SDK and API version, including breaking changes and migrations.',
          },
          {
            title: 'Community',
            slug: 'community',
            category: 'Resources',
            content:
              'Join the StackForge community forum, Discord, and open-source contributor program.',
          },
          {
            title: 'Support',
            slug: 'support',
            category: 'Resources',
            content:
              'Reach support via email, chat, or status page for incident response and SLAs.',
          },
        ]

    useSyncDocsCatalog(lakebed, articles)

    const catalog = lakebed.useQuery('docsCatalog') ?? []
    const articleCatalog: ReadonlyArray<{
      title: string
      slug: string
      category: string
      content: string
    }> = catalog.length ? catalog : articles
    const queryValue = docsSearch.state?.query ?? ''
    const activeQuery = queryValue.toLowerCase()
    const matchesQuery = (article: {
      title: string
      slug: string
      category: string
      content: string
    }) => {
      const haystack = [
        article.title,
        article.slug,
        article.category,
        article.content,
      ]
        .join(' ')
        .toLowerCase()
      return !activeQuery || haystack.includes(activeQuery)
    }
    const matchingArticles = articleCatalog.filter(matchesQuery)
    const showingResults = activeQuery.length > 0

    return (
      <section
        className={cn(
          'mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-24',
          props.className,
        )}
      >
        <p className="mb-5 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {heading}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {subheading}
        </p>

        <form
          key={queryValue}
          onSubmit={docsSearch.submitSearch}
          className="mx-auto mt-9 max-w-2xl"
          role="search"
          aria-label="Documentation search"
        >
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            <input
              type="search"
              name="query"
              aria-label="Search the documentation"
              placeholder={searchPlaceholder}
              defaultValue={queryValue}
              className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-foreground placeholder-muted-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </span>
          </div>
        </form>

        {showingResults ? (
          <div
            className="mx-auto mt-4 max-w-2xl rounded-xl border border-border bg-card p-2 text-left shadow-sm"
            aria-live="polite"
          >
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {matchingArticles.length} article
              {matchingArticles.length === 1 ? '' : 's'} match{' '}
              <span className="font-medium text-foreground">{queryValue}</span>
            </p>
            <ul className="max-h-72 overflow-y-auto">
              {matchingArticles.map((article) => (
                <li key={article.slug}>
                  <button
                    type="button"
                    onClick={() => go(article.title)}
                    className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {article.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {article.category}
                    </span>
                  </button>
                </li>
              ))}
              {!matchingArticles.length ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No articles match the current search.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(primaryTarget)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {primaryCta}
          </button>
          <button
            type="button"
            onClick={() => go(secondaryTarget)}
            className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {secondaryCta}
          </button>
        </div>
      </section>
    )
  },
})
