import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MembershipClubPricing — collapsed-border membership-tier ledger for a private
 * membership club / exclusive community page backed by shared Lakebed conversion
 * state. A left-aligned mono micro-label kicker + serif heading + supporting line
 * sit above a sharp-cornered, collapsed-border 3-tier ledger: each cell carries a
 * mono tier index, a serif name, a blurb, a giant serif tabular-nums price with a
 * mono period and annual-savings note, a hairline-divided checkmark feature list,
 * and a full-width square mutation CTA with a restrained hard offset shadow and
 * press feedback. The featured tier inverts to bg-foreground / text-background
 * with a rotated "Most Popular" chip. Tiers seed command search and every CTA
 * records the selected plan. A centered mono footnote sits below. Use for
 * membership levels / plans for members clubs, professional networks, mastermind
 * groups or paid community subscriptions. Renders fully with no props.
 */
export const MembershipClubPricing = defineCapsule({
  name: 'MembershipClubPricing',
  description:
    "Collapsed-border membership-tier ledger for a private membership club / exclusive community page backed by shared Lakebed conversion state: a left-aligned mono micro-label kicker + serif heading + supporting line above a sharp-cornered, collapsed-border 3-tier ledger with mono tier indexes, serif names, giant serif tabular-nums prices with mono periods and annual-savings notes, hairline-divided checkmark feature lists, and full-width square mutation CTAs with restrained hard offset shadows and press feedback; the featured tier inverts to bg-foreground / text-background with a rotated 'Most Popular' chip. Tiers seed command search and every CTA records the selected plan, and a centered mono footnote sits below. Use for membership levels / plans for members clubs, professional networks, mastermind groups or paid community subscriptions.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string(),
          annual: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Membership Tiers'
    const heading = props.heading ?? 'Choose your level of access'
    const description =
      props.description ??
      'All memberships include our core benefits. Annual billing saves 20%.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Contributor',
            blurb: 'For individuals exploring the community',
            price: '$149',
            period: '/month',
            annual: 'or $1,428/year (save $360)',
            features: [
              'Access to 1 clubhouse city of your choice',
              '2 curated introductions per month',
              '4 events per month',
              'Slack community access',
              'Resource library access',
            ],
            cta: 'Apply Now',
          },
          {
            name: 'Member',
            blurb: 'For committed community builders',
            price: '$299',
            period: '/month',
            annual: 'or $2,868/year (save $720)',
            features: [
              'Access to all 8 global clubhouses',
              'Unlimited curated introductions',
              'Unlimited events',
              'Priority retreat registration',
              'Host your own events (2/year)',
              'Member success concierge',
            ],
            cta: 'Apply Now',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Patron',
            blurb: 'For leaders shaping the community',
            price: '$899',
            period: '/month',
            annual: 'or $8,628/year (save $1,800)',
            features: [
              'Everything in Member, plus:',
              'Private office in any clubhouse',
              'Free retreat access (all 4/year)',
              'Host unlimited events',
              'Advisory board eligibility',
              'Guest passes (4/month)',
            ],
            cta: 'Apply Now',
          },
        ]
    const footnote =
      props.footnote ??
      'All applications reviewed within 48 hours. Full refund within 14 days if not satisfied.'

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.blurb || tier.features.at(0) || '',
        }),
      ),
    )

    return (
      <section
        className={cn('w-full bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="pricing-heading"
            className="mb-14 max-w-3xl gap-4 lg:mb-20"
            eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
            subtitleClassName="text-lg leading-relaxed text-muted-foreground"
          />
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, index) => {
              const t = tier as {
                name: string
                price: string
                features?: string[]
                cta?: string
                ctaTarget?: string
                tagline?: string
                blurb?: string
                description?: string
                audience?: string
                period?: string
                unit?: string
                cadence?: string
                suffix?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                badge?: string
                popularLabel?: string
                excluded?: string[]
                annual?: string
                priceSuffix?: string
                note?: string
              }
              const isFeatured = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              const blurb = t.tagline || t.blurb || t.description || t.audience
              const period = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8 lg:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {t.badge ?? 'Most Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      {String(index + 1).padStart(2, '0')} / tier
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 font-serif text-2xl font-normal tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {blurb ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {blurb}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'font-serif text-5xl font-normal leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {period ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {period}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                    {t.annual ? (
                      <p
                        className={cn(
                          'mt-2 font-mono text-[11px] uppercase tracking-[0.12em]',
                          isFeatured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {t.annual}
                      </p>
                    ) : null}
                  </PricingTierHeader>
                  <PricingTierFeatures
                    className={cn(
                      'mt-6 gap-0 divide-y border-t',
                      isFeatured
                        ? 'divide-background/15 border-background/15'
                        : 'divide-border border-border',
                    )}
                  >
                    {(t.features ?? []).map((feature) => (
                      <PricingTierFeature
                        key={feature}
                        className={cn(
                          'gap-3 py-2.5',
                          isFeatured
                            ? 'text-background/85 [&>svg]:text-background'
                            : 'text-foreground/85',
                        )}
                      >
                        {feature}
                      </PricingTierFeature>
                    ))}
                  </PricingTierFeatures>
                  {t.cta ? (
                    <SaasPlanActionButton
                      lakebed={lakebed}
                      intentLabel={t.ctaTarget ?? t.cta}
                      plan={t.name}
                      source="pricing"
                      aria-label={`${t.cta} for ${t.name}`}
                      pendingChildren={
                        <>
                          <SaasMutationSpinner className="size-4" />
                          Selecting
                        </>
                      }
                      className={cn(
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
                  ) : null}
                </PricingTier>
              )
            })}
          </PricingGrid>
          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {footnote}
          </p>
        </Container>
      </section>
    )
  },
})
