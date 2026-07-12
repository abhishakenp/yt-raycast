import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * InvestingPricing — 3-tier pricing table for an investing / fintech page. A
 * muted section band with a centered heading + lead above a responsive 3-column
 * grid of plan cards; the highlighted "Most Popular" tier inverts to a filled
 * primary surface with a floating badge, while others use bordered cards. Each
 * card shows name, tagline, big price + period, a check/cross feature list, and
 * a full-width CTA button routed through useNavigate. Use to present subscription
 * tiers for a brokerage, trading app or robo-advisor. Renders fully with no
 * props via Essential / Pro / Elite defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const InvestingPricing = defineCapsule({
  name: 'InvestingPricing',
  description:
    "3-tier pricing table for an investing / fintech page: a muted section band with a centered heading + lead above a responsive 3-column grid of plan cards; the highlighted 'Most Popular' tier inverts to a filled primary surface with a floating badge while others use bordered cards. Each card shows name, tagline, big price + period, a check/cross feature list, and a full-width CTA button routed through useNavigate. Use to present subscription tiers for a brokerage, trading app or robo-advisor.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Floating badge label on the popular tier. */
    popularLabel: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          popular: z.boolean().optional(),
          features: z.array(
            z.object({
              label: z.string(),
              included: z.boolean(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free and upgrade when you need more. No hidden fees, ever.'
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            tagline: 'Perfect for getting started',
            price: '$0',
            period: '/month',
            cta: 'Get started free',
            features: [
              {
                label: 'Commission-free trades',
                included: true,
              },
              {
                label: 'Basic charting tools',
                included: true,
              },
              {
                label: 'Stocks & ETFs',
                included: true,
              },
              {
                label: 'Mobile & web access',
                included: true,
              },
              {
                label: 'Advanced charts',
                included: false,
              },
              {
                label: 'Options trading',
                included: false,
              },
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious investors',
            price: '$9',
            period: '/month',
            cta: 'Start Pro trial',
            popular: true,
            features: [
              {
                label: 'Everything in Essential',
                included: true,
              },
              {
                label: 'Advanced charting (50+ indicators)',
                included: true,
              },
              {
                label: 'Options & crypto trading',
                included: true,
              },
              {
                label: 'AI-powered insights',
                included: true,
              },
              {
                label: 'Extended hours trading',
                included: true,
              },
              {
                label: 'Priority support',
                included: false,
              },
            ],
          },
          {
            name: 'Elite',
            tagline: 'For professional traders',
            price: '$29',
            period: '/month',
            cta: 'Contact sales',
            features: [
              {
                label: 'Everything in Pro',
                included: true,
              },
              {
                label: 'Level 2 market data',
                included: true,
              },
              {
                label: 'API access',
                included: true,
              },
              {
                label: 'Priority 24/7 support',
                included: true,
              },
              {
                label: 'Tax-loss harvesting',
                included: true,
              },
              {
                label: 'Dedicated account manager',
                included: true,
              },
            ],
          },
        ]
    const Check = ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const Cross = ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    return (
      <section
        id="pricing"
        className={cn('bg-muted/50 py-24', props.className)}
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-2xl p-8',
                  tier.popular
                    ? 'border-2 border-primary bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-card-foreground',
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-chart-1 px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {popularLabel}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold">{tier.name}</h3>
                  <p
                    className={cn(
                      'text-sm',
                      tier.popular
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.tagline}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-semibold">{tier.price}</span>
                  <span
                    className={cn(
                      tier.popular
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feat) => (
                    <li key={feat.label} className="flex items-start gap-3">
                      {feat.included ? (
                        <Check
                          className={cn(
                            'mt-0.5 size-5 flex-shrink-0',
                            tier.popular
                              ? 'text-primary-foreground'
                              : 'text-chart-1',
                          )}
                        />
                      ) : (
                        <Cross
                          className={cn(
                            'mt-0.5 size-5 flex-shrink-0',
                            tier.popular
                              ? 'text-primary-foreground/40'
                              : 'text-muted-foreground/40',
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          feat.included
                            ? tier.popular
                              ? 'text-primary-foreground/90'
                              : 'text-muted-foreground'
                            : tier.popular
                              ? 'text-primary-foreground/50'
                              : 'text-muted-foreground/50',
                        )}
                      >
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className={cn(
                    'block w-full rounded-xl py-3 text-center font-medium transition-colors',
                    tier.popular
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'bg-muted text-foreground hover:bg-accent',
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
