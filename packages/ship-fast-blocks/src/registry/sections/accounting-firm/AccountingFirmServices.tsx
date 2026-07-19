import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

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

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
          />

          <FeatureGrid columns={3}>
            {items.map((f) => {
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
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
