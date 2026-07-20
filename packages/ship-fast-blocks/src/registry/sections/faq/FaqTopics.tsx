import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TopicGrid, TopicCard } from '#/section-kit/TopicGrid.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FaqTopics — an "Editorial Q&A" browse-by-topic ledger for a help-center /
 * knowledge-base page. A mono-eyebrow section heading with a hairline meta rail
 * (topic count on the right) above a collapsed-border hairline grid of square
 * (rounded-none) topic cells. Each cell leads with a giant ghost index numeral and a
 * small mono icon, then a tight-tracked title, a short description, and an
 * article-count link with a chevron that nudges on hover; the cell washes to muted on
 * hover with press feedback. Cards route through section-kit route links. Use as the
 * topic/category browse section on SaaS knowledge bases, help centers, documentation
 * landings, or support pages. Renders fully with no props via six baked-in support
 * topics.
 */
export const FaqTopics = defineCapsule({
  name: 'FaqTopics',
  description:
    "An 'Editorial Q&A' browse-by-topic ledger for a help-center / knowledge-base page: a mono-eyebrow section heading with a hairline meta rail (topic count) above a collapsed-border hairline grid of square (rounded-none) topic cells. Each cell leads with a giant ghost index numeral and a small mono icon, then a tight-tracked title, a short description, and an article-count link with a chevron that nudges on hover; the cell washes to muted on hover with press feedback. Cards route through section-kit route links. Use as the topic/category browse section on SaaS knowledge bases, help centers, documentation landings, or support pages.",
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

    const CaretRight = ({ className }: { className?: string }) => (
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
      <section
        className={cn(
          'border-t border-border bg-muted/40 py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-border pb-5">
            <SectionHeading
              align="left"
              eyebrow="Browse"
              title={heading}
              className="gap-2"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl"
            />
            <MonoTag
              tone="faint"
              aria-hidden="true"
              className="hidden shrink-0 tabular-nums sm:block"
            >
              {String(items.length).padStart(2, '0')} Topics
            </MonoTag>
          </div>

          <TopicGrid
            cols="1-2-3"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((topic, i) => (
              <TopicCard
                key={topic.title}
                asChild
                className="rounded-none border-0 border-b border-r border-border bg-transparent text-left text-card-foreground transition-colors hover:bg-background"
              >
                <NavbarRouteLink
                  href={topic.title}
                  className="flex h-full flex-col p-6 transition-transform duration-150 active:translate-y-px sm:p-8"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <span
                      aria-hidden="true"
                      className="font-mono text-4xl font-bold tabular-nums leading-none tracking-tighter text-foreground/15 transition-colors group-hover:text-foreground/30 sm:text-5xl"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                    >
                      {topicIcons[i % topicIcons.length]}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
                    {topic.title}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                  <span className="mt-auto inline-flex items-center border-t border-border pt-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80 group-hover:text-foreground">
                    {topic.count}
                    <CaretRight className="ml-2 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </span>
                </NavbarRouteLink>
              </TopicCard>
            ))}
          </TopicGrid>
        </Container>
      </section>
    )
  },
})
