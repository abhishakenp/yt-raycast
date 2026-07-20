import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { directoryLakebed } from './directory-lakebed.ts'
import { useDirectorySearch } from './directory-interactions.tsx'

/**
 * DirectoryCategories — classified-index category ledger for a local-business
 * directory. A paper section with an asymmetric header (serif heading +
 * description left, mono "24 sections" meta right) above a collapsed-border
 * 2-to-4-column ledger grid of clickable category cells: each sharp-cornered
 * cell carries an index numeral, a hairline stamp-box icon, the category title,
 * and a mono tabular listing count; the active cell gains a muted wash and a
 * rotated "Filed" stamp chip. A mono uppercase "View All" clear-filters action
 * closes the ledger. Every cell writes shared Lakebed category search state;
 * the view-all action clears it. Use to let users browse listing categories on
 * local directories, marketplaces, or city guides.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
} from '#/section-kit/CategoryGrid.tsx'
export const DirectoryCategories = defineCapsule({
  name: 'DirectoryCategories',
  description:
    'Classified-index category ledger for a local-business DIRECTORY: a paper section with an asymmetric header (serif heading and description left, mono meta right) above a collapsed-border 2-to-4-column ledger grid of clickable category cells — each sharp-cornered cell carries an index numeral, a hairline stamp-box icon, the category title, and a mono tabular listing count, and the active cell gains a muted wash plus a rotated Filed stamp chip. Every cell writes shared Lakebed category state so featured listings react; the mono View All action clears filters. Use to let users browse listing categories on local directories, business-listing marketplaces, find-a-service platforms, or city guides.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Category tiles (title + listing count). */
    items: z
      .array(
        z.object({
          title: z.string(),
          count: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: directoryLakebed,
  component: ({ props, lakebed }) => {
    const directorySearch = useDirectorySearch(lakebed)
    const heading = props.heading ?? 'Browse by Category'
    const description =
      props.description ??
      "Find exactly what you're looking for across dozens of local business categories"
    const viewAll = props.viewAll ?? 'View All 24 Categories'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Restaurants',
            count: '2,340 listings',
          },
          {
            title: 'Home Services',
            count: '1,850 listings',
          },
          {
            title: 'Beauty & Spas',
            count: '980 listings',
          },
          {
            title: 'Health & Medical',
            count: '1,240 listings',
          },
          {
            title: 'Real Estate',
            count: '670 listings',
          },
          {
            title: 'Automotive',
            count: '890 listings',
          },
          {
            title: 'Education',
            count: '520 listings',
          },
          {
            title: 'Retail',
            count: '2,100 listings',
          },
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
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              Index · A–Z
            </MonoTag>
          </div>

          <CategoryGrid
            cols="2-3-4"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((cat, i) => {
              const isActive = directorySearch.state?.category === cat.title
              return (
                <CategoryCard asChild key={cat.title}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() =>
                      directorySearch.chooseSearch({
                        category: cat.title,
                        query: '',
                      })
                    }
                    className={cn(
                      'group relative rounded-none border-b border-r border-l-0 border-t-0 border-border bg-background p-4 text-left transition-colors hover:bg-muted/60 active:translate-y-px sm:p-5',
                      isActive && 'bg-muted',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <CategoryIcon className="size-9 rounded-none border border-border bg-transparent text-muted-foreground transition-colors group-hover:border-foreground group-hover:text-foreground">
                        <span className="size-4 [&>svg]:size-4">
                          {categoryIcons[i % categoryIcons.length]}
                        </span>
                      </CategoryIcon>
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] tabular-nums text-muted-foreground/70"
                      >
                        {String(i + 1).padStart(3, '0')}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold tracking-tight text-foreground">
                      {cat.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                      {cat.count}
                    </p>
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-3 top-10 rotate-[-6deg] border border-primary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary"
                      >
                        Filed
                      </span>
                    ) : null}
                  </button>
                </CategoryCard>
              )
            })}
          </CategoryGrid>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() =>
                directorySearch.chooseSearch({
                  category: '',
                  query: '',
                })
              }
              className="inline-flex items-center gap-2 border-b border-foreground pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:text-muted-foreground active:translate-y-px"
            >
              {viewAll}
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
