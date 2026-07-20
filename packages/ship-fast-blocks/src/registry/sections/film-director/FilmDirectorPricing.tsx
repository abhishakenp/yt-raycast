import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorPricing — a cinematic "investment" tier ledger for a film director
 * or cinematographer, backed by shared Lakebed conversion state. On a muted band
 * with a mono slate meta rule and giant credits-style header: a sharp,
 * collapsed-border 3-tier ledger where each cell carries a mono "PKG 0X" index, an
 * UPPERCASE tier name, a giant tabular-nums price (with optional mono suffix), a
 * short blurb, a hairline-divided check-marked feature list, and a full-width
 * square mutation CTA with press feedback. The highlighted tier inverts to
 * bg-foreground/text-background with a rotated "Most Popular" slate chip. Every
 * CTA records the selected package or sales intent to shared Lakebed state and
 * plans seed command search. Tokens-only and theme-adaptive. Use to present
 * project-scope packages (concept-to-delivery production services) for filmmakers,
 * directors, DPs, or video production houses.
 */
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
export const FilmDirectorPricing = defineCapsule({
  name: 'FilmDirectorPricing',
  description:
    'Cinematic "investment" tier ledger for a film director or cinematographer backed by shared Lakebed conversion state: on a muted band with a mono slate meta rule and a giant credits-style header, a sharp collapsed-border 3-tier ledger where each cell carries a mono "PKG 0X" index, an UPPERCASE tier name, a giant tabular-nums price with optional mono suffix, a blurb, a hairline-divided check-marked feature list, and a full-width square mutation CTA with press feedback; the highlighted tier inverts to a dark surface with a rotated Most-Popular slate chip. Plans seed command search and every CTA records the selected package or sales intent. Use to present project-scope packages (concept-to-delivery production services) for filmmakers, directors, DPs, or video production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          suffix: z.string().optional(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          popularLabel: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const pricingHeading = props.heading ?? 'Investment'
    const pricingDesc =
      props.description ??
      'Transparent pricing for different project scopes. Every package includes full production services from concept to delivery.'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            price: '$15,000',
            suffix: '+',
            description:
              'Perfect for brand stories, testimonials, and social content.',
            features: [
              '1 day of production',
              '1-2 minute final cut',
              'Basic color grading',
              '2 revision rounds',
              'Licensed music',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Professional',
            price: '$35,000',
            suffix: '+',
            description:
              'Comprehensive campaigns, brand films, and commercial spots.',
            features: [
              '2-3 days of production',
              '2-3 minute final cut',
              'Premium color grade',
              'Custom sound design',
              '3 revision rounds',
              'Multiple deliverables',
            ],
            cta: 'Get Started',
            popular: true,
            popularLabel: 'Most Popular',
          },
          {
            name: 'Premium',
            price: 'Custom',
            description:
              'Multi-spot campaigns, documentary series, and high-end productions.',
            features: [
              'Multi-day production',
              'Multiple deliverables',
              'Feature-film quality',
              'Dedicated post team',
              'Unlimted revisions',
              'Global locations',
            ],
            cta: 'Contact for Quote',
          },
        ]
    useSyncSaasPlans(
      lakebed,
      pricingTiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.suffix,
          price: tier.price,
          summary: tier.description || tier.features.at(0) || '',
        }),
      ),
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Investment
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · per project
                </span>
              </MonoTag>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {pricingHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {pricingDesc}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ packages ] {String(pricingTiers.length).padStart(2, '0')} scopes
            </p>
          </div>
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {pricingTiers.map((tier, index) => {
              const t = tier as {
                name: string
                price: string
                description?: string
                features?: string[]
                cta?: string
                ctaTarget?: string
                suffix?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                popularLabel?: string
              }
              const isFeatured = Boolean(
                t.highlighted || t.featured || t.popular,
              )
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
                      {t.popularLabel ?? 'Most Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      PKG {String(index + 1).padStart(2, '0')}
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-extrabold uppercase tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.description ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {t.description}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-1.5">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {t.suffix ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-lg uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {t.suffix}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features ? (
                    <PricingTierFeatures
                      className={cn(
                        'mt-6 gap-0 divide-y border-t',
                        isFeatured
                          ? 'divide-background/15 border-background/15'
                          : 'divide-border border-border',
                      )}
                    >
                      {t.features.map((feature) => (
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
                  ) : null}
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
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
        </Container>
      </section>
    )
  },
})
