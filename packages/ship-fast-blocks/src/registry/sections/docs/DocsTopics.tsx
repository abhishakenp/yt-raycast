import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * DocsTopics — documentation category grid for a developer-docs or product-docs
 * landing page. Thin configuration over the shared `FeatureGrid` composite: a
 * centered heading block above a responsive grid of doc-category cards, each
 * with an inline line-icon tile (book, code brackets, graduation cap, document),
 * a short title, and a one-line description that points the reader toward the
 * right path (guides, API reference, tutorials, concept reference). Use as the
 * primary navigation surface on a docs home, help center, or knowledge-base
 * landing page to route readers from first steps to deep API reference. Clean,
 * theme-token developer-docs aesthetic. Renders fully with no props via baked-in
 * defaults.
 */
export const DocsTopics = defineCapsule({
  name: 'DocsTopics',
  description:
    'Documentation category grid for a developer-docs or product-docs landing page built on the shared FeatureGrid composite: a centered heading block above a responsive grid of doc-category cards, each with an inline line-icon tile (book, code brackets, graduation cap, document), a short title, and a one-line description routing the reader toward the right path (guides, API reference, tutorials, concept reference). Use as the primary navigation surface on a docs home, help center, or knowledge-base landing page to route readers from first steps to deep API reference. Clean developer-docs aesthetic using theme tokens only. Renders fully with no props.',
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={props.heading ?? 'Browse the docs'}
            subheading={
              props.subheading ??
              'Find the right path — from first steps to deep API reference.'
            }
            columns={props.columns ?? 4}
            features={topics.map((t, i) => ({
              title: t.title,
              description: t.description,
              icon: icons[i % icons.length],
            }))}
          />
        </Container>
      </section>
    )
  },
})
