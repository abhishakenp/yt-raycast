import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * JobBoardCategories — a classified-index category ledger for a job-board /
 * careers site. A paper section with an asymmetric hairline header (serif
 * heading + description left, mono "By field" meta right) above a collapsed-border
 * 2-to-4-column ledger grid of clickable category cells: each sharp-cornered cell
 * carries an index numeral, a hairline stamp-box icon, the category title, and a
 * mono tabular job count; cells wash on hover and route through section-kit route
 * links. Use to let visitors jump into a field (Engineering, Design, Marketing…)
 * on job boards, hiring marketplaces, talent networks or directory-style
 * products. Renders fully with no props; built-in line icons rotate across the
 * items.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
} from '#/section-kit/CategoryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const JobBoardCategories = defineCapsule({
  name: 'JobBoardCategories',
  description:
    'Classified-index category ledger for a job-board / careers site: a paper section with an asymmetric hairline header (serif heading and description left, mono meta right) above a collapsed-border 2-to-4-column ledger grid of clickable category cells — each sharp-cornered cell carries an index numeral, a hairline stamp-box icon, the category title, and a mono tabular job count; cells wash on hover and route through section-kit route links. Use to let visitors jump into a field (Engineering, Design, Marketing…) on job boards, hiring marketplaces, talent networks or directory-style products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Category tiles: title + job-count caption. */
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
  component: ({ props }) => {
    const heading = props.heading ?? 'Browse by category'
    const description =
      props.description ??
      'Explore opportunities across industries and find roles that match your expertise'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Engineering',
            count: '2,847 jobs',
          },
          {
            title: 'Design',
            count: '1,523 jobs',
          },
          {
            title: 'Marketing',
            count: '982 jobs',
          },
          {
            title: 'Product',
            count: '756 jobs',
          },
          {
            title: 'Sales',
            count: '1,134 jobs',
          },
          {
            title: 'Finance',
            count: '643 jobs',
          },
          {
            title: 'Support',
            count: '421 jobs',
          },
          {
            title: 'Operations',
            count: '389 jobs',
          },
        ]
    const categoryIcons: ReactNode[] = [
      <svg
        key="code"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
      <svg
        key="pen"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>,
      <svg
        key="pie"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>,
      <svg
        key="bars"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>,
      <svg
        key="users"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      <svg
        key="dollar"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>,
      <svg
        key="headset"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>,
      <svg
        key="building"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
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
              By field · Index
            </MonoTag>
          </div>

          <CategoryGrid
            cols="2-3-4"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((cat, i) => (
              <CategoryCard
                asChild
                key={cat.title}
                className="rounded-none border-0"
              >
                <NavbarRouteLink
                  href={cat.title}
                  className="group relative block border-b border-r border-border bg-background p-4 text-left transition-colors hover:bg-muted/60 active:translate-y-px sm:p-5"
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
                </NavbarRouteLink>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Container>
      </section>
    )
  },
})
