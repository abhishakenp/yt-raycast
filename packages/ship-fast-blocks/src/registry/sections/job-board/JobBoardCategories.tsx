import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * JobBoardCategories — a browse-by-category icon grid for a job-board / careers
 * site. A centered heading + description above a responsive 2/3/4-column grid of
 * tappable category tiles, each with a rounded icon chip, a category title, and a
 * per-category job count; tiles lift on hover and route through useNavigate. Use
 * to let visitors jump into a field (Engineering, Design, Marketing…) on job
 * boards, hiring marketplaces, talent networks or directory-style products.
 * Renders fully with no props; built-in line icons rotate across the items.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
} from '#/section-kit/CategoryGrid.tsx'
export const JobBoardCategories = defineCapsule({
  name: 'JobBoardCategories',
  description:
    'Browse-by-category icon grid for a job-board / careers site: a centered heading + description above a responsive 2/3/4-column grid of tappable category tiles, each with a rounded icon chip, a category title and a per-category job count; tiles lift on hover and route through useNavigate. Use to let visitors jump into a field (Engineering, Design, Marketing…) on job boards, hiring marketplaces, talent networks or directory-style products.',
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-20', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-12 gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight text-foreground"
            subtitleClassName="mx-auto max-w-xl text-muted-foreground"
          />
          <CategoryGrid cols="2-3-4" gap="sm">
            {items.map((cat, i) => (
              <CategoryCard
                asChild
                key={cat.title}
                className="bg-muted/40 p-6 text-left transition-all hover:border-foreground/30 hover:shadow-md"
              >
                <button type="button" onClick={() => go(cat.title)}>
                  <CategoryIcon className="bg-card text-foreground shadow-sm">
                    {categoryIcons[i % categoryIcons.length]}
                  </CategoryIcon>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cat.count}</p>
                </button>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Container>
      </section>
    )
  },
})
