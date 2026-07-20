import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AccountingFirmServices — Swiss-ledger numbered service table for a CPA /
 * accounting-firm site. An asymmetric header (left-aligned oversized title +
 * lede, right-aligned mono index meta column) above a collapsed-border two
 * column ledger grid: each service is a sharp-cornered cell sharing hairline
 * rules, with a small mono primary index ("01"–"06"), a giant ghost numeral
 * watermark, a title, a description, and its feature points set as an inline
 * mono uppercase list joined by "+" separators. Hovering a cell floods it with
 * a full ink inversion (foreground background, background text, 150ms). Grid
 * discipline and typographic authority in place of uniform icon cards. Use to
 * present offerings on accounting firms, CPA practices, tax-preparation,
 * bookkeeping/payroll, audit & assurance, estate or retirement planning, or
 * financial advisory sites. Renders fully with no props via baked-in defaults.
 */
export const AccountingFirmServices = defineCapsule({
  name: 'AccountingFirmServices',
  description:
    'Swiss-ledger numbered service table for a CPA / accounting-firm site: an asymmetric header (left-aligned oversized title + lede, right-aligned mono index meta) above a collapsed-border two-column ledger grid where each service cell shares hairline rules and carries a small mono primary index, a giant ghost numeral watermark, a title, a description, and feature points as an inline mono uppercase list joined by + separators; hover floods the cell with a full ink inversion. Use to present offerings on accounting firms, CPA practices, tax-preparation, bookkeeping/payroll, audit & assurance, estate or retirement planning, or financial advisory sites.',
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
      <section
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 grid items-end gap-6 sm:mb-14 lg:mb-16 lg:grid-cols-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-4 lg:col-span-8"
              titleClassName="text-4xl font-semibold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:col-span-4 lg:flex-col lg:items-end lg:justify-start lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Index
              </span>
              <span className="tabular-nums">
                01 — {String(items.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 border-l border-t border-border md:grid-cols-2">
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              const index = String(i + 1).padStart(2, '0')
              const points = __iv__.points ?? []
              return (
                <div
                  key={__iv__.title}
                  className="group relative border-b border-r border-border bg-background p-6 transition-colors duration-150 hover:bg-foreground sm:p-8 lg:p-10"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-5 select-none font-mono text-6xl font-bold tabular-nums text-foreground/[0.07] transition-colors duration-150 group-hover:text-background/10 sm:right-6 sm:top-6"
                  >
                    {index}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors duration-150 group-hover:text-background/70">
                    {index}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-background">
                    {__iv__.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground transition-colors duration-150 group-hover:text-background/70">
                    {__iv__.description}
                  </p>
                  {points.length > 0 && (
                    <p className="mt-6 font-mono text-[11px] uppercase leading-loose tracking-[0.12em] text-muted-foreground transition-colors duration-150 group-hover:text-background/60">
                      {points.map((point, j) => (
                        <span key={point}>
                          {j > 0 && (
                            <span
                              aria-hidden="true"
                              className="mx-2 text-primary transition-colors duration-150 group-hover:text-background/50"
                            >
                              +
                            </span>
                          )}
                          {point}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
