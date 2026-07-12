import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * LendingCalculator — an interactive personalized-rate calculator panel for a
 * lending or fintech marketing page. A centered heading + description above a
 * two-column white card: the left "loan details" pane has a labelled amount range
 * slider (with min/max captions), a purpose select, a 3-up loan-term toggle, and
 * a 2-up credit-tier picker; the right muted "estimated offer" pane shows a large
 * monthly-payment figure, a key/value summary list (free items highlighted in the
 * primary tone), a full-width primary CTA and a reassuring sub-note. All controls
 * route through useNavigate. Use to let visitors estimate loan terms on personal-
 * loan, debt-consolidation, or financing pages. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LendingCalculator = defineCapsule({
  name: 'LendingCalculator',
  description:
    "Interactive personalized-rate calculator panel for a lending or fintech marketing page: centered heading + description above a two-column white card — left 'loan details' pane has a labelled amount range slider (min/max captions), a purpose select, a 3-up loan-term toggle and a 2-up credit-tier picker; right muted 'estimated offer' pane shows a large monthly-payment figure, a key/value summary list (free items in the primary tone), a full-width primary CTA and a reassuring sub-note. Controls route through useNavigate. Use to let visitors estimate loan terms on personal-loan, debt-consolidation, or financing pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    detailsTitle: z.string().optional(),
    amountLabel: z.string().optional(),
    amountValue: z.string().optional(),
    amountMin: z.string().optional(),
    amountMax: z.string().optional(),
    purposeLabel: z.string().optional(),
    purposes: z.array(z.string()).optional(),
    termLabel: z.string().optional(),
    termValue: z.string().optional(),
    terms: z.array(z.string()).optional(),
    scoreLabel: z.string().optional(),
    scores: z
      .array(
        z.object({
          tier: z.string(),
          range: z.string(),
        }),
      )
      .optional(),
    offerTitle: z.string().optional(),
    paymentLabel: z.string().optional(),
    paymentValue: z.string().optional(),
    paymentNote: z.string().optional(),
    summary: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
    cta: z.string().optional(),
    ctaNote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const calcHeading = props.heading ?? 'Personalized rate calculator'
    const calcDesc =
      props.description ?? 'See what you could save with a ClearLoan.'
    const calcDetailsTitle = props.detailsTitle ?? 'Loan Details'
    const calcAmountLabel = props.amountLabel ?? 'Loan Amount'
    const calcAmountValue = props.amountValue ?? '20,000'
    const calcAmountMin = props.amountMin ?? '$1,000'
    const calcAmountMax = props.amountMax ?? '$50,000'
    const calcPurposeLabel = props.purposeLabel ?? 'Loan Purpose'
    const calcPurposes = props.purposes?.length
      ? props.purposes
      : [
          'Debt Consolidation',
          'Home Improvement',
          'Medical Expenses',
          'Auto Purchase',
          'Education',
          'Major Purchase',
          'Vacation',
          'Other',
        ]
    const calcTermLabel = props.termLabel ?? 'Loan Term'
    const calcTermValue = props.termValue ?? '48 months'
    const calcTerms = props.terms?.length
      ? props.terms
      : ['36 mo', '48 mo', '60 mo']
    const calcScoreLabel = props.scoreLabel ?? 'Your Credit Score Range'
    const calcScores = props.scores?.length
      ? props.scores
      : [
          {
            tier: 'Excellent',
            range: '750+',
          },
          {
            tier: 'Good',
            range: '700-749',
          },
          {
            tier: 'Fair',
            range: '650-699',
          },
          {
            tier: 'Average',
            range: '600-649',
          },
        ]
    const calcOfferTitle = props.offerTitle ?? 'Estimated Offer'
    const calcPaymentLabel = props.paymentLabel ?? 'Monthly Payment'
    const calcPaymentValue = props.paymentValue ?? '$478'
    const calcPaymentNote = props.paymentNote ?? 'per month for 48 months'
    const calcSummary = props.summary?.length
      ? props.summary
      : [
          {
            label: 'Loan Amount',
            value: '$20,000',
          },
          {
            label: 'Est. APR',
            value: '8.99%',
          },
          {
            label: 'Origination Fee',
            value: '$0',
          },
          {
            label: 'Total Interest',
            value: '$2,944',
          },
        ]
    const calcCta = props.cta ?? 'Get My Real Rate'
    const calcCtaNote =
      props.ctaNote ?? "Checking won't affect your credit score"
    const inputCls =
      'w-full rounded-lg border border-input bg-muted px-4 py-3 font-medium text-foreground transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-ring'
    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {calcHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{calcDesc}</p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-10">
                  <h3 className="mb-6 text-lg font-semibold text-card-foreground">
                    {calcDetailsTitle}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 flex justify-between text-sm font-medium text-foreground">
                        <span>{calcAmountLabel}</span>
                        <span className="font-semibold text-foreground">
                          ${calcAmountValue}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={50000}
                        step={500}
                        defaultValue={20000}
                        aria-label={calcAmountLabel}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                      />
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>{calcAmountMin}</span>
                        <span>{calcAmountMax}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">
                        {calcPurposeLabel}
                      </label>
                      <select
                        className={cn(inputCls, 'appearance-none font-normal')}
                      >
                        {calcPurposes.map((p) => (
                          <option key={p} className="bg-background">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="mb-3 flex justify-between text-sm font-medium text-foreground">
                        <span>{calcTermLabel}</span>
                        <span className="font-semibold text-foreground">
                          {calcTermValue}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {calcTerms.map((term, i) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => go(`${calcTermLabel}: ${term}`)}
                            className={cn(
                              'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                              i === 1
                                ? 'border-2 border-primary bg-muted text-foreground'
                                : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground',
                            )}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-foreground">
                        {calcScoreLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {calcScores.map((s, i) => (
                          <button
                            key={s.tier}
                            type="button"
                            onClick={() => go(`Credit: ${s.tier}`)}
                            className={cn(
                              'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                              i === 0
                                ? 'border-2 border-primary bg-muted text-foreground'
                                : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground',
                            )}
                          >
                            <div className="font-semibold">{s.tier}</div>
                            <div className="text-xs text-muted-foreground">
                              {s.range}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border bg-muted p-8 lg:border-l lg:border-t-0 lg:p-10">
                  <h3 className="mb-6 text-lg font-semibold text-foreground">
                    {calcOfferTitle}
                  </h3>
                  <div className="space-y-6">
                    <Card>
                      <div className="mb-1 text-sm text-muted-foreground">
                        {calcPaymentLabel}
                      </div>
                      <div className="text-4xl font-bold text-card-foreground">
                        {calcPaymentValue}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {calcPaymentNote}
                      </div>
                    </Card>
                    <div className="space-y-3">
                      {calcSummary.map((row, i) => (
                        <div
                          key={row.label}
                          className={cn(
                            'flex justify-between py-2',
                            i < calcSummary.length - 1 &&
                              'border-b border-border',
                          )}
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span
                            className={cn(
                              'font-medium',
                              row.value === '$0'
                                ? 'text-primary'
                                : 'text-foreground',
                            )}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => go(calcCta)}
                        className="w-full rounded-xl bg-primary py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {calcCta}
                      </button>
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        {calcCtaNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
