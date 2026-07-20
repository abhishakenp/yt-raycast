import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

export const SalonBarberPricing = defineCapsule({
  name: 'SalonBarberPricing',
  description:
    "Barbershop / salon pricing section rendered as a vintage-lite price-board ledger backed by shared Lakebed booking state. An asymmetric header (mono index eyebrow + serif heading left, mono count right) sits over a giant serif ghost dollar watermark, above a collapsed-border three-tier ledger — a straight cut, a full grooming service, and a premium works package — each cell showing a mono plan index, serif tier name, a giant serif tabular price with mono period, a hairline-divided feature checklist, and a square booking CTA with press feedback; the middle tier inverts to a dark surface with a rotated sticker badge as most popular. Each CTA records the selected service to shared Lakebed booking state. Use it as the menu / packages band on any barbershop, salon, or men's grooming homepage where visitors choose a service before booking.",
  props: z.object({
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
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Pricing'
    const subheading = props.subheading ?? 'Simple, honest pricing'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'The Cut',
            price: '$35',
            period: 'per visit',
            features: [
              'Consultation',
              'Precision cut or fade',
              'Hot towel finish',
              'Style & product',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
          },
          {
            name: 'The Full Service',
            price: '$65',
            period: 'per visit',
            features: [
              'Everything in The Cut',
              'Beard trim & line-up',
              'Straight razor shave',
              'Scalp massage',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
            highlighted: true,
          },
          {
            name: 'The Works',
            price: '$95',
            period: 'per visit',
            features: [
              'Everything in Full Service',
              'Color or highlights',
              'Conditioning treatment',
              'Priority booking',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
          },
        ]

    useSyncLocalServices(
      lakebed,
      tiers.map((tier) =>
        localServiceItem({
          name: tier.name,
          price: `${tier.price}${tier.period ? ` ${tier.period}` : ''}`,
          summary: tier.features?.[0] ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-4 left-[-1%] font-serif text-[9rem] italic tracking-tighter text-foreground/[0.045] sm:text-[13rem] lg:text-[18rem]">
          $
        </Watermark>

        <Container className="relative">
          {/* Asymmetric header + a rotated walk-ins sticker. */}
          <div className="flex flex-col gap-5 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <MonoTag tone="primary">{subheading}</MonoTag>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="inline-block -rotate-2 self-start border border-foreground/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:self-end"
            >
              Walk-ins welcome
            </span>
          </div>

          {/* Collapsed-border three-tier price-board ledger. */}
          <div className="grid grid-cols-1 border-l border-t border-foreground/15 md:grid-cols-3">
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
              const unit = t.period || t.unit || t.cadence || t.suffix
              return (
                <div
                  key={t.name}
                  className={cn(
                    'relative flex flex-col border-r border-b border-foreground/15 p-7 sm:p-9',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-12'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 right-6 rotate-2 border border-foreground bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground"
                    >
                      {t.badge ?? 'Most Popular'}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em]',
                      isFeatured
                        ? 'text-background/60'
                        : 'text-muted-foreground/70',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')} / chair
                  </span>
                  <h3
                    className={cn(
                      'mt-3 font-serif text-2xl font-medium tracking-tight',
                      isFeatured ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {t.name}
                  </h3>
                  {blurb ? (
                    <p
                      className={cn(
                        'mt-1 text-sm',
                        isFeatured
                          ? 'text-background/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {blurb}
                    </p>
                  ) : null}
                  <div className="mt-5 flex items-baseline gap-2">
                    <span
                      className={cn(
                        'font-serif text-5xl font-medium leading-none tracking-tight tabular-nums',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.price}
                    </span>
                    {unit ? (
                      <span
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.12em]',
                          isFeatured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {unit}
                      </span>
                    ) : null}
                  </div>
                  {t.features ? (
                    <ul
                      className={cn(
                        'mt-6 divide-y border-t',
                        isFeatured
                          ? 'divide-background/15 border-background/15'
                          : 'divide-border border-border',
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
                              'py-2.5 text-sm',
                              isFeatured
                                ? 'text-background/85'
                                : 'text-foreground/85',
                            )}
                          >
                            {label}
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                  {t.cta ? (
                    <LocalServiceBookingButton
                      lakebed={lakebed}
                      intentLabel={t.ctaTarget ?? t.cta}
                      service={t.name}
                      source="pricing"
                      aria-label={`${t.cta} for ${t.name}`}
                      pendingChildren={
                        <>
                          <LocalServiceMutationSpinner className="size-4" />
                          Booking
                        </>
                      }
                      className={cn(
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-[transform,background-color,color] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground hover:bg-background/85'
                          : 'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {t.cta}
                    </LocalServiceBookingButton>
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
