import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierTagline,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AuthPricing — three-tier pricing table for Authly, a developer authentication
 * product. A centered heading sits above Free, Pro (highlighted and lifted),
 * and Enterprise cards, each carrying an oversized tabular price, the included
 * MAUs, auth features, and support level. Free and Pro CTAs route to sign-up
 * while Enterprise routes to a sales contact. Use to price an auth platform,
 * identity API, or login SDK. Renders fully with no props.
 */
export const AuthPricing = defineCapsule({
  name: 'AuthPricing',
  description:
    "Three-tier pricing table for a developer-auth product backed by shared Lakebed conversion state: a centered heading ('Simple, usage-based pricing') above Free, Pro (highlighted and lifted), and Enterprise cards, each carrying an oversized tabular price and listing included MAUs, auth features, and support level. Plans seed the command search catalog; scoped CTAs record sign-up or sales intent without fake navigation. Use to price an auth platform, identity API, or login SDK.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading. */
    subheading: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, usage-based pricing'
    const subheading =
      props.subheading ??
      'Start free and only pay as your monthly active users grow. No seat fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            price: '$0',
            period: '/ mo',
            features: [
              '10,000 monthly active users',
              'Social & email login',
              'Magic links & passkeys',
              'Community support',
            ],
            cta: 'Start Free',
            ctaTarget: 'Sign Up',
          },
          {
            name: 'Pro',
            price: '$99',
            period: '/ mo',
            highlighted: true,
            features: [
              '100,000 monthly active users',
              'MFA & 2FA enforcement',
              'User management dashboard',
              'Custom domains & branding',
              'Email support',
            ],
            cta: 'Start Pro',
            ctaTarget: 'Sign Up',
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited monthly active users',
              'SSO / SAML & SCIM',
              'Advanced fraud protection',
              '99.99% uptime SLA',
              'Dedicated support & SLAs',
            ],
            cta: 'Contact Sales',
            ctaTarget: 'Contact Sales',
          },
        ]
    const tierLayouts = [
      'xl:translate-y-8 xl:-rotate-1 max-lg:-rotate-1 max-lg:-translate-x-1',
      'max-lg:z-10',
      'xl:translate-y-8 xl:rotate-1 max-lg:rotate-1 max-lg:translate-x-1 md:max-lg:col-span-2',
    ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn('bg-background py-16 sm:py-20 lg:py-28', props.className)}
      >
        <Container size="xl" className="px-5 sm:px-5">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
            titleClassName="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
            subtitleClassName="leading-7"
            className="mx-auto max-w-3xl"
          />

          <PricingGrid className="mt-12 sm:mt-14">
            {tiers.map((tier, index) => {
              return (
                <PricingTier
                  key={tier.name}
                  variant={tier.highlighted ? 'highlighted' : undefined}
                  className={cn(
                    'shadow-sm shadow-foreground/5',
                    tierLayouts[index % tierLayouts.length],
                  )}
                >
                  {tier.highlighted ? (
                    <PricingTierBadge className="absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-md shadow-primary/25">
                      Most popular
                    </PricingTierBadge>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="mx-auto -mb-2 block h-2.5 w-12 rounded-full border border-border bg-background shadow-inner"
                  />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    clearance level {String(index + 1).padStart(2, '0')}
                  </span>
                  <PricingTierHeader>
                    <PricingTierName className="tracking-tight">
                      {tier.name}
                    </PricingTierName>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <PricingTierPrice className="font-semibold tabular-nums tracking-tight sm:text-5xl">
                        {tier.price}
                      </PricingTierPrice>
                      {tier.period ? (
                        <PricingTierPeriod className="font-mono text-xs uppercase tracking-[0.14em]">
                          {tier.period}
                        </PricingTierPeriod>
                      ) : null}
                    </div>
                    {tier.features?.at(0) ? (
                      <PricingTierTagline className="border-b border-border pb-4">
                        {tier.features[0]}
                      </PricingTierTagline>
                    ) : null}
                  </PricingTierHeader>
                  {tier.features?.length ? (
                    <PricingTierFeatures>
                      {tier.features.slice(1).map((feature) => (
                        <PricingTierFeature key={feature}>
                          {feature}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="flex h-6 items-stretch gap-[3px] opacity-50"
                  >
                    {[
                      'w-0.5',
                      'w-px',
                      'w-1',
                      'w-px',
                      'w-0.5',
                      'w-1',
                      'w-px',
                      'w-0.5',
                      'w-px',
                      'w-1',
                      'w-0.5',
                      'w-px',
                      'w-1',
                      'w-px',
                      'w-0.5',
                      'w-1',
                      'w-px',
                      'w-0.5',
                    ].map((width, barIndex) => (
                      <span
                        key={barIndex}
                        className={cn('bg-foreground', width)}
                      />
                    ))}
                  </span>
                  {tier.cta ? (
                    <SaasPlanActionButton
                      lakebed={lakebed}
                      intentLabel={tier.ctaTarget ?? tier.cta}
                      plan={tier.name}
                      source="pricing"
                      aria-label={`${tier.cta} for ${tier.name}`}
                      pendingChildren={
                        <>
                          <SaasMutationSpinner className="size-4" />
                          Selecting
                        </>
                      }
                      className={cn(
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70',
                        tier.highlighted
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                          : 'border border-border bg-background text-foreground hover:border-foreground/25 hover:bg-muted',
                      )}
                    >
                      {tier.cta}
                    </SaasPlanActionButton>
                  ) : null}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
