import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * MusicFestivalTickets — a kinetic-poster three-tier tickets block for a music
 * / arts festival landing page. An asymmetric mono-index header, then a row of
 * three square-cornered pass stubs (GA, GA+, VIP) with dashed perforated edges
 * — each carrying a mono tier index, name, tagline, a giant tabular-nums price
 * + mono unit, a hairline-divided feature list and a hard-offset-shadow CTA
 * with press feedback; the popular tier inverts to a foreground surface with a
 * rotated "Most Popular" ticket chip. Below, a row of dashed add-on stubs
 * (camping, RV, glamping). Every tier CTA and add-on routes through section-kit
 * route links. Use to sell passes on music festivals, arts festivals, concert
 * series, or any multi-day ticketed event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { TicketGrid, TicketCard } from '#/section-kit/TicketGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MusicFestivalTickets = defineCapsule({
  name: 'MusicFestivalTickets',
  description:
    "Kinetic-poster three-tier tickets block for a music / arts festival landing page: an asymmetric mono-index header, then a row of three square-cornered pass stubs (GA, GA+, VIP) with dashed perforated edges — each with a mono tier index, name, tagline, a giant tabular-nums price + mono unit, a hairline-divided feature list and a hard-offset-shadow CTA with press feedback, the popular tier inverted to a foreground surface with a rotated 'Most Popular' ticket chip — followed by a row of dashed add-on stubs (camping, RV, glamping). Every tier CTA and add-on routes through section-kit route links. Use to sell passes on music festivals, arts festivals, concert series, camping/desert events, or any multi-day ticketed event.",
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro paragraph beneath the heading. */
    description: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Label above the add-ons row. */
    addOnsLabel: z.string().optional(),
    /** Add-on options (name + price). */
    addOns: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Tickets'
    const heading = props.heading ?? 'Get Your Pass'
    const description =
      props.description ??
      'All passes include three-day festival access, camping, and free water refill stations. Payment plans available.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'General Admission',
            tagline: 'Full weekend access to all stages',
            price: '$349',
            unit: '/person',
            features: [
              'All 4 stages access',
              'Car camping included',
              'Free water stations',
              'Mobile app access',
            ],
            cta: 'Buy GA Pass',
          },
          {
            name: 'GA+',
            tagline: 'Enhanced comfort & fast entry',
            price: '$549',
            unit: '/person',
            features: [
              'Everything in GA',
              'Fast lane entry',
              'Premium air-conditioned restrooms',
              'GA+ lounge access',
              'Complimentary lockers',
            ],
            cta: 'Buy GA+ Pass',
            popular: true,
            badge: 'Most Popular',
          },
          {
            name: 'VIP',
            tagline: 'The ultimate festival experience',
            price: '$899',
            unit: '/person',
            features: [
              'Everything in GA+',
              'VIP stage viewing areas',
              'Open bars (beer, wine, cocktails)',
              'Dedicated VIP entrance',
              'Commemorative laminate & poster',
            ],
            cta: 'Buy VIP Pass',
          },
        ]
    const addOnsLabel = props.addOnsLabel ?? 'Add-Ons'
    const addOns = props.addOns?.length
      ? props.addOns
      : [
          {
            name: 'Car Camping',
            price: '+ $75/vehicle',
          },
          {
            name: 'RV Camping',
            price: '+ $250/spot',
          },
          {
            name: 'Glamping Tent',
            price: '+ $599 (2-person)',
          },
        ]
    const Check = ({ inverted }: { inverted?: boolean }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'mt-0.5 shrink-0',
          inverted ? 'text-background' : 'text-foreground',
        )}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    return (
      <section
        className={cn(
          'pb-24 pt-24 sm:pt-28 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Container>
          <div className="mb-14 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-4xl font-extrabold uppercase tracking-tight lg:text-6xl"
              subtitleClassName="max-w-xl text-lg text-foreground/70"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/40"
            >
              [ passes ]
            </span>
          </div>

          <TicketGrid cols="1-3" className="mx-auto max-w-5xl gap-6">
            {tiers.map((tier, i) => {
              const featured = Boolean(tier.popular)
              return (
                <TicketCard
                  key={tier.name}
                  variant={featured ? 'featured' : 'default'}
                  className={cn(
                    'relative rounded-none border-2 border-dashed p-8',
                    featured
                      ? 'border-background/40 bg-foreground text-background md:-my-3 md:py-11'
                      : 'border-foreground/30 bg-card',
                  )}
                >
                  {tier.badge ? (
                    <span className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                      {tier.badge}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em]',
                      featured ? 'text-background/60' : 'text-muted-foreground',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')} / pass
                  </span>
                  <h3 className="mt-3 text-2xl font-extrabold uppercase tracking-tight">
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      'mb-6 mt-1 text-sm',
                      featured
                        ? 'text-background/70'
                        : 'text-card-foreground/60',
                    )}
                  >
                    {tier.tagline}
                  </p>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tabular-nums tracking-tight">
                      {tier.price}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.12em]',
                        featured
                          ? 'text-background/60'
                          : 'text-card-foreground/60',
                      )}
                    >
                      {tier.unit}
                    </span>
                  </div>
                  <ul
                    className={cn(
                      'mb-8 divide-y border-t text-sm',
                      featured
                        ? 'divide-background/15 border-background/15'
                        : 'divide-border border-border',
                    )}
                  >
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 py-2.5">
                        <Check inverted={featured} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <NavbarRouteLink
                    className={cn(
                      'block w-full rounded-none py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0_0] transition-[transform,box-shadow] duration-150 hover:shadow-[6px_6px_0_0] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none motion-reduce:transform-none',
                      featured
                        ? 'bg-background text-foreground shadow-background/30 hover:bg-background/90'
                        : 'bg-primary text-primary-foreground shadow-foreground hover:bg-primary/90',
                    )}
                    href={tier.cta}
                  >
                    {tier.cta}
                  </NavbarRouteLink>
                </TicketCard>
              )
            })}
          </TicketGrid>

          <div className="mx-auto mt-14 max-w-3xl">
            <h3 className="mb-6 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {addOnsLabel}
            </h3>
            <ResponsiveGrid cols="1-3" className="gap-4">
              {addOns.map((a) => (
                <Card
                  asChild
                  key={a.name}
                  variant="default"
                  className="rounded-none border border-dashed border-foreground/30 p-4 text-center transition-[transform,background-color] duration-150 hover:bg-muted/50 active:translate-y-px motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={a.name}>
                    <p className="font-bold uppercase tracking-tight">
                      {a.name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-card-foreground/60">
                      {a.price}
                    </p>
                  </NavbarRouteLink>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>
        </Container>
      </section>
    )
  },
})
