import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
} from '#/section-kit/CategoryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * KnowledgeBaseCategories — "Terminal-docs" browse-by-category ledger for a
 * help center. A left-aligned SectionHeading sits under a mono meta rule
 * (primary square, "sections" label, tabular category count) above a
 * collapsed-border hairline grid built on the shared `CategoryGrid`: each cell
 * carries a tabular mono index numeral and a small corner line glyph, a
 * `#`-anchored bold title, a short description and a mono article-count
 * caption; cells tint on hover instead of lifting. Calm, hairline-precise,
 * organized documentation aesthetic; every category card routes through
 * section-kit route links. Use to let visitors browse a knowledge base /
 * support portal by topic. Renders fully with no props via baked-in defaults.
 * Theme tokens only.
 */
export const KnowledgeBaseCategories = defineCapsule({
  name: 'KnowledgeBaseCategories',
  description:
    "Terminal-docs browse-by-category ledger for a help center: a left-aligned SectionHeading under a mono meta rule (primary square + 'sections' label + tabular category count) above a collapsed-border hairline grid built on the shared CategoryGrid — each cell carries a tabular mono index numeral and a small corner line glyph, a '#'-anchored bold title, a short description and a mono article-count caption; cells tint on hover. Calm, hairline-precise, organized documentation aesthetic; every category card routes through section-kit route links. Use to let visitors browse a knowledge base, support portal or docs site by topic. Theme tokens only.",
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
    const heading = props.heading ?? 'Browse by Category'
    const description =
      props.description ??
      'Find answers organized by topic, from getting started to advanced features.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Getting Started',
            description: 'Quick setup guides and first steps',
            count: '24 articles',
          },
          {
            title: 'Account Management',
            description: 'Profiles, settings, and security',
            count: '18 articles',
          },
          {
            title: 'Billing & Plans',
            description: 'Payments, invoices, and subscriptions',
            count: '15 articles',
          },
          {
            title: 'API & Developers',
            description: 'Documentation and code examples',
            count: '42 articles',
          },
          {
            title: 'Security & Privacy',
            description: '2FA, SSO, and data protection',
            count: '22 articles',
          },
          {
            title: 'Integrations',
            description: 'Third-party app connections',
            count: '31 articles',
          },
          {
            title: 'Troubleshooting',
            description: 'Common issues and solutions',
            count: '28 articles',
          },
          {
            title: 'Product Updates',
            description: 'Release notes and new features',
            count: '56 articles',
          },
        ]

    const categoryIcons: ReactNode[] = [
      <svg
        key="bolt"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>,
      <svg
        key="user"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>,
      <svg
        key="card"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>,
      <svg
        key="code"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 16 2 12 6 8" />
        <polyline points="18 8 22 12 18 16" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>,
      <svg
        key="shield"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      <svg
        key="puzzle"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 4a2 2 0 1 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 1 0-4 0v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H4a2 2 0 1 1 0-4h1a1 1 0 0 0 1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4z" />
      </svg>,
      <svg
        key="wrench"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.4 9.5l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.09c0 .67.4 1.27 1 1.51" />
      </svg>,
      <svg
        key="doc"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>,
    ]

    return (
      <section
        className={cn('bg-background py-16 sm:py-20', props.className)}
        aria-labelledby="kb-categories-heading"
      >
        <Container>
          {/* Mono meta rule: label left, tabular section count right. */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Sections
            </span>
            <span
              aria-hidden="true"
              className="tabular-nums text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} /{' '}
              {String(items.length).padStart(2, '0')}
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-2xl gap-3"
            titleId="kb-categories-heading"
            titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="text-muted-foreground"
          />
          <CategoryGrid
            cols="1-2-4"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((cat, i) => (
              <CategoryCard
                asChild
                key={cat.title}
                className="cursor-pointer rounded-none border-0 border-b border-r border-border bg-transparent p-6 text-left transition-colors hover:bg-muted/40"
              >
                <NavbarRouteLink
                  aria-label={`${cat.title} category, ${cat.count}`}
                  href={cat.title}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <CategoryIcon className="size-auto rounded-none bg-transparent p-0 text-muted-foreground/70 transition-colors group-hover:text-primary">
                      {categoryIcons[i % categoryIcons.length]}
                    </CategoryIcon>
                  </div>
                  <h3 className="mb-1 mt-8 text-lg font-bold tracking-tight text-card-foreground">
                    <span
                      aria-hidden="true"
                      className="mr-2 font-mono font-normal text-primary/60"
                    >
                      #
                    </span>
                    {cat.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] tabular-nums text-muted-foreground">
                    {cat.count}
                  </span>
                </NavbarRouteLink>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Container>
      </section>
    )
  },
})
