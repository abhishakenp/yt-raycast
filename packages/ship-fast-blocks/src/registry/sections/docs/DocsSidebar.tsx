import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  NavSidebar,
  NavSidebarSection,
  NavSidebarLink,
} from '#/section-kit/NavSidebar.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
} from '#/section-kit/SearchForm.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { docsLakebed, type DocsArticleRecord } from './docs-lakebed.ts'
import { useDocsSearch, useSyncDocsCatalog } from './docs-interactions.tsx'

/**
 * DocsSidebar — persistent left navigation sidebar for a developer
 * DOCUMENTATION / API-reference site. A sticky, scrollable, right-bordered
 * column (hidden on mobile): a search box with an inline magnifier icon at the
 * top that queries a shared Lakebed docs catalog and surfaces matching articles
 * inline, several grouped link sections (uppercase group title + a vertical list
 * of page links, the first link highlighted as active), and a documentation-version
 * <select> at the bottom. The search submit writes shared Lakebed search state and
 * renders matching docs articles inline; every link routes through useNavigate
 * (never a dead "#"). Use as the left rail of a sidebar-driven docs layout, API
 * reference, SDK guide, or knowledge base. Renders fully with no props via
 * baked-in StackForge section groups.
 */
export const DocsSidebar = defineCapsule({
  name: 'DocsSidebar',
  description:
    'Persistent left navigation sidebar for a developer DOCUMENTATION / API-reference site: a sticky, scrollable, right-bordered column (hidden on mobile) with a search box + inline magnifier icon at the top that queries a shared Lakebed docs catalog and surfaces matching articles inline, several grouped link sections (uppercase group title + vertical list of page links, the first highlighted as active — e.g. Overview / Core Concepts / SDKs & Tools / Resources) and a documentation-version select at the bottom. The search submit writes shared Lakebed search state and renders matching docs articles inline; every link routes through useNavigate. Use as the left rail of a sidebar-driven docs layout, API reference, SDK guide, or knowledge base.',
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
    /** Docs articles searchable via the sidebar search box. */
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
    const searchPlaceholder = props.searchPlaceholder ?? 'Search docs...'
    const groups = props.groups?.length
      ? props.groups
      : [
          {
            title: 'Overview',
            items: ['Introduction', 'Quick Start', 'Installation'],
          },
          {
            title: 'Core Concepts',
            items: [
              'Authentication',
              'Endpoints',
              'Rate Limits',
              'Error Handling',
              'Webhooks',
            ],
          },
          {
            title: 'SDKs & Tools',
            items: ['Node.js SDK', 'Python SDK', 'Go SDK', 'CLI Reference'],
          },
          {
            title: 'Resources',
            items: ['Changelog', 'Community', 'Support'],
          },
        ]
    const versions = props.versions?.length
      ? props.versions
      : ['v3.2 (Latest)', 'v3.1', 'v3.0', 'v2.9']

    const articles = props.articles?.length
      ? props.articles
      : [
          {
            title: 'Introduction',
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

    const catalog = (lakebed.useQuery('docsCatalog') ??
      []) as DocsArticleRecord[]
    const articleCatalog: ReadonlyArray<{
      title: string
      slug: string
      category: string
      content: string
    }> = catalog.length ? catalog : articles
    const queryValue = docsSearch.state?.query ?? ''
    const activeQuery = queryValue.toLowerCase()
    const matchesQuery = (article: Record<string, unknown>) => {
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
      <NavSidebar
        variant="default"
        className={cn('hidden w-64 shrink-0 lg:block', props.className)}
      >
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {/* Search */}
          <SearchForm
            className="mb-6"
            key={queryValue}
            onSubmit={docsSearch.submitSearch}
            role="search"
            aria-label="Sidebar documentation search"
          >
            <label htmlFor="docs-sidebar-search" className="sr-only">
              Search documentation
            </label>
            <SearchField>
              <SearchFieldIcon className="left-3 top-2.5 flex-col justify-start pl-0">
                <SearchIcon className="size-4" />
              </SearchFieldIcon>
              <SearchFieldInput
                type="search"
                id="docs-sidebar-search"
                name="query"
                defaultValue={queryValue}
                placeholder={searchPlaceholder}
                className="rounded-lg py-2 pl-9 pr-4 text-sm focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </SearchField>
          </SearchForm>

          {showingResults ? (
            <Card
              rounded="lg"
              padding="none"
              className="mb-6 p-1.5"
              aria-live="polite"
            >
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                {matchingArticles.length} article
                {matchingArticles.length === 1 ? '' : 's'} match{' '}
                <span className="font-medium text-foreground">
                  {queryValue}
                </span>
              </p>
              <ul className="max-h-60 overflow-y-auto">
                {matchingArticles.map((article) => (
                  <li key={article.slug}>
                    <button
                      type="button"
                      onClick={() => go(article.title)}
                      className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                    >
                      <span className="truncate text-sm font-medium text-foreground">
                        {article.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {article.category}
                      </span>
                    </button>
                  </li>
                ))}
                {!matchingArticles.length ? (
                  <li className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No articles match the current search.
                  </li>
                ) : null}
              </ul>
            </Card>
          ) : null}

          {/* Navigation groups */}
          <nav className="space-y-6" aria-label="Sidebar navigation">
            {groups.map((group, gi) => (
              <NavSidebarSection key={group.title} spacing="sm" className="p-0">
                <Eyebrow
                  asChild
                  variant="text"
                  className="mb-3 block tracking-wider text-muted-foreground"
                >
                  <h3>{group.title}</h3>
                </Eyebrow>
                <ul className="space-y-1">
                  {(group.items ?? []).map((item, ii) => {
                    const active = gi === 0 && ii === 0
                    return (
                      <li key={item}>
                        <NavSidebarLink asChild active={active}>
                          <button
                            type="button"
                            onClick={() => go(item)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                              active
                                ? 'bg-muted font-medium text-foreground'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                            )}
                          >
                            {item}
                          </button>
                        </NavSidebarLink>
                      </li>
                    )
                  })}
                </ul>
              </NavSidebarSection>
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
      </NavSidebar>
    )
  },
})
