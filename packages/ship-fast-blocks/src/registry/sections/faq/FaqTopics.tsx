import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'
import { Card } from '#/section-kit/Card.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * FaqTopics — a "Browse by Topic" category grid for a help-center / knowledge-base
 * page. A left-aligned section heading above a responsive 1/2/3-column grid of
 * clickable card buttons; each card has a tinted rounded icon tile (rotating token
 * tints — rocket, card, kanban, plugs, shield, code), a bold title, a short
 * description, and an article-count link with a chevron that nudges on hover. Cards
 * route through useNavigate. Use as the topic/category browse section on SaaS
 * knowledge bases, help centers, documentation landings, or support pages. Renders
 * fully with no props via six baked-in support topics.
 */
export const FaqTopics = defineCapsule({
  name: 'FaqTopics',
  description:
    "A 'Browse by Topic' category grid for a help-center / knowledge-base page: a left-aligned section heading above a responsive 1/2/3-column grid of clickable card buttons. Each card has a tinted rounded icon tile (rotating token tints — rocket, card, kanban, plugs, shield, code), a bold title, a short description, and an article-count link with a chevron that nudges on hover. Cards route through useNavigate. Use as the topic/category browse section on SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Category cards: title + description + article count. */
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
    const go = useNavigate()
    const heading = props.heading ?? 'Browse by Topic'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Getting Started',
            description:
              'Set up your workspace, invite team members, and create your first project.',
            count: '24 articles',
          },
          {
            title: 'Account & Billing',
            description:
              'Manage subscriptions, payment methods, invoices, and seat allocations.',
            count: '18 articles',
          },
          {
            title: 'Projects & Tasks',
            description:
              'Learn about boards, workflows, task management, and automation rules.',
            count: '32 articles',
          },
          {
            title: 'Integrations',
            description:
              'Connect with Slack, GitHub, Figma, Zapier, and 50+ other tools.',
            count: '28 articles',
          },
          {
            title: 'Security & Access',
            description:
              'SSO configuration, SAML setup, permissions, and data protection.',
            count: '15 articles',
          },
          {
            title: 'API & Developers',
            description:
              'REST API documentation, webhooks, rate limits, and SDKs.',
            count: '42 articles',
          },
        ]

    const CaretRight = ({ className }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
    )

    const topicTints = [
      'bg-primary/10 text-primary',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-4/15 text-chart-4',
      'bg-chart-1/15 text-chart-1',
      'bg-destructive/10 text-destructive',
      'bg-chart-3/15 text-chart-3',
    ]
    const topicIcons: ReactNode[] = [
      <svg
        key="rocket"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      </svg>,
      <svg
        key="card"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>,
      <svg
        key="kanban"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="6" height="14" rx="1" />
        <rect x="15" y="3" width="6" height="9" rx="1" />
      </svg>,
      <svg
        key="plugs"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v4a6 6 0 0 1-12 0V8z" />
      </svg>,
      <svg
        key="shield"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      <svg
        key="code"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
    ]

    return (
      <section className={cn('bg-muted/40 py-12 sm:py-16', props.className)}>
        <Container>
          <h2 className="mb-8 text-lg font-semibold text-foreground">
            {heading}
          </h2>

          <ResponsiveGrid cols="1-2-3" gap="sm">
            {items.map((topic, i) => (
              <Card
                key={topic.title}
                asChild
                variant="default"
                rounded="xl"
                padding="md"
                className="group text-left transition-all hover:border-border/60 hover:shadow-sm"
              >
                <button type="button" onClick={() => go(topic.title)}>
                  <div
                    className={cn(
                      'mb-4 grid size-12 place-items-center rounded-lg transition-transform group-hover:scale-105',
                      topicTints[i % topicTints.length],
                    )}
                  >
                    {topicIcons[i % topicIcons.length]}
                  </div>
                  <h3 className="mb-1 font-semibold text-card-foreground">
                    {topic.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground">
                    {topic.count}
                    <CaretRight className="ml-1 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </Card>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
