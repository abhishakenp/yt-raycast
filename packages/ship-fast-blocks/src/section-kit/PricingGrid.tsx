import type { ReactNode } from 'react'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from './SectionHeading.tsx'

/**
 * PricingGrid — generic, reusable pricing section (optional heading + responsive
 * tier cards). Each tier renders a name, optional tagline, price/period, optional
 * feature list, and a CTA that routes via useNavigate. The highlighted tier gets
 * a badge pill (custom text or "Most popular") plus a primary border/shadow.
 * Composes SectionHeading for the header block. Supports tagline, badge, unit,
 * and aliases popular/featured for highlighted.
 */
export function PricingGrid(props: {
  heading?: string
  subheading?: string
  tiers: {
    name: string
    price: string
    period?: string
    unit?: string
    tagline?: string
    blurb?: string
    badge?: string
    features?: string[]
    cta?: string
    ctaTarget?: string
    highlighted?: boolean
    popular?: boolean
    featured?: boolean
  }[]
  renderCta?: (tier: {
    name: string
    price: string
    cta?: string
    ctaTarget?: string
    highlighted?: boolean
  }) => ReactNode
  className?: string
}) {
  const go = useNavigate()
  const tiers = Array.isArray(props.tiers) ? props.tiers : []
  return (
    <section className={cn('flex flex-col gap-10', props.className)}>
      {props.heading ? (
        <SectionHeading title={props.heading} subtitle={props.subheading} />
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.filter(Boolean).map((t, i) => {
          const highlighted = t.highlighted || t.popular || t.featured
          const badgeText = t.badge ?? (highlighted ? 'Most popular' : null)
          const subtitle = t.tagline ?? t.blurb
          const periodLabel = t.period ?? t.unit
          return (
            <div
              key={i}
              className={cn(
                'relative flex flex-col gap-6 rounded-xl border bg-card p-8',
                highlighted
                  ? 'border-2 border-primary shadow-lg'
                  : 'border-border',
              )}
            >
              {badgeText ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {badgeText}
                </span>
              ) : null}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {t.name}
                </h3>
                {subtitle ? (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                ) : null}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {t.price}
                  </span>
                  {periodLabel ? (
                    <span className="text-sm text-muted-foreground">
                      {periodLabel}
                    </span>
                  ) : null}
                </div>
              </div>
              {Array.isArray(t.features) && t.features.length ? (
                <ul className="flex flex-col gap-3">
                  {t.features.map((feat, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <svg
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m5 13 4 4L19 7"
                        />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {props.renderCta ? (
                props.renderCta({ ...t, highlighted })
              ) : (
                <button
                  onClick={() => go(t.ctaTarget ?? t.cta ?? 'Pricing')}
                  className={cn(
                    'mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
                    highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {t.cta ?? 'Get started'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
