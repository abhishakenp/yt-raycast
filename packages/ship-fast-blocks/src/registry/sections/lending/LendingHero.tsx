import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * LendingHero — Swiss-fintech asymmetric 7/5 split hero for a personal-lending /
 * loan marketing page. The wider left column carries a mono index eyebrow, a
 * large tracking-tight two-tone headline (lead text plus a muted-accent highlight
 * phrase), a supporting subheading, dual CTAs (a square binary-radius primary
 * "check your rate" action with a hard offset shadow and mechanical press
 * feedback + a square ghost play-style secondary), and a hairline mono row of
 * check-marked trust badges. The narrower right column frames a sharp-cornered
 * loan-calculator ledger card with a hard offset shadow: a mono header, a
 * $-prefixed amount input, a credit-score select, a 3-up loan-term toggle, an
 * Est. APR / giant tabular-nums monthly-payment summary, and a full-width square
 * CTA — with a giant ghost "%" watermark bleeding behind. All controls route
 * through section-kit route links. Calm, precise, institutional; use as the top
 * section of personal-loan, debt-consolidation, or fintech-financing landing
 * pages. Renders fully with no props via baked-in "ClearLoan" defaults.
 */
export const LendingHero = defineCapsule({
  name: 'LendingHero',
  description:
    "Swiss-fintech asymmetric 7/5 split conversion hero for a personal-lending / loan marketing page: the wider left column has a mono index eyebrow, a large tracking-tight two-tone headline (lead + muted-accent highlight), a supporting subheading, dual CTAs (a square primary 'check your rate' action with a hard offset shadow + press feedback and a square ghost play-style secondary) and a hairline mono row of check-marked trust badges; the narrower right column frames a sharp-cornered loan-calculator ledger card with a hard offset shadow — a mono header, a $-prefixed amount input, a credit-score select, a 3-up loan-term toggle, an Est. APR / giant tabular-nums monthly-payment summary and a full-width square CTA — with a giant ghost '%' watermark behind. Controls route through section-kit route links. Use as the top section of personal-loan, debt-consolidation, BNPL, or fintech-financing landing pages.",
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
    const heroLead = props.headingLead ?? 'Personal loans made'
    const heroHighlight = props.headingHighlight ?? 'refreshingly simple'
    const heroSub =
      props.subheading ??
      'Borrow $1,000 to $50,000 with fixed rates starting at 6.99% APR. No hidden fees, no prepayment penalties, and funds as soon as tomorrow.'
    const heroPrimary = props.primaryCta ?? 'Check Your Rate'
    const heroSecondary = props.secondaryCta ?? 'See How It Works'
    const heroTrust = props.trust?.length
      ? props.trust
      : ['No impact to credit score', '2-minute application']
    const heroCardTitle = props.cardTitle ?? 'Loan Calculator'
    const heroCardSubtitle =
      props.cardSubtitle ?? 'Estimate your monthly payment'
    const heroAmountLabel = props.amountLabel ?? 'Loan Amount'
    const heroAmountValue = props.amountValue ?? '15000'
    const heroScoreLabel = props.scoreLabel ?? 'Credit Score'
    const heroScoreOptions = props.scoreOptions?.length
      ? props.scoreOptions
      : [
          'Excellent (750+)',
          'Good (700-749)',
          'Fair (650-699)',
          'Average (600-649)',
        ]
    const heroTermLabel = props.termLabel ?? 'Loan Term'
    const heroTerms = props.terms?.length
      ? props.terms
      : ['36 mo', '48 mo', '60 mo']
    const heroAprLabel = props.aprLabel ?? 'Est. APR'
    const heroAprValue = props.aprValue ?? '11.49%'
    const heroPaymentLabel = props.paymentLabel ?? 'Monthly Payment'
    const heroPaymentValue = props.paymentValue ?? '$389'
    const heroCardCta = props.cardCta ?? 'Get My Personalized Rate'

    const inputCls =
      'w-full rounded-none border border-input bg-muted px-4 py-3 font-medium text-foreground transition-[border-color,box-shadow] duration-150 outline-none focus:border-transparent focus:ring-2 focus:ring-ring'

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
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-top-16 right-[-3%] hidden text-[22rem] leading-none lg:block">
          %
        </Watermark>
        <Container
          size="xl"
          className="relative grid items-center gap-12 pb-24 pt-20 lg:grid-cols-12 lg:gap-16 lg:pb-40 lg:pt-32"
        >
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex items-center gap-3">
              <MonoTag className="text-primary">01 / Lending</MonoTag>
              <span aria-hidden="true" className="h-px w-8 bg-border" />
              <MonoTag tone="faint">Fixed-rate personal loans</MonoTag>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              {heroLead}{' '}
              <span className="text-muted-foreground">{heroHighlight}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {heroSub}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <NavbarRouteLink
                className="inline-flex items-center gap-2 rounded-none bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                href={heroPrimary}
              >
                {heroPrimary}
                <ArrowRight className="size-4" />
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center gap-2 rounded-none border border-border px-5 py-3.5 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                href={heroSecondary}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {heroSecondary}
              </NavbarRouteLink>
            </div>
            <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5">
              {heroTrust.map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  <Check className="size-3.5 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-5">
            <DotGrid
              tone="border"
              className="-right-4 -top-4 hidden size-24 sm:block"
            />
            <Card className="relative rounded-none border border-foreground bg-card p-7 shadow-[10px_10px_0_0] shadow-foreground sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <MonoTag className="text-primary">{heroCardTitle}</MonoTag>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {heroCardSubtitle}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50"
                >
                  [ est ]
                </span>
              </div>
              <div className="space-y-5">
                <FormField>
                  <FormFieldLabel className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {heroAmountLabel}
                  </FormFieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">
                      $
                    </span>
                    <FormFieldControl
                      type="number"
                      defaultValue={heroAmountValue}
                      className={cn(inputCls, 'pl-8 tabular-nums')}
                    />
                  </div>
                </FormField>
                <FormField>
                  <FormFieldLabel className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {heroScoreLabel}
                  </FormFieldLabel>
                  <FormFieldControl
                    as="select"
                    defaultValue={heroScoreOptions[2]}
                    className={cn(inputCls, 'appearance-none')}
                    options={heroScoreOptions}
                  />
                </FormField>
                <FormField>
                  <FormFieldLabel className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {heroTermLabel}
                  </FormFieldLabel>
                  <div className="grid grid-cols-3 gap-0 border-l border-t border-border">
                    {heroTerms.map((term, i) => (
                      <NavbarRouteLink
                        key={term}
                        className={cn(
                          'border-b border-r border-border px-4 py-3 text-center text-sm font-medium tabular-nums transition-colors duration-150',
                          i === 1
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        href={`${heroTermLabel}: ${term}`}
                      >
                        {term}
                      </NavbarRouteLink>
                    ))}
                  </div>
                </FormField>
                <div className="border-t border-border pt-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {heroAprLabel}
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-foreground">
                      {heroAprValue}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {heroPaymentLabel}
                    </span>
                    <span className="text-4xl font-extrabold leading-none tracking-tight tabular-nums text-foreground">
                      {heroPaymentValue}
                    </span>
                  </div>
                </div>
                <NavbarRouteLink
                  className="block w-full rounded-none bg-primary py-3.5 text-center text-sm font-medium text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:translate-y-px motion-reduce:transform-none"
                  href={heroCardCta}
                >
                  {heroCardCta}
                </NavbarRouteLink>
              </div>
            </Card>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
