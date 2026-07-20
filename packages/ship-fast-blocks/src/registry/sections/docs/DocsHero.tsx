import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { docsLakebed, type DocsArticleRecord } from './docs-lakebed.ts'
import { useDocsSearch, useSyncDocsCatalog } from './docs-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchFieldHint,
} from '#/section-kit/SearchForm.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * DocsHero — "Terminal-docs" search-forward lead band for a developer
 * DOCUMENTATION / API-reference home. An asymmetric 8:4 reference-manual
 * spread under a giant ghost `#` watermark: the left column opens with a mono
 * breadcrumb rail (primary square, mono eyebrow, hairline rule, `~/docs`
 * path), a huge extrabold `#`-anchored headline, a muted lede, then a square
 * hairline mono search bar (a real `type="search"` input whose form submit
 * queries a shared Lakebed docs catalog and surfaces matching articles in a
 * collapsed-border result ledger) with a square `⌘K` kbd chip, and a pair of
 * square CTAs — a hard-offset-shadow primary "Read the docs" with press
 * feedback beside a hairline "Quickstart". The right rail (lg+) is a
 * hairline-railed index: a collapsed-border category ledger with tabular
 * counts derived from the article catalog, plus a kbd-chip shortcut table.
 * The search form writes shared Lakebed search state and renders matching
 * docs articles inline; CTA buttons and result rows route through section-kit
 * route links (never a dead "#"), and labels match site routes so PageSwitch
 * can swap pages. Use as the lead band for docs homes, API references, SDK
 * guides, developer portals, or knowledge bases. Renders fully with no props
 * via baked-in "StackForge" defaults.
 */
export const DocsHero = defineCapsule({
  name: 'DocsHero',
  description:
    "Terminal-docs asymmetric 8:4 hero band for a developer DOCUMENTATION / API-reference home under a giant ghost '#' watermark: a mono breadcrumb rail (primary square + mono eyebrow + hairline rule + '~/docs' path), a huge extrabold '#'-anchored headline, a muted lede, a square hairline mono search bar with a '⌘K' kbd chip whose real type='search' input submit queries a shared Lakebed docs catalog and surfaces matching articles in a collapsed-border result ledger, and two square CTAs (hard-offset-shadow primary 'Read the docs' with press feedback + hairline 'Quickstart'); the lg+ right rail is a hairline index with a category ledger (tabular counts derived from the catalog) and a kbd-chip shortcut table. The search form writes shared Lakebed search state and renders matching docs articles inline; CTAs and result rows route through section-kit route links for page-switching. Use as the lead band for docs homes, API references, SDK guides, developer portals, or knowledge bases. Theme tokens only.",
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

    const categories: string[] = []
    for (const article of articleCatalog) {
      if (article.category && !categories.includes(article.category)) {
        categories.push(article.category)
      }
    }
    const categoryCount = (category: string) =>
      articleCatalog.filter((article) => article.category === category).length

    const kbdChip =
      'inline-flex min-w-6 items-center justify-center rounded-none border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border py-16 text-left sm:py-20 lg:py-24',
          props.className,
        )}
      >
        {/* Giant ghost anchor glyph — the page's reading-anchor watermark. */}
        <Watermark className="-top-24 right-0 font-mono text-[16rem] sm:text-[22rem] lg:-top-32 lg:text-[30rem]">
          #
        </Watermark>

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              {/* Mono breadcrumb rail: eyebrow — hairline — path. */}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                <Eyebrow variant="mono" className="shrink-0 tracking-[0.22em]">
                  {eyebrow}
                </Eyebrow>
                <span
                  aria-hidden="true"
                  className="h-px min-w-6 flex-1 bg-border"
                />
                <MonoTag
                  aria-hidden="true"
                  className="shrink-0 normal-case text-muted-foreground/60"
                >
                  ~/docs
                </MonoTag>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[0.98] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                <span
                  aria-hidden="true"
                  className="mr-3 font-mono font-bold text-primary/50"
                >
                  #
                </span>
                {heading}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </p>

              <SearchForm
                key={queryValue}
                onSubmit={docsSearch.submitSearch}
                className="mt-9 max-w-2xl"
                role="search"
                aria-label="Documentation search"
              >
                <SearchField>
                  <SearchFieldIcon className="left-0 top-1/2 -translate-y-1/2 pl-4">
                    <svg
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
                  </SearchFieldIcon>
                  <SearchFieldInput
                    type="search"
                    name="query"
                    aria-label="Search the documentation"
                    placeholder={searchPlaceholder}
                    defaultValue={queryValue}
                    className="rounded-none py-3.5 pl-11 pr-16 font-mono text-sm shadow-none outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                  <SearchFieldHint className="right-3 top-1/2 -translate-y-1/2">
                    <kbd className="hidden select-none items-center gap-1 rounded-none border border-border bg-muted px-2 py-1 font-mono text-xs font-medium text-muted-foreground sm:inline-flex">
                      ⌘K
                    </kbd>
                  </SearchFieldHint>
                </SearchField>
              </SearchForm>

              {showingResults ? (
                <Card
                  className="mt-3 max-w-2xl rounded-none p-0 text-left shadow-sm"
                  aria-live="polite"
                >
                  <p className="border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {matchingArticles.length} article
                    {matchingArticles.length === 1 ? '' : 's'} match{' '}
                    <span className="font-medium text-foreground">
                      {queryValue}
                    </span>
                  </p>
                  <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                    {matchingArticles.map((article) => (
                      <li key={article.slug}>
                        <NavbarRouteLink
                          className="flex w-full flex-col gap-0.5 rounded-none px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
                          href={article.title}
                        >
                          <span className="text-sm font-medium text-foreground">
                            <span
                              aria-hidden="true"
                              className="mr-2 font-mono font-normal text-muted-foreground/50"
                            >
                              #
                            </span>
                            {article.title}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                            {article.category}
                          </span>
                        </NavbarRouteLink>
                      </li>
                    ))}
                    {!matchingArticles.length ? (
                      <li className="px-4 py-4 text-center text-sm text-muted-foreground">
                        No articles match the current search.
                      </li>
                    ) : null}
                  </ul>
                </Card>
              ) : null}

              <div className="mt-8 grid grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none"
                  href={primaryTarget}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted active:translate-y-px"
                  href={secondaryTarget}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            {/* Right index rail — hairline-railed category ledger + shortcuts. */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="border-l border-border pl-8">
                <MonoTag
                  aria-hidden="true"
                  className="text-muted-foreground/70"
                >
                  [ index ]
                </MonoTag>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className="flex items-baseline justify-between gap-3 py-2.5"
                    >
                      <span className="font-mono text-xs text-foreground">
                        <span
                          aria-hidden="true"
                          className="mr-2 text-muted-foreground/50"
                        >
                          ##
                        </span>
                        {category}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                        {String(categoryCount(category)).padStart(2, '0')}
                      </span>
                    </li>
                  ))}
                </ul>

                <div aria-hidden="true" className="mt-10">
                  <MonoTag className="text-muted-foreground/70">
                    [ shortcuts ]
                  </MonoTag>
                  <dl className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        Search
                      </dt>
                      <dd className="flex gap-1">
                        <kbd className={kbdChip}>⌘</kbd>
                        <kbd className={kbdChip}>K</kbd>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        Navigate
                      </dt>
                      <dd className="flex gap-1">
                        <kbd className={kbdChip}>↑</kbd>
                        <kbd className={kbdChip}>↓</kbd>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        Open
                      </dt>
                      <dd className="flex gap-1">
                        <kbd className={kbdChip}>↵</kbd>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
