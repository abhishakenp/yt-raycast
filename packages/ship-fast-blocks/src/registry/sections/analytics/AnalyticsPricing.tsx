import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * AnalyticsPricing — Swiss comparison table pricing band for an analytics
 * product. An asymmetric header (left-aligned oversized title + lede,
 * right-aligned mono tier index) above a collapsed-border three-column tier
 * table: sharp hairline cells with mono uppercase tier names, giant tabular
 * prices with mono period tags, hairline-ruled feature ledger rows marked by
 * mono "+" glyphs, and a full-width sharp CTA with press feedback. The
 * highlighted tier floods with a full ink inversion (bg-foreground) and
 * carries a mono primary badge plus a filled-primary CTA — the inverted
 * comparison cell. CTAs are scoped Lakebed mutations; plans seed command
 * search and selected tiers update the shared navbar badge. Use as the
 * pricing band of any analytics, BI, or data-product site. Renders fully with
 * no props via baked-in Free / Pro / Enterprise defaults.
 */
export const AnalyticsPricing = defineCapsule({
  name: 'AnalyticsPricing',
  description:
    "Swiss comparison-table pricing band for an analytics product backed by shared Lakebed conversion state: an asymmetric header above a collapsed-border three-column tier table with mono uppercase tier names, giant tabular prices, hairline feature ledger rows marked by mono '+' glyphs, and full-width sharp CTAs with press feedback; the highlighted tier floods with a full ink inversion and a mono primary badge. Plans seed command search and selected tiers update the shared navbar badge. Use as the pricing band of any analytics, BI, or data-product site.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Start free, scale when you grow'
    const subheading =
      props.subheading ??
      'No credit card to start. Upgrade the moment your data does.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
              'Up to 1M events / month',
              '3 dashboards',
              '7-day data retention',
              'Community support',
            ],
            cta: 'Get started',
            ctaTarget: 'Start Free',
          },
          {
            name: 'Pro',
            price: '$49',
            period: '/mo',
            features: [
              'Up to 50M events / month',
              'Unlimited dashboards',
              '1-year data retention',
              'Smart alerts & funnels',
              'Priority email support',
            ],
            cta: 'Start free trial',
            ctaTarget: 'Start Free Trial',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited events',
              'SSO & advanced governance',
              'Custom data retention',
              'Dedicated success manager',
              '99.99% uptime SLA',
            ],
            cta: 'Contact sales',
            ctaTarget: 'Book a demo',
          },
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
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-10 grid items-end gap-6 sm:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="gap-4 lg:col-span-8"
              titleClassName="text-4xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 lg:col-span-4 lg:flex-col lg:items-end lg:justify-end lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <MonoTag className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Tier ledger
              </MonoTag>
              <MonoTag tone="faint" className="tabular-nums">
                01 — {String(tiers.length).padStart(2, '0')}
              </MonoTag>
            </div>
          </div>

          <div className="grid border-l border-t border-border md:grid-cols-3">
            {tiers.map((tier, i) => {
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
              const highlighted = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              const periodTag =
                t.period ?? t.unit ?? t.cadence ?? t.suffix ?? null
              return (
                <div
                  key={t.name}
                  className={cn(
                    'relative flex flex-col border-b border-r border-border p-6 sm:p-8 lg:p-10',
                    highlighted
                      ? 'bg-foreground text-background'
                      : 'bg-background',
                  )}
                >
                  {highlighted ? (
                    <span className="absolute right-6 top-6 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </span>
                  ) : null}
                  <div className="flex items-baseline gap-3">
                    <MonoTag
                      aria-hidden="true"
                      className={cn(
                        'tabular-nums',
                        highlighted
                          ? 'text-background/40'
                          : 'text-muted-foreground/60',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.2em]',
                        highlighted ? 'text-background/70' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </span>
                  </div>
                  {[t.tagline, t.blurb, t.description, t.audience]
                    .filter(Boolean)
                    .map((line) => (
                      <p
                        key={String(line)}
                        className={cn(
                          'mt-2 text-sm leading-relaxed',
                          highlighted
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {line}
                      </p>
                    ))}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
                      {t.price}
                    </span>
                    {periodTag ? (
                      <MonoTag
                        className={cn(
                          highlighted
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {periodTag}
                      </MonoTag>
                    ) : null}
                  </div>
                  {t.features?.length ? (
                    <ul
                      className={cn(
                        'mt-8 border-t',
                        highlighted ? 'border-background/15' : 'border-border',
                      )}
                    >
                      {t.features.map((feature) => {
                        const label =
                          typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label
                        return (
                          <li
                            key={label}
                            className={cn(
                              'flex items-start gap-3 border-b py-2.5 text-sm',
                              highlighted
                                ? 'border-background/15 text-background/70'
                                : 'border-border/60 text-muted-foreground',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'font-mono text-xs',
                                highlighted
                                  ? 'text-background/50'
                                  : 'text-primary',
                              )}
                            >
                              +
                            </span>
                            {label}
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                  {t.cta ? (
                    <div className="mt-auto pt-8">
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
                          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                          highlighted
                            ? 'bg-background text-foreground hover:bg-background/90'
                            : 'border border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40',
                        )}
                      >
                        {t.cta}
                      </SaasPlanActionButton>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
