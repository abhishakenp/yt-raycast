import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CoworkingPricing — flat editorial membership pricing rendered as a hairline
 * pricing LEDGER. An asymmetric 7:5 header (mono square-marker eyebrow "03 /
 * Membership plans" + solid display heading left, supporting line right) sits
 * above a single bordered ledger whose tiers are columns on desktop and
 * stacked rows on mobile, separated by hairline `border-border` seams. Each
 * column carries a large `tabular-nums` price, a `divide-y divide-border`
 * feature list with small inline check rows (no filled circles), and a SQUARE
 * CTA with press feedback. Exactly ONE accent tier is highlighted with a
 * `border-primary` frame and a flat mono `POPULAR` label plus a filled primary
 * CTA — no glow, gradient, or lift. A collapsed-border mono reassurance ledger
 * (no setup fees / month-to-month / cancel anytime) closes the section. Any
 * tier count renders cleanly. CTAs route through section-kit route links. Use
 * to convert prospective members for coworking spaces, shared offices, or
 * flex-office providers.
 */
export const CoworkingPricing = defineCapsule({
  name: 'CoworkingPricing',
  description:
    "Calm dimensional membership pricing for a coworking or shared-workspace page: asymmetric 7:5 editorial header (mono index eyebrow chip + display heading left, supporting line right) above frosted glass tier cards — gradient hairlines, large tracked prices, hairline-ledger benefit lists, full-width press-feedback CTAs. The highlighted tier is lifted on desktop with a primary ring, 'Popular' pill, and filled primary CTA; a collapsed-border mono reassurance ledger (no setup fees, month-to-month, cancel anytime) closes the section over a connected light-field backdrop. CTAs route through section-kit route links. Use to convert prospective members for coworking spaces, shared offices, or flex-office providers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Membership tiers — name, price, period, features, cta, highlighted. */
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
  component: ({ props }) => {
    const heading =
      typeof props.heading === 'string' && props.heading
        ? props.heading
        : 'Simple, month-to-month memberships'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'No long-term contracts and no setup fees — pick the plan that fits how you work and upgrade anytime.'
    const defaults = [
      {
        name: 'Hot Desk',
        price: '$199',
        period: '/mo',
        features: [
          'Any open desk, first come first served',
          'Business-hours access (8am–8pm)',
          'Unlimited WiFi & free coffee',
          '5 hours of meeting-room credits',
        ],
        cta: 'Start with Hot Desk',
        ctaTarget: 'Book a Tour',
        highlighted: false,
      },
      {
        name: 'Dedicated Desk',
        price: '$349',
        period: '/mo',
        features: [
          'Your own desk, locked drawer & monitor arm',
          '24/7 keycard access',
          'Unlimited WiFi & free coffee',
          '15 hours of meeting-room credits',
          'Business address & mail handling',
        ],
        cta: 'Get a Dedicated Desk',
        ctaTarget: 'Book a Tour',
        highlighted: true,
      },
      {
        name: 'Private Office',
        price: '$1,200',
        period: '/mo',
        features: [
          'Lockable private suite for 2–6 people',
          '24/7 keycard access',
          'Unlimited WiFi & free coffee',
          'Unlimited meeting-room access',
          'Branded signage & dedicated phone line',
        ],
        cta: 'Tour an Office',
        ctaTarget: 'Book a Tour',
        highlighted: false,
      },
    ]
    const authored = props.tiers
      ?.filter(Boolean)
      .filter((tier) => typeof tier?.name === 'string')
    const tiers = authored?.length ? authored : defaults

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-border/70 lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border/70 lg:block"
          />
          <div className="grid items-end gap-6 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  03 / Membership plans
                </span>
              </span>
              <h2 className="mt-5 max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {subheading}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 border border-border lg:grid-cols-3">
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
              const isHighlighted = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              const taglines = [
                t.tagline,
                t.blurb,
                t.description,
                t.audience,
              ].filter((line): line is string => typeof line === 'string')
              const period = t.period ?? t.unit ?? t.cadence ?? t.suffix
              return (
                <div
                  key={t.name}
                  data-slot="pricing-tier"
                  className={cn(
                    'relative flex min-w-0 flex-col p-6 sm:p-8',
                    index > 0 &&
                      'border-t border-border lg:border-l lg:border-t-0',
                    isHighlighted &&
                      'z-10 border border-primary lg:-m-px lg:border',
                  )}
                >
                  <div className="flex min-h-5 items-center justify-between">
                    <h3 className="text-lg font-semibold leading-none text-foreground">
                      {t.name}
                    </h3>
                    {isHighlighted && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        {t.badge ?? 'Popular'}
                      </span>
                    )}
                  </div>

                  {taglines.map((line) => (
                    <p
                      key={line}
                      className="mt-2 text-sm leading-6 text-muted-foreground"
                    >
                      {line}
                    </p>
                  ))}

                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground sm:text-5xl">
                      {t.price}
                    </span>
                    {period && (
                      <span className="text-sm text-muted-foreground">
                        {period}
                      </span>
                    )}
                  </p>

                  {t.features && (
                    <ul className="mt-6 flex-1 divide-y divide-border border-t border-border text-sm">
                      {t.features.map((feature) => {
                        const label =
                          typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label
                        return (
                          <li
                            key={label}
                            className="flex items-start gap-2.5 py-3 leading-6 text-muted-foreground"
                          >
                            <Check className="mt-1 size-3.5 shrink-0 text-primary" />
                            <span>{label}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {t.cta && (
                    <NavbarRouteLink
                      data-slot="pricing-tier-cta"
                      href={t.ctaTarget}
                      className={cn(
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-none px-5 py-3 text-sm font-semibold transition-colors duration-200 active:translate-y-px',
                        isHighlighted
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-border bg-background text-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </NavbarRouteLink>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border">
            {['No setup fees', 'Month-to-month', 'Cancel anytime'].map(
              (assurance) => (
                <span
                  key={assurance}
                  className="px-2 py-3.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {assurance}
                </span>
              ),
            )}
          </div>
        </Container>
      </section>
    )
  },
})
