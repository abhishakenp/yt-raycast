import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { FilterChip } from '#/section-kit/FilterChip.tsx'
import { knowledgeBaseLakebed } from './knowledge-base-lakebed.ts'
import {
  useKbSearch,
  useSyncKbCatalog,
} from './knowledge-base-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchFieldHint,
} from '#/section-kit/SearchForm.tsx'

/**
 * KnowledgeBaseHero — "Terminal-docs" search-forward lead band for a help
 * center / knowledge-base / support home. An asymmetric 8:4 reference spread
 * under a giant ghost `#` watermark: the left column opens with a mono
 * breadcrumb rail (primary square, mono eyebrow, hairline rule, `~/help`
 * path), a huge extrabold `#`-anchored headline, a muted lede, then a square
 * hairline mono search bar (a real `type="search"` input whose form submit
 * writes shared Lakebed search state and surfaces matching articles in a
 * collapsed-border result ledger) with a square `⌘K` kbd chip, and a row of
 * square mono "Popular" topic chips that each drive the same shared search.
 * The right rail (lg+) is a hairline-railed index: a collapsed-border category
 * ledger with tabular counts derived from the article catalog, plus a
 * kbd-chip shortcut table. Both the search form and popular chips write shared
 * Lakebed search criteria so article results render inline. Use as the top
 * hero of a help center, support portal, knowledge base, docs landing or FAQ
 * hub where an article-search-first entry point is wanted. Renders fully with
 * no props via baked-in defaults.
 */
export const KnowledgeBaseHero = defineCapsule({
  name: 'KnowledgeBaseHero',
  description:
    "Terminal-docs asymmetric 8:4 search-forward hero for a help-center / knowledge-base / support home under a giant ghost '#' watermark: a mono breadcrumb rail (primary square + mono eyebrow + hairline rule + '~/help' path), a huge extrabold '#'-anchored headline, a muted lede, a square hairline mono search bar with a '⌘K' kbd chip whose real type='search' input submit writes shared Lakebed search state and surfaces matching articles in a collapsed-border result ledger, and a row of square mono 'Popular' topic chips that drive the same shared search; the lg+ right rail is a hairline index with a category ledger (tabular counts) and a kbd-chip shortcut table. Both the search form and popular chips write shared Lakebed search criteria so results render inline. Use as the top hero of a help center, support portal, knowledge base, docs landing or FAQ hub where an article-search-first entry point is wanted. Theme tokens only.",
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

    const categories: string[] = []
    for (const article of articles) {
      if (article.category && !categories.includes(article.category)) {
        categories.push(article.category)
      }
    }
    const categoryCount = (category: string) =>
      articles.filter((article) => article.category === category).length

    const kbdChip =
      'inline-flex min-w-6 items-center justify-center rounded-none border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground'

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
                  Help Center
                </Eyebrow>
                <span
                  aria-hidden="true"
                  className="h-px min-w-6 flex-1 bg-border"
                />
                <MonoTag
                  aria-hidden="true"
                  className="shrink-0 normal-case text-muted-foreground/60"
                >
                  ~/help
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
                className="mt-9 max-w-2xl"
                role="search"
                aria-label="Knowledge base search"
                onSubmit={kbSearch.submitSearch}
              >
                <SearchField>
                  <SearchFieldIcon className="left-0 top-1/2 -translate-y-1/2 pl-4">
                    <SearchIcon className="size-5" />
                  </SearchFieldIcon>
                  <SearchFieldInput
                    name="query"
                    type="search"
                    defaultValue={queryValue}
                    placeholder={searchPlaceholder}
                    aria-label="Search help articles"
                    className="rounded-none py-3.5 pl-11 pr-16 font-mono text-sm shadow-none outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                  <SearchFieldHint className="right-3 top-1/2 -translate-y-1/2">
                    <kbd className="hidden select-none items-center gap-1 rounded-none border border-border bg-muted px-2 py-1 font-mono text-xs font-medium text-muted-foreground sm:inline-flex">
                      ⌘K
                    </kbd>
                  </SearchFieldHint>
                </SearchField>
              </SearchForm>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <MonoTag className="mr-1 text-muted-foreground/70">
                  {popularLabel}
                </MonoTag>
                {popular.map((topic) => (
                  <FilterChip
                    key={topic}
                    variant="muted"
                    size="sm"
                    className="rounded-none border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                    onClick={() => kbSearch.chooseSearch({ query: topic })}
                  >
                    {topic}
                  </FilterChip>
                ))}
              </div>

              {queryValue ? (
                <Card
                  className="mt-8 max-w-2xl rounded-none p-0 text-left shadow-sm"
                  aria-live="polite"
                >
                  <p className="border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {results.length} article{results.length === 1 ? '' : 's'}{' '}
                    for{' '}
                    <span className="font-medium text-foreground">
                      &ldquo;{queryValue}&rdquo;
                    </span>
                  </p>
                  <ul className="divide-y divide-border">
                    {results.map((article) => (
                      <li key={article.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          <span
                            aria-hidden="true"
                            className="mr-2 font-mono font-normal text-muted-foreground/50"
                          >
                            #
                          </span>
                          {article.title}
                        </p>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                          {article.category}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {article.content}
                        </p>
                      </li>
                    ))}
                    {!results.length ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No articles match your search.
                      </li>
                    ) : null}
                  </ul>
                </Card>
              ) : null}
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
