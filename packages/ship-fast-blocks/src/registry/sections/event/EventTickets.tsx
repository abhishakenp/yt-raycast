import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  EventActionButton,
  EventMutationSpinner,
  eventTicket,
  useSyncEventTickets,
} from './event-interactions.tsx'
import { eventLakebed } from './event-lakebed.ts'
import {
  PricingCard,
  PricingCardBadge,
  PricingCardCta,
  PricingCardCheckIcon,
  PricingCardFeature,
  PricingCardFeatures,
  PricingCardName,
  PricingCardPrice,
  PricingCardPriceUnit,
  PricingCardPriceValue,
  PricingCardTagline,
} from '#/section-kit/PricingCard.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TicketGrid } from '#/section-kit/TicketGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * EventTickets — kinetic-poster ticket-stub pricing block for a conference or event
 * page backed by shared Lakebed state. An asymmetric header (mono index eyebrow +
 * oversized heading + lede) above a 3-up grid of square-edged ticket-stub cards:
 * each carries a mono tier index, name, availability line, a giant tabular price +
 * unit, a perforated dashed divider, a checklist of included features (and an
 * optional crossed-out excluded list), and a square-edged CTA with a hard offset
 * shadow that becomes a disabled "Sold Out" state when flagged. The featured tier
 * inverts to a hairline-outlined dark stub with a "Most Popular" badge. Purchasable
 * CTAs write Lakebed ticket actions and the catalog is shared across event
 * sections. A note line with an inline contact action sits below. Use to sell
 * Early Bird / Regular / VIP passes on tech conference, summit, workshop, or
 * festival pages.
 */
export const EventTickets = defineCapsule({
  name: 'EventTickets',
  description:
    "Kinetic-poster ticket-stub pricing block for a conference or event page backed by shared Lakebed event state: an asymmetric header (mono index eyebrow + oversized heading + lede) above a 3-up grid of square-edged ticket-stub cards, each with a mono tier index, name, availability line, a giant tabular price + unit, a perforated dashed divider, a checklist of included features and an optional crossed-out excluded list, and a square-edged CTA with a hard offset shadow that becomes a disabled 'Sold Out' state when flagged. The featured tier gets a 'Most Popular' badge. Purchasable CTAs write Lakebed ticket actions and the catalog is shared across event sections. A note line with an inline contact action sits below. Use to sell Early Bird / Regular / VIP passes on tech conference, summit, workshop, meetup, or festival pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Note line below the tiers (contains the noteLink text). */
    note: z.string().optional(),
    /** Inline link text within the note. */
    noteLink: z.string().optional(),
    /** Ticket tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          availability: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()).optional(),
          cta: z.string(),
          featured: z.boolean().optional(),
          soldOut: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: eventLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Get Your Ticket'
    const description =
      props.description ??
      'Choose the pass that works for you. All tickets include full access to sessions, meals, and the closing party.'
    const note =
      props.note ??
      'Group discounts available for 5+ tickets. Contact us for team packages.'
    const noteLink = props.noteLink ?? 'Contact us'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Early Bird',
            availability: 'Available until July 31',
            price: '$449',
            unit: '/person',
            features: [
              'Both days of sessions',
              'Breakfast & lunch included',
              'Conference swag kit',
              'Closing party access',
            ],
            excluded: ['Workshop access'],
            cta: 'Sold Out',
            soldOut: true,
          },
          {
            name: 'Regular',
            availability: 'August 1 – September 10',
            price: '$649',
            unit: '/person',
            features: [
              'Both days of sessions',
              'Breakfast & lunch included',
              'Conference swag kit',
              'Closing party access',
            ],
            excluded: ['Workshop access'],
            cta: 'Get Ticket',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'VIP + Workshop',
            availability: 'Limited to 50 attendees',
            price: '$899',
            unit: '/person',
            features: [
              'Everything in Regular',
              'Workshop seat (choose one)',
              'VIP lounge access',
              'Speaker meet & greet',
              'Premium swag bundle',
            ],
            cta: 'Get VIP Pass',
          },
        ]
    useSyncEventTickets(
      lakebed,
      tiers.map((tier) =>
        eventTicket({
          availability: tier.availability,
          cta: tier.cta,
          name: tier.name,
          price: tier.price,
          unit: tier.unit,
        }),
      ),
    )

    const CrossIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            align="left"
            eyebrow="05 / Passes"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-2xl gap-4"
            eyebrowClassName="text-muted-foreground"
            titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <TicketGrid cols="1-3" className="gap-6">
            {tiers.map((tier, i) => (
              <PricingCard
                key={tier.name}
                variant="plain"
                highlight="none"
                className={cn(
                  'rounded-none border p-7',
                  tier.featured
                    ? 'border-foreground bg-card shadow-[8px_8px_0_0] shadow-foreground'
                    : 'border-border bg-card',
                )}
              >
                <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Pass {String(i + 1).padStart(2, '0')}</span>
                  {tier.badge ? (
                    <PricingCardBadge className="static rounded-none bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                      {tier.badge}
                    </PricingCardBadge>
                  ) : null}
                </div>
                <PricingCardName className="mb-1 text-xl font-extrabold tracking-tight text-card-foreground">
                  {tier.name}
                </PricingCardName>
                <PricingCardTagline className="mb-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {tier.availability}
                </PricingCardTagline>
                <PricingCardPrice className="mb-6">
                  <PricingCardPriceValue className="text-5xl font-extrabold tabular-nums tracking-tight text-card-foreground">
                    {tier.price}
                  </PricingCardPriceValue>
                  <PricingCardPriceUnit className="font-mono text-xs uppercase tracking-[0.12em]">
                    {tier.unit}
                  </PricingCardPriceUnit>
                </PricingCardPrice>
                <PricingCardFeatures className="mb-8 space-y-3 border-t border-dashed border-border pt-6 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <PricingCardFeature key={f} className="gap-3">
                      <PricingCardCheckIcon className="mt-0 size-5" />
                      {f}
                    </PricingCardFeature>
                  ))}
                  {(tier.excluded ?? []).map((f) => (
                    <PricingCardFeature key={f} className="gap-3 line-through">
                      <CrossIcon />
                      {f}
                    </PricingCardFeature>
                  ))}
                </PricingCardFeatures>
                <PricingCardCta asChild className="mt-auto">
                  {tier.soldOut ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-none border border-border bg-muted px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {tier.cta}
                    </button>
                  ) : (
                    <EventActionButton
                      lakebed={lakebed}
                      action="ticket"
                      label={tier.cta}
                      intentKey={`ticket:${tier.name}`}
                      source="tickets"
                      tier={tier.name}
                      pendingChildren={
                        <>
                          <EventMutationSpinner />
                          Reserving
                        </>
                      }
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-none border border-foreground px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-70',
                        tier.featured
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-foreground text-background',
                      )}
                    >
                      {tier.cta}
                    </EventActionButton>
                  )}
                </PricingCardCta>
              </PricingCard>
            ))}
          </TicketGrid>
          <div className="mt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {note.split(noteLink)[0]}
              <EventActionButton
                lakebed={lakebed}
                action="contact"
                label={noteLink}
                intentKey="tickets-contact"
                source="tickets-note"
                className="text-foreground underline decoration-primary underline-offset-4 hover:no-underline"
              >
                {noteLink}
              </EventActionButton>
              {note.split(noteLink)[1] ?? ''}
            </p>
          </div>
        </Container>
      </section>
    )
  },
})
