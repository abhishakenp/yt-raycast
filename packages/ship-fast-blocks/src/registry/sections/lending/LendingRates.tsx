import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * LendingRates — a transparent rates-and-fees band plus a sample payment-schedule
 * table on a muted section, for a lending or fintech marketing page. A centered
 * heading + description above a white card with a 3-up divided highlights row
 * (big stat + label + note) and a muted check-listed guarantees footer; below it,
 * a separate card holds a titled, horizontally-scrollable APR-by-credit-tier
 * table with a fine-print disclaimer note. Use to communicate honest pricing —
 * starting APR, $0 fees, sample monthly payments — on personal-loan, debt-
 * consolidation, or financing pages. Renders fully with no props via defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { RatesTable } from '#/section-kit/RatesTable.tsx'
export const LendingRates = defineCapsule({
  name: 'LendingRates',
  description:
    'Transparent rates-and-fees band + sample payment-schedule table on a muted section for a lending or fintech marketing page: centered heading + description above a white card with a 3-up divided highlights row (big stat + label + note) and a muted check-listed guarantees footer; below it a separate card with a titled, horizontally-scrollable APR-by-credit-tier table and a fine-print disclaimer. Use to communicate honest pricing — starting APR, $0 fees, sample monthly payments — on personal-loan, debt-consolidation, or financing pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    highlights: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    guarantees: z
      .array(
        z.object({
          title: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    tableTitle: z.string().optional(),
    tableHead: z.array(z.string()).optional(),
    tableRows: z.array(z.array(z.string())).optional(),
    tableNote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ratesHeading = props.heading ?? 'Transparent rates & terms'
    const ratesDesc =
      props.description ??
      "No surprises, no hidden fees. Know exactly what you're getting."
    const rateHighlights = props.highlights?.length
      ? props.highlights
      : [
          {
            value: '6.99%',
            label: 'Starting APR',
            note: 'For borrowers with excellent credit on 36-month terms',
          },
          {
            value: '$0',
            label: 'Origination Fee',
            note: 'Unlike banks that charge up to 8%, we take zero fees upfront',
          },
          {
            value: '$0',
            label: 'Prepayment Penalty',
            note: 'Pay off your loan early anytime with no extra charges',
          },
        ]
    const rateGuarantees = props.guarantees?.length
      ? props.guarantees
      : [
          {
            title: 'No late fees',
            note: "Life happens. We don't penalize honest mistakes.",
          },
          {
            title: 'No check fees',
            note: 'No extra charges for paper checks or payment methods.',
          },
          {
            title: 'No annual fees',
            note: 'Pay for your loan once, not every year.',
          },
        ]
    const tableTitle = props.tableTitle ?? 'Sample loan payment schedule'
    const tableHead = props.tableHead?.length
      ? props.tableHead
      : [
          'Credit Tier',
          'APR Range',
          '$10,000 / 36 mo',
          '$25,000 / 48 mo',
          '$40,000 / 60 mo',
        ]
    const tableRows = props.tableRows?.length
      ? props.tableRows
      : [
          [
            'Excellent (750+)',
            '6.99% - 9.99%',
            '$308 - $323',
            '$563 - $621',
            '$782 - $889',
          ],
          [
            'Good (700-749)',
            '8.99% - 12.99%',
            '$318 - $337',
            '$597 - $666',
            '$835 - $956',
          ],
          [
            'Fair (650-699)',
            '12.99% - 16.99%',
            '$337 - $357',
            '$666 - $736',
            '$956 - $1,075',
          ],
          [
            'Average (600-649)',
            '16.99% - 24.99%',
            '$357 - $393',
            '$736 - $858',
            '$1,075 - $1,260',
          ],
        ]
    const tableNote =
      props.tableNote ??
      '* Rates shown are estimates. Your actual rate will be determined after application review. All loans subject to credit approval.'
    return (
      <section className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {ratesHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{ratesDesc}</p>
          </div>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
              {rateHighlights.map((h) => (
                <div key={h.label} className="p-8 text-center">
                  <div className="mb-2 text-4xl font-bold text-card-foreground">
                    {h.value}
                  </div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {h.label}
                  </div>
                  <p className="text-sm text-muted-foreground">{h.note}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-muted px-8 py-6">
              <div className="grid gap-6 text-sm md:grid-cols-3">
                {rateGuarantees.map((g) => (
                  <div key={g.title} className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-medium text-foreground">
                        {g.title}
                      </span>
                      <p className="mt-1 text-muted-foreground">{g.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="mx-auto mt-8 max-w-5xl">
            <h3 className="mb-4 font-semibold text-card-foreground">
              {tableTitle}
            </h3>
            <div className="overflow-x-auto">
              <RatesTable className="w-full overflow-hidden text-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {tableHead.map((th) => (
                        <th
                          key={th}
                          className="px-4 py-3 text-left font-medium text-muted-foreground"
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {tableRows.map((row, ri) => (
                      <tr
                        key={row[0]}
                        className={cn(
                          ri < tableRows.length - 1 && 'border-b border-border',
                        )}
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={cn(
                              'px-4 py-3',
                              ci === 0 && 'font-medium',
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </RatesTable>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{tableNote}</p>
          </Card>
        </Container>
      </section>
    )
  },
})
