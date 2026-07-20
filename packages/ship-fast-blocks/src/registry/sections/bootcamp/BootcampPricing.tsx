import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * BootcampPricing — "Terminal Classroom" tuition ledger for a coding
 * bootcamp / career-school landing page. An asymmetric header (left-aligned
 * heading beside a decorative `$ tuition --compare` prompt) above a
 * collapsed-border 3-column comparison of sharp plan cards: mono uppercase
 * plan names, giant mono tabular prices with bracketed mono unit labels, and
 * check feature lists. The featured plan inverts to a foreground-on-
 * background card that breaks the row vertically with a hard offset shadow
 * and a square mono badge; ghost plans get bracketed mono CTAs, the featured
 * plan a solid primary block — all with press feedback and route-link
 * targets. A hairline footnote row with a mono CTA link closes the section.
 * Use as the pricing table for bootcamps, academies, or vocational programs
 * offering multiple payment options.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
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
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const BootcampPricing = defineCapsule({
  name: 'BootcampPricing',
  description:
    "Terminal-styled collapsed-border tuition ledger for a coding bootcamp / career-school landing page: asymmetric left-aligned header with a decorative '$ tuition --compare' prompt, above a 3-column comparison of sharp plan cards with mono uppercase names, giant mono tabular prices, bracketed mono unit labels, and check feature lists. The featured plan inverts to a foreground-on-background card that breaks the row with a hard offset shadow and square mono badge; CTAs are bracketed mono ghosts or a solid primary block with press feedback, all routing through section-kit route links. A hairline footnote row with a mono CTA link closes the section. Use as the pricing table for bootcamps, academies, or vocational programs offering multiple payment options.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans: name, description, price, unit, features, CTA, optional featured flag and badge. */
    items: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote text under the grid. */
    footnote: z.string().optional(),
    /** Clickable CTA link text in the footnote. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingEyebrow = props.eyebrow ?? 'Investment'
    const pricingHeading = props.heading ?? 'Flexible payment options'
    const pricingDesc =
      props.description ??
      'Choose the plan that works for your financial situation. All options include the same curriculum and job guarantee.'
    const pricingItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Upfront Payment',
            blurb: 'Pay in full before the cohort starts',
            price: '$12,500',
            unit: 'one-time',
            features: [
              'Save $2,000 vs. other options',
              'No future payments',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
          },
          {
            name: 'Monthly Payment',
            blurb: 'Spread the cost over 12 months',
            price: '$1,125',
            unit: '/month',
            features: [
              '0% interest financing',
              'No credit check required',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Income Share',
            blurb: 'Pay nothing until you earn $50k+',
            price: '$0',
            unit: 'upfront',
            features: [
              '10% of income for 24 months',
              'Capped at $16,500 total',
              'Only pay if you succeed',
            ],
            cta: 'Select Plan',
          },
        ]
    const pricingFootnote =
      props.footnote ??
      'Scholarships available for underrepresented groups in tech.'
    const pricingFootnoteCta = props.footnoteCta ?? 'Learn more →'
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-4 font-mono text-[9rem] sm:text-[16rem]">
          $
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-6 lg:mb-16 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={pricingEyebrow}
              title={pricingHeading}
              subtitle={pricingDesc}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="hidden justify-self-end font-mono text-sm text-muted-foreground lg:col-span-4 lg:block"
            >
              <span className="text-primary">$</span> tuition --compare
            </p>
          </div>
          <PricingGrid className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-0 xl:grid-cols-3">
            {pricingItems.map((tier) => {
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
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'relative flex flex-col rounded-none p-6 lg:p-8',
                    isFeatured
                      ? 'z-10 border-2 border-foreground bg-foreground text-background shadow-[8px_8px_0_0] shadow-primary/25 ring-0 md:-my-5 md:py-12'
                      : 'border border-border bg-card md:border-r-0 md:first:border-r md:last:border-l-0 md:last:border-r',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 left-6 rounded-none bg-primary px-2.5 font-mono text-[10px] uppercase tracking-[0.15em]">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName
                      className={cn(
                        'font-mono text-sm font-semibold uppercase tracking-[0.15em]',
                        isFeatured && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <PricingTierPrice
                      className={cn(
                        'mt-2 font-mono text-5xl font-bold tabular-nums tracking-tighter',
                        isFeatured && 'text-background',
                      )}
                    >
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.15em]',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.period}
                      </PricingTierPeriod>
                    )}
                    {t.unit && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.15em]',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.unit}
                      </PricingTierPeriod>
                    )}
                    {t.cadence && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.15em]',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.cadence}
                      </PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.15em]',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.suffix}
                      </PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures className="mt-6 border-t border-border/60 pt-6">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(isFeatured && 'text-background/75')}
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <PricingTierCta
                      target={t.ctaTarget}
                      className={cn(
                        'mt-8 gap-2 rounded-none font-mono text-sm font-semibold uppercase tracking-[0.12em] transition-[transform,box-shadow,background-color,color] duration-150 active:translate-y-px',
                        isFeatured
                          ? 'bg-primary text-primary-foreground shadow-[4px_4px_0_0] shadow-background/20 hover:bg-primary/90 active:shadow-none'
                          : 'border border-border bg-transparent text-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {isFeatured ? null : <span aria-hidden="true">[</span>}
                      {t.cta}
                      {isFeatured ? null : <span aria-hidden="true">]</span>}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
          <p className="mx-auto mt-12 max-w-5xl border-t border-border pt-5 text-sm text-muted-foreground">
            {pricingFootnote}{' '}
            <NavbarRouteLink
              className="font-mono text-primary underline-offset-4 hover:underline"
              href={pricingFootnoteCta}
            >
              {pricingFootnoteCta}
            </NavbarRouteLink>
          </p>
        </Container>
      </section>
    )
  },
})
