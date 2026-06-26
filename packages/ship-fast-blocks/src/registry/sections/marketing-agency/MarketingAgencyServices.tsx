import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyServices — a 6-up services / capabilities grid. A centered
 * eyebrow + heading + description above a responsive grid of muted rounded cards
 * (1/2/3 columns), each with a filled primary icon tile, a service title, a short
 * description, and a bulleted list of capabilities with small dot markers; cards
 * lift to an accent surface on hover. Icons rotate through a built-in set
 * (chart, search, mail, pie, users, document). Use to present marketing-agency
 * service lines (performance marketing, SEO, email, CRO, social, analytics).
 * Renders fully with no props.
 */
export const MarketingAgencyServices = defineComponent({
  name: 'MarketingAgencyServices',
  description:
    '6-up services / capabilities grid: a centered eyebrow + heading + description above a responsive grid of muted rounded cards (1/2/3 columns), each with a filled primary icon tile, a service title, a short description, and a bulleted capability list with dot markers; cards lift to an accent surface on hover. Icons rotate through a built-in set (chart, search, mail, pie, users, document). Use to present marketing-agency service lines such as performance marketing, SEO & content, email, CRO, social, and analytics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading = props.heading ?? 'Growth Strategies That Work'
    const description =
      props.description ??
      'We combine data science with creative excellence to deliver measurable results across every channel.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Performance Marketing',
            description:
              'Google Ads, Meta, LinkedIn, and TikTok campaigns optimized for ROAS. We manage $2M+ in monthly ad spend with an average 4.2x return.',
            points: [
              'Audience segmentation',
              'Creative A/B testing',
              'Conversion tracking',
            ],
          },
          {
            title: 'SEO & Content',
            description:
              "Technical SEO audits, content strategy, and link building. We've helped clients rank #1 for 5,000+ competitive keywords.",
            points: [
              'Technical audits',
              'Content clusters',
              'Authority building',
            ],
          },
          {
            title: 'Email Marketing',
            description:
              'Automated sequences, newsletters, and retention campaigns. Our clients see 35%+ open rates and $45 average revenue per email.',
            points: ['Lifecycle automation', 'Segmentation', 'A/B testing'],
          },
          {
            title: 'Conversion Optimization',
            description:
              'CRO audits, user research, and landing page optimization. Average 23% lift in conversion rates within 60 days.',
            points: ['Heatmap analysis', 'User testing', 'Landing page design'],
          },
          {
            title: 'Social Media',
            description:
              'Organic strategy, content creation, and community management. We grew client followings by 2M+ across platforms last year.',
            points: [
              'Content calendars',
              'Video production',
              'Influencer outreach',
            ],
          },
          {
            title: 'Analytics & Reporting',
            description:
              'Custom dashboards, attribution modeling, and actionable insights. Know exactly which campaigns drive revenue.',
            points: [
              'Custom dashboards',
              'Attribution modeling',
              'Weekly reports',
            ],
          },
        ]

    const serviceIcons: ReactNode[] = [
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="search"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
      <svg
        key="mail"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg
        key="doc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
