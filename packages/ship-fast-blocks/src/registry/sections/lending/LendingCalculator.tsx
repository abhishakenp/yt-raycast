import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * LendingCalculator — Swiss-fintech interactive personalized-rate calculator
 * ledger for a lending or fintech marketing page. An asymmetric left-aligned
 * header (mono index eyebrow + heading + description) sits above a sharp-cornered
 * two-column card with a hard offset shadow: the left "loan details" pane has a
 * mono-labelled amount range slider (with min/max captions), a purpose select, a
 * 3-up collapsed-border loan-term toggle, and a 2-up credit-tier picker; the
 * right muted "estimated offer" pane shows a giant tabular-nums monthly-payment
 * figure, a hairline key/value summary ledger (free items in the primary tone), a
 * full-width square CTA with press feedback, and a reassuring mono sub-note. All
 * controls route through section-kit route links. Use to let visitors estimate
 * loan terms on personal-loan, debt-consolidation, or financing pages. Renders
 * fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { LoanCalculator, LoanDisplay } from '#/section-kit/LoanCalculator.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LendingCalculator = defineCapsule({
  name: 'LendingCalculator',
  description:
    "Swiss-fintech interactive personalized-rate calculator ledger for a lending or fintech marketing page: an asymmetric left-aligned header (mono index eyebrow + heading + description) above a sharp-cornered two-column card with a hard offset shadow — left 'loan details' pane has a mono-labelled amount range slider (min/max captions), a purpose select, a 3-up collapsed-border loan-term toggle and a 2-up credit-tier picker; right muted 'estimated offer' pane shows a giant tabular-nums monthly-payment figure, a hairline key/value summary ledger (free items in the primary tone), a full-width square CTA with press feedback and a reassuring mono sub-note. Controls route through section-kit route links. Use to let visitors estimate loan terms on personal-loan, debt-consolidation, or financing pages.",
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
      'w-full rounded-none border border-input bg-muted px-4 py-3 font-medium text-foreground transition-[border-color,box-shadow] duration-150 outline-none focus:border-transparent focus:ring-2 focus:ring-ring'
    const labelCls =
      'mb-3 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'
    return (
      <LoanCalculator asChild>
        <section className={cn('py-24 lg:py-28', props.className)}>
          <Container>
            <div className="mb-12 border-b border-border pb-6 lg:mb-16">
              <SectionHeading
                align="left"
                eyebrow="02 / Estimate"
                title={calcHeading}
                subtitle={calcDesc}
                className="max-w-3xl gap-3"
                eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
                titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-none border border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground">
                <div className="grid lg:grid-cols-2">
                  <div className="p-8 lg:p-10">
                    <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {calcDetailsTitle}
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="mb-3 flex justify-between text-sm font-medium text-foreground">
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {calcAmountLabel}
                          </span>
                          <span className="font-semibold tabular-nums text-foreground">
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
                          className="h-2 w-full cursor-pointer appearance-none rounded-none bg-muted accent-primary"
                        />
                        <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
                          <span>{calcAmountMin}</span>
                          <span>{calcAmountMax}</span>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>{calcPurposeLabel}</label>
                        <select
                          className={cn(
                            inputCls,
                            'appearance-none font-normal',
                          )}
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
                          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {calcTermLabel}
                          </span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {calcTermValue}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-0 border-l border-t border-border">
                          {calcTerms.map((term, i) => (
                            <NavbarRouteLink
                              key={term}
                              className={cn(
                                'border-b border-r border-border px-4 py-3 text-center text-sm font-medium tabular-nums transition-colors duration-150',
                                i === 1
                                  ? 'bg-foreground text-background'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              )}
                              href={`${calcTermLabel}: ${term}`}
                            >
                              {term}
                            </NavbarRouteLink>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>{calcScoreLabel}</label>
                        <div className="grid grid-cols-2 gap-0 border-l border-t border-border">
                          {calcScores.map((s, i) => (
                            <NavbarRouteLink
                              key={s.tier}
                              className={cn(
                                'border-b border-r border-border px-4 py-3 text-left text-sm font-medium transition-colors duration-150',
                                i === 0
                                  ? 'bg-foreground text-background'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              )}
                              href={`Credit: ${s.tier}`}
                            >
                              <div className="font-semibold">{s.tier}</div>
                              <div
                                className={cn(
                                  'text-xs tabular-nums',
                                  i === 0
                                    ? 'text-background/70'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {s.range}
                              </div>
                            </NavbarRouteLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <LoanDisplay className="border-t border-border bg-muted p-8 lg:border-l lg:border-t-0 lg:p-10">
                    <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {calcOfferTitle}
                    </h3>
                    <div className="space-y-6">
                      <Card className="rounded-none border border-border">
                        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {calcPaymentLabel}
                        </div>
                        <div className="text-5xl font-extrabold leading-none tracking-tight tabular-nums text-card-foreground">
                          {calcPaymentValue}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {calcPaymentNote}
                        </div>
                      </Card>
                      <div className="border-l border-t border-border">
                        {calcSummary.map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between border-b border-r border-border px-4 py-2.5"
                          >
                            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                              {row.label}
                            </span>
                            <span
                              className={cn(
                                'font-medium tabular-nums',
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
                      <div className="pt-2">
                        <NavbarRouteLink
                          className="block w-full rounded-none bg-primary py-3.5 text-center text-sm font-medium text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:translate-y-px motion-reduce:transform-none"
                          href={calcCta}
                        >
                          {calcCta}
                        </NavbarRouteLink>
                        <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          {calcCtaNote}
                        </p>
                      </div>
                    </div>
                  </LoanDisplay>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </LoanCalculator>
    )
  },
})
