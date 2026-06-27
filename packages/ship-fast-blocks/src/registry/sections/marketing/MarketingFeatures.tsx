import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MarketingFeatures — a centered-header 6-up feature grid for a SaaS /
 * product-marketing landing page. A bold centered heading + supporting line
 * over a responsive 1/2/3-column grid of bordered cards, each with a soft
 * indigo rounded icon tile, a bold title, and a description; cards lift and
 * raise a shadow on hover. Rotates a built-in set of line icons (boards,
 * collaboration, analytics, workflows, security, integrations). Clean premium
 * indigo-on-light aesthetic. Use to showcase product capabilities on B2B SaaS,
 * team/project-management, productivity, or developer-platform pages.
 */
export const MarketingFeatures = defineCapsule({
  name: 'MarketingFeatures',
  description:
    'Centered-header 6-up feature grid for a SaaS / product-marketing landing page: a bold centered heading + supporting line over a responsive 1/2/3-column grid of bordered cards, each with a soft indigo rounded icon tile, a bold title and a description, lifting with a raised shadow on hover. Rotates a built-in set of line icons (boards, collaboration, analytics, workflows, security, integrations). Clean premium indigo-on-light aesthetic. Use to showcase product capabilities on B2B SaaS, team/project-management, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything your team needs to ship faster'
    const description =
      props.description ??
      'Powerful, flexible tools that adapt to how you work — not the other way around.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Intuitive Task Boards',
            description:
              'Drag-and-drop Kanban boards that make it easy to visualize work, limit WIP, and spot bottlenecks before they derail your sprint.',
          },
          {
            title: 'Real-time Collaboration',
            description:
              'Work together in the same document, comment inline, and mention teammates so everyone stays aligned without endless threads.',
          },
          {
            title: 'Advanced Analytics',
            description:
              'Track velocity, burndown, and cycle time with beautiful dashboards. Turn raw data into actionable insights in one click.',
          },
          {
            title: 'Automated Workflows',
            description:
              'Automate repetitive tasks with customizable rules. Move cards, send updates, and trigger alerts so nothing slips through.',
          },
          {
            title: 'Enterprise Security',
            description:
              'SOC 2 Type II certified with end-to-end encryption, SSO, and granular permissions. Your data stays yours — always.',
          },
          {
            title: 'Seamless Integrations',
            description:
              'Connect with GitHub, Slack, Figma, and 50+ tools you already use. Keep your workflow in one place, not fifty.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="boards"
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>,
      <svg
        key="collab"
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      <svg
        key="analytics"
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
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>,
      <svg
        key="workflows"
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
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>,
      <svg
        key="security"
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
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>,
      <svg
        key="integrations"
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
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>,
    ]

    return (
      <section className={cn('py-20', props.className)}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-muted-foreground/30 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
              >
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-1.5 text-[1.0625rem] font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
