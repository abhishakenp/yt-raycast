import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * DocsTopics — "Terminal-docs" category ledger for a developer-docs or
 * product-docs landing page. A muted wash band opens with a mono meta rule
 * (primary square, "sections" label, tabular section count) above an
 * asymmetric left-aligned heading block, then a collapsed-border ledger built
 * on the shared `FeatureGrid` composite: hairline-shared cells, each carrying
 * a tabular mono index numeral, a small line icon in the corner (book, code
 * brackets, graduation cap, document), a `#`-anchored bold title, and a
 * one-line description routing the reader toward the right path (guides, API
 * reference, tutorials, concept reference). Cells tint on hover instead of
 * lifting. Use as the primary navigation surface on a docs home, help
 * center, or knowledge-base landing page to route readers from first steps to
 * deep API reference. Theme tokens only. Renders fully with no props via
 * baked-in defaults.
 */
export const DocsTopics = defineCapsule({
  name: 'DocsTopics',
  description:
    "Terminal-docs category ledger for a developer-docs or product-docs landing page: a muted wash band with a mono meta rule (primary square + 'sections' label + tabular section count) above an asymmetric left-aligned heading block, then a collapsed-border hairline ledger built on the shared FeatureGrid composite — each cell carries a tabular mono index numeral, a small corner line icon (book, code brackets, graduation cap, document), a '#'-anchored bold title, and a one-line description routing the reader toward the right path (guides, API reference, tutorials, concept reference); cells tint on hover. Use as the primary navigation surface on a docs home, help center, or knowledge-base landing page to route readers from first steps to deep API reference. Theme tokens only. Renders fully with no props.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Doc-category cards — each a title + one-line description. */
    topics: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const Book = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
    const Code = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
    const GraduationCap = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
        <line x1="22" y1="10" x2="22" y2="16" />
      </svg>
    )
    const Document = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="8" y1="9" x2="10" y2="9" />
      </svg>
    )

    const icons: ReactNode[] = [Book, Code, GraduationCap, Document]

    const defaults = [
      {
        title: 'Guides',
        description: 'Step-by-step walkthroughs for common tasks.',
      },
      {
        title: 'API Reference',
        description: 'Complete endpoint and parameter reference.',
      },
      {
        title: 'Tutorials',
        description: 'End-to-end projects you can build along.',
      },
      {
        title: 'Reference',
        description: 'Config, CLI, and concept deep-dives.',
      },
    ]

    const topics = props.topics?.length ? props.topics : defaults

    return (
      <section
        className={cn(
          'border-b border-border bg-muted/30 pt-24 pb-16 lg:pt-28 lg:pb-24',
          props.className,
        )}
      >
        <Container>
          {/* Mono meta rule: label left, tabular section count right. */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Sections
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {String(topics.length).padStart(2, '0')} /{' '}
              {String(topics.length).padStart(2, '0')}
            </span>
          </div>

          <SectionHeading
            align="left"
            title={props.heading ?? 'Browse the docs'}
            subtitle={
              props.subheading ??
              'Find the right path — from first steps to deep API reference.'
            }
            className="max-w-2xl gap-3"
            titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
          />

          <FeatureGrid
            columns={props.columns ?? 4}
            className="mt-10 gap-0 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
            {topics
              .map((t, i) => ({
                title: t.title,
                description: t.description,
                icon: icons[i % icons.length],
              }))
              .map((f, i) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className="gap-0 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-colors hover:translate-y-0 hover:border-border hover:bg-background sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {__iv__.icon && (
                        <FeatureIcon className="size-auto rounded-none bg-transparent p-0 text-muted-foreground/70">
                          {__iv__.icon}
                        </FeatureIcon>
                      )}
                    </div>
                    <FeatureTitle className="mt-8 text-lg font-bold tracking-tight">
                      <span
                        aria-hidden="true"
                        className="mr-2 font-mono font-normal text-primary/60"
                      >
                        #
                      </span>
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription className="mt-2 text-sm leading-relaxed">
                      {__iv__.description}
                    </FeatureDescription>
                  </FeatureCard>
                )
              })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
