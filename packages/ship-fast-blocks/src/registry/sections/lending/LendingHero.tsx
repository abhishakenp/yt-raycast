import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LendingHero — split, conversion-focused hero for a personal-lending / loan
 * marketing page. On the left: a large two-tone headline (lead text plus a
 * muted-accent highlight phrase), a supporting subheading, dual CTAs (a solid
 * primary "check your rate" pill with an arrow + a soft play-style secondary),
 * and a row of check-marked trust pills. On the right: a raised white
 * loan-calculator card with a titled header, a $-prefixed amount input, a credit
 * score select, a 3-up loan-term toggle, an Est. APR / monthly-payment summary,
 * and a full-width CTA button. All controls route through useNavigate. Use as the
 * top section of personal-loan, debt-consolidation, or fintech-financing landing
 * pages. Renders fully with no props via baked-in "ClearLoan" defaults.
 */
export const LendingHero = defineComponent({
  name: "LendingHero",
  description:
    "Split conversion hero for a personal-lending / loan marketing page: left column has a two-tone headline (lead + muted-accent highlight), supporting subheading, dual CTAs (solid primary 'check your rate' pill with arrow + soft play-style secondary) and check-marked trust pills; right column is a raised white loan-calculator card with a $-prefixed amount input, credit-score select, 3-up loan-term toggle, Est. APR / monthly-payment summary and a full-width CTA. Controls route through useNavigate. Use as the top section of personal-loan, debt-consolidation, BNPL, or fintech-financing landing pages.",
  props: z.object({
    headingLead: z.string().optional(),
    /** Phrase rendered in the muted accent tone. */
    headingHighlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    trust: z.array(z.string()).optional(),
    cardTitle: z.string().optional(),
    cardSubtitle: z.string().optional(),
    amountLabel: z.string().optional(),
    amountValue: z.string().optional(),
    scoreLabel: z.string().optional(),
    scoreOptions: z.array(z.string()).optional(),
    termLabel: z.string().optional(),
    terms: z.array(z.string()).optional(),
    aprLabel: z.string().optional(),
    aprValue: z.string().optional(),
    paymentLabel: z.string().optional(),
    paymentValue: z.string().optional(),
    cardCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroLead = props.headingLead ?? "Personal loans made"
    const heroHighlight = props.headingHighlight ?? "refreshingly simple"
    const heroSub =
      props.subheading ??
      "Borrow $1,000 to $50,000 with fixed rates starting at 6.99% APR. No hidden fees, no prepayment penalties, and funds as soon as tomorrow."
    const heroPrimary = props.primaryCta ?? "Check Your Rate"
    const heroSecondary = props.secondaryCta ?? "See How It Works"
    const heroTrust = props.trust?.length
      ? props.trust
      : ["No impact to credit score", "2-minute application"]
    const heroCardTitle = props.cardTitle ?? "Loan Calculator"
    const heroCardSubtitle =
      props.cardSubtitle ?? "Estimate your monthly payment"
    const heroAmountLabel = props.amountLabel ?? "Loan Amount"
    const heroAmountValue = props.amountValue ?? "15000"
    const heroScoreLabel = props.scoreLabel ?? "Credit Score"
    const heroScoreOptions = props.scoreOptions?.length
      ? props.scoreOptions
      : [
          "Excellent (750+)",
          "Good (700-749)",
          "Fair (650-699)",
          "Average (600-649)",
        ]
    const heroTermLabel = props.termLabel ?? "Loan Term"
    const heroTerms = props.terms?.length
      ? props.terms
      : ["36 mo", "48 mo", "60 mo"]
    const heroAprLabel = props.aprLabel ?? "Est. APR"
    const heroAprValue = props.aprValue ?? "11.49%"
    const heroPaymentLabel = props.paymentLabel ?? "Monthly Payment"
    const heroPaymentValue = props.paymentValue ?? "$389"
    const heroCardCta = props.cardCta ?? "Get My Personalized Rate"

    const inputCls =
      "w-full rounded-lg border border-input bg-muted px-4 py-3 font-medium text-foreground transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-ring"

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    return (
      <section className={cn("relative overflow-hidden", props.className)}>
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroLead}{" "}
                <span className="text-muted-foreground">{heroHighlight}</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-4 text-base font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {heroSecondary}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {heroTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {heroCardTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {heroCardSubtitle}
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {heroAmountLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        defaultValue={heroAmountValue}
                        className={cn(inputCls, "pl-8")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {heroScoreLabel}
                    </label>
                    <select
                      defaultValue={heroScoreOptions[2]}
                      className={cn(inputCls, "appearance-none")}
                    >
                      {heroScoreOptions.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      {heroTermLabel}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {heroTerms.map((term, i) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => go(`${heroTermLabel}: ${term}`)}
                          className={cn(
                            "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                            i === 1
                              ? "border-2 border-primary bg-muted text-foreground"
                              : "border border-border text-muted-foreground hover:border-primary hover:text-foreground",
                          )}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        {heroAprLabel}
                      </span>
                      <span className="text-lg font-semibold text-foreground">
                        {heroAprValue}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">
                        {heroPaymentLabel}
                      </span>
                      <span className="text-3xl font-semibold text-foreground">
                        {heroPaymentValue}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(heroCardCta)}
                    className="w-full rounded-xl bg-primary py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroCardCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
