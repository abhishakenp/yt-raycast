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

/**
 * EventTickets — a 3-tier ticket pricing block for a conference or event page. A
 * centered heading + description above a 3-column grid of pricing cards (the
 * featured tier gets a thicker border and a "Most Popular" badge), each with
 * name, availability, big price + unit, a checklist of included features (and an
 * optional crossed-out excluded list), and a CTA button that disables when sold
 * out. Purchasable CTAs write Lakebed ticket actions and the catalog is shared
 * across event sections. A note line with an inline link sits below. Use to sell Early Bird /
 * Regular / VIP passes on tech conference, summit, workshop, or festival pages.
 */
export const EventTickets = defineCapsule({
  name: 'EventTickets',
  description:
    "Three-tier ticket pricing block for a conference or event page backed by shared Lakebed event state: a centered heading + description above a 3-column grid of pricing cards (the featured tier gets a thicker border and a 'Most Popular' badge), each with a tier name, availability line, a big price + unit, a checklist of included features and an optional crossed-out excluded list, and a CTA button that becomes a disabled 'Sold Out' state when flagged. Purchasable CTAs write Lakebed ticket actions and the catalog is shared across event sections. A note line with an inline contact action sits below. Use to sell Early Bird / Regular / VIP passes on tech conference, summit, workshop, meetup, or festival pages.",
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={heading}
            subtitle={description}
            align="center"
            titleClassName="tracking-tight"
            subtitleClassName="text-lg"
            className="mx-auto mb-12 max-w-2xl gap-6"
          />
          <TicketGrid cols="1-3" className="mx-auto max-w-5xl gap-8">
            {tiers.map((tier) => (
              <PricingCard
                key={tier.name}
                variant="plain"
                highlight={tier.featured ? 'foreground' : 'none'}
                className={cn(tier.featured ? '' : 'border border-border')}
              >
                {tier.badge ? (
                  <PricingCardBadge className="bg-foreground text-background">
                    {tier.badge}
                  </PricingCardBadge>
                ) : null}
                <PricingCardName className="mb-2 text-card-foreground">
                  {tier.name}
                </PricingCardName>
                <PricingCardTagline className="mb-6">
                  {tier.availability}
                </PricingCardTagline>
                <PricingCardPrice className="mb-6">
                  <PricingCardPriceValue className="text-4xl font-bold text-card-foreground tracking-normal">
                    {tier.price}
                  </PricingCardPriceValue>
                  <PricingCardPriceUnit className="">
                    {tier.unit}
                  </PricingCardPriceUnit>
                </PricingCardPrice>
                <PricingCardFeatures className="mb-8 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <PricingCardFeature key={f} className="gap-3">
                      <PricingCardCheckIcon className="mt-0 size-5" />
                      {f}
                    </PricingCardFeature>
                  ))}
                  {(tier.excluded ?? []).map((f) => (
                    <PricingCardFeature key={f} className="gap-3">
                      <CrossIcon />
                      {f}
                    </PricingCardFeature>
                  ))}
                </PricingCardFeatures>
                <PricingCardCta asChild>
                  {tier.soldOut ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-lg bg-muted px-4 py-3 font-medium text-muted-foreground"
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
                        'block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                        tier.featured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-foreground text-background hover:bg-foreground/90',
                      )}
                    >
                      {tier.cta}
                    </EventActionButton>
                  )}
                </PricingCardCta>
              </PricingCard>
            ))}
          </TicketGrid>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {note.split(noteLink)[0]}
              <EventActionButton
                lakebed={lakebed}
                action="contact"
                label={noteLink}
                intentKey="tickets-contact"
                source="tickets-note"
                className="text-foreground underline hover:no-underline"
              >
                {noteLink}
              </EventActionButton>
              {note.split(noteLink)[1] ?? ''}
            </p>
          </div>
        </div>
      </section>
    )
  },
})
