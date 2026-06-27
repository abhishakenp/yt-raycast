import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CrmFeatures — centered, multi-column feature grid for a CRM / sales-platform
 * landing page. A heading + supporting paragraph above a responsive 1/2/3-up
 * grid of bordered cards, each with a soft tinted icon tile (rotating line
 * icons: pipeline, clock, AI bulb, team, report, mobile), a title and a
 * description; cards lift with a hover shadow. Clean and professional. Use to
 * showcase the core capabilities of a CRM, sales-enablement or B2B SaaS product.
 * Renders fully with no props.
 */
export const CrmFeatures = defineCapsule({
  name: 'CrmFeatures',
  description:
    'Centered multi-column feature grid for a CRM / sales-platform landing page: a heading + supporting paragraph above a responsive 1/2/3-up grid of bordered cards, each with a soft tinted icon tile (rotating line icons for pipeline, activity, AI, team, reporting, mobile), a title and a description; cards lift with a hover shadow. Clean and professional. Use to showcase the core capabilities of a CRM, sales-enablement or B2B SaaS product.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything your sales team needs'
    const description =
      props.description ??
      'From lead capture to deal closure, Pipeline Pro provides a complete toolkit for modern sales operations.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Visual Pipeline',
            description:
              "Drag-and-drop Kanban boards customized to your sales process. See every deal's status at a glance with color-coded stages.",
          },
          {
            title: 'Activity Tracking',
            description:
              'Log calls, emails, and meetings automatically. Never lose track of customer interactions with a complete activity timeline.',
          },
          {
            title: 'AI Forecasting',
            description:
              'Predict revenue with machine learning based on historical data, deal velocity, and seasonal patterns. 94% accuracy rate.',
          },
          {
            title: 'Team Collaboration',
            description:
              'Share contacts, assign leads, and collaborate on deals. @mentions, comments, and real-time notifications keep everyone aligned.',
          },
          {
            title: 'Advanced Reporting',
            description:
              'Build custom dashboards with 50+ metrics. Track conversion rates, sales cycle length, and rep performance in real-time.',
          },
          {
            title: 'Mobile App',
            description:
              'Update deals, check schedules, and log activities on the go. Native iOS and Android apps with offline mode support.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="pipeline"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>,
      <svg
        key="activity"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="ai"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="team"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="reporting"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      <svg
        key="mobile"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-border hover:shadow-lg"
              >
                <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
