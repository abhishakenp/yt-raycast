import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardFeatures — a centered 3-up "why choose us" feature row for a job-board
 * / careers site. A muted band with a centered heading + description above a
 * 3-column grid of centered feature cards, each with a rounded outlined icon
 * chip, a bold title, and a supporting paragraph. Use to explain the value
 * proposition (verified employers, one-click apply, smart alerts) on job boards,
 * hiring marketplaces or recruiting platforms. Static (no links). Renders fully
 * with no props; built-in line icons rotate across the items.
 */
export const JobBoardFeatures = defineComponent({
  name: 'JobBoardFeatures',
  description:
    "Centered 3-up 'why choose us' feature row for a job-board / careers site: a muted band with a centered heading + description above a 3-column grid of centered feature cards, each with a rounded outlined icon chip, a bold title and a supporting paragraph. Use to explain the value proposition (verified employers, one-click apply, smart alerts) on job boards, hiring marketplaces or recruiting platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why job seekers choose WorkFlow'
    const description =
      props.description ??
      'We have designed every feature to help you land your dream job faster'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Verified Employers',
            description:
              'Every company is vetted to ensure legitimate opportunities. No scams, no fake listings, just real jobs from real businesses.',
          },
          {
            title: 'One-Click Apply',
            description:
              'Apply to multiple positions with your saved profile. No more filling out the same information over and over again.',
          },
          {
            title: 'Smart Alerts',
            description:
              'Get notified instantly when jobs matching your skills are posted. Be among the first applicants and increase your chances.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="check"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>,
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>,
      <svg
        key="bell"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>,
    ]

    return (
      <section className={cn('bg-muted/40 py-20', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((item, i) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-sm">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
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
