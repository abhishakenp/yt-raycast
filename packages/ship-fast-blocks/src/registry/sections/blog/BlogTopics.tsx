import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
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
 * BlogTopics — a clean, editorial "Browse by topic" grid for a blog or
 * publication home page. Thin configuration over the shared `FeatureGrid`
 * composite: a quiet "Explore topics" heading, a short supporting subheading,
 * and a responsive four-column grid of topic cards. Each card pairs a small
 * stroke glyph (rendered inside the kit's `bg-primary/10 text-primary` icon
 * tile), a topic title, and a one-line description, so readers can scan the
 * subjects you write about most and jump straight in. Icons are cycled from a
 * baked pool by index, and every prop is optional — drop it onto a blog,
 * newsletter, magazine, or docs home and it renders fully from warm,
 * theme-token defaults (no hex, clean editorial aesthetic).
 */
export const BlogTopics = defineCapsule({
  name: 'BlogTopics',
  description:
    "Editorial 'Browse by topic' grid for a blog or publication home page: a quiet heading and short subheading above a responsive grid of topic cards, each with a small stroke icon in a primary-tinted tile, a category title, and a one-line description. Wraps the shared FeatureGrid composite at four columns and cycles a baked icon pool by index. Use to let readers browse blog categories/topics (design, engineering, product, culture, tutorials, careers, …). Renders fully with no props from theme-token defaults.",
  props: z.object({
    /** Section heading (maps to FeatureGrid heading). */
    heading: z.string().optional(),
    /** Short supporting line under the heading (maps to FeatureGrid subheading). */
    subheading: z.string().optional(),
    /** Topic categories; each maps to a FeatureGrid feature with an auto-assigned icon. */
    topics: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count; defaults to 4, which reads well for topics. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const topics =
      props.topics && props.topics.length > 0
        ? props.topics
        : [
            {
              title: 'Design',
              description:
                'Craft, visual systems, and the thinking behind how things look and feel.',
            },
            {
              title: 'Engineering',
              description:
                'Deep dives into the architecture, tooling, and code that ships our work.',
            },
            {
              title: 'Product',
              description:
                'How we decide what to build, prioritize, and ship to real users.',
            },
            {
              title: 'Culture',
              description:
                'Stories about how our team works, learns, and grows together.',
            },
            {
              title: 'Tutorials',
              description:
                'Step-by-step guides and practical walkthroughs you can follow along.',
            },
            {
              title: 'Careers',
              description:
                "Open roles, hiring notes, and what it's like to build here.",
            },
          ]

    const icons: ReactNode[] = [
      // pen / design
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>,
      // code / engineering
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
      </svg>,
      // box / product
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>,
      // users / culture
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // book / tutorials
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>,
      // briefcase / careers
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M2 13h20" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={props.heading ?? 'Explore topics'}
            subheading={
              props.subheading ?? 'Dive into the subjects we write about most.'
            }
            columns={props.columns ?? 4}
          >
            {topics
              .map((t, i) => ({
                title: t.title,
                description: t.description,
                icon: icons[i % icons.length],
              }))
              .map((f) => {
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
                  <FeatureCard key={__iv__.title}>
                    {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                    <FeatureTitle>{__iv__.title}</FeatureTitle>
                    <FeatureDescription>
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
