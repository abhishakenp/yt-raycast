import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AccountingFirmServices — capabilities grid for a CPA / accounting-firm site.
 * A centered heading + lede above a responsive 1-to-3 column grid of bordered
 * service cards, each with a filled primary icon tile, a title, a description,
 * and a check-marked feature list. A rotating set of finance-themed line icons
 * (document, chart, report, cash, scale, trend) cycles across the cards. Calm,
 * trustworthy professional-services aesthetic. Use to present offerings on
 * accounting firms, CPA practices, tax-preparation, bookkeeping/payroll, audit
 * & assurance, estate or retirement planning, or financial advisory sites.
 * Renders fully with no props via baked-in defaults.
 */
export const AccountingFirmServices = defineCapsule({
  name: 'AccountingFirmServices',
  description:
    'Services / capabilities grid for a CPA / accounting-firm site: a centered heading + lede above a responsive 1-to-3 column grid of bordered service cards, each with a filled primary icon tile, a title, a description, and a check-marked feature list. A rotating set of finance-themed line icons (document, chart, report, cash, scale, trend) cycles across cards. Calm professional-services look. Use to present offerings on accounting firms, CPA practices, tax-preparation, bookkeeping/payroll, audit & assurance, estate or retirement planning, or financial advisory sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Service cards: title, description and check-marked feature points. */
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
    const heading = props.heading ?? 'Comprehensive financial services'
    const description =
      props.description ??
      'From daily bookkeeping to complex tax strategy, we handle every aspect of your financial life with precision and care.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Tax Planning & Preparation',
            description:
              'Strategic tax planning for individuals and businesses. We maximize deductions, minimize liabilities, and ensure full compliance with federal, state, and local regulations.',
            points: [
              'Individual & business returns',
              'IRS audit representation',
              'Estate & trust tax planning',
            ],
          },
          {
            title: 'Business Advisory',
            description:
              'Growth-focused guidance for businesses at every stage. From startup formation to succession planning, we help you make informed financial decisions.',
            points: [
              'Cash flow management',
              'Business valuations',
              'M&A advisory services',
            ],
          },
          {
            title: 'Audit & Assurance',
            description:
              'Independent audit services that build stakeholder confidence. We deliver thorough, objective assessments with clear, actionable findings.',
            points: [
              'Financial statement audits',
              'Internal control reviews',
              'Compliance audits',
            ],
          },
          {
            title: 'Bookkeeping & Payroll',
            description:
              'Accurate, timely financial records that keep your business running smoothly. We handle the details so you can focus on growth.',
            points: [
              'Monthly bookkeeping',
              'Full-service payroll',
              'Accounts payable/receivable',
            ],
          },
          {
            title: 'Estate Planning',
            description:
              'Protect your legacy with comprehensive estate planning. We coordinate with attorneys to ensure your wealth transfers efficiently and tax-effectively.',
            points: [
              'Trust administration',
              'Wealth transfer strategies',
              'Charitable giving plans',
            ],
          },
          {
            title: 'Retirement Planning',
            description:
              'Build a secure future with personalized retirement strategies. We help you navigate 401(k)s, IRAs, pensions, and Social Security optimization.',
            points: [
              '401(k) & IRA optimization',
              'Social Security timing',
              'Distribution strategies',
            ],
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      <svg
        key="doc"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      <svg
        key="chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="report"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      <svg
        key="cash"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="scale"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>,
      <svg
        key="trend"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card
                key={item.title}
                variant="muted"
                rounded="lg"
                className="transition-colors hover:border-primary/40"
              >
                <div className="mb-5 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground [&>svg]:size-6">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 text-muted-foreground">{item.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
