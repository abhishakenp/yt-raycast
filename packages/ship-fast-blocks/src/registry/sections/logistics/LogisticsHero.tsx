import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { logisticsLakebed } from './logistics-lakebed.ts'
import {
  useShipmentTracking,
  useSyncShipmentCatalog,
} from './logistics-interactions.tsx'

/**
 * LogisticsHero — a split hero for a global-logistics / freight-forwarding
 * company on a subtle muted band. Left column: a large two-line headline (the
 * second line in muted tone), a supporting paragraph, a bordered card holding a
 * real-time shipment-tracking widget (labelled input + icon "Track" button + hint
 * line) that queries Lakebed and renders the matched shipment status inline, and
 * a row of check-marked trust chips. Right column: a rounded cargo-port photo
 * with a floating, shadowed on-time delivery-rate badge overlapping the
 * lower-left corner. Clean, corporate and trust-forward on a light surface with a
 * deep slate primary. Use as the top hero for logistics providers, freight
 * forwarders, shipping carriers, courier or cargo/transport companies. Renders
 * fully with no props.
 */
export const LogisticsHero = defineCapsule({
  name: 'LogisticsHero',
  description:
    "Split hero for a global-logistics / freight-forwarding company on a subtle muted band: a left column with a large two-line headline (second line in muted tone), a supporting paragraph, a bordered card holding a real-time shipment-tracking widget (labelled input + icon 'Track' button + hint line) that queries Lakebed and renders the matched shipment status inline, and a row of check-marked trust chips; a right column with a rounded cargo-port photo and a floating, shadowed on-time delivery-rate badge overlapping the lower-left corner. Clean, corporate and trust-forward on a light surface with a deep slate primary. Use as the top hero for logistics providers, freight forwarders, shipping carriers, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    headingTop: z.string().optional(),
    /** Highlighted second line under the heading (muted tone). */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    trackLabel: z.string().optional(),
    trackPlaceholder: z.string().optional(),
    trackButton: z.string().optional(),
    trackHint: z.string().optional(),
    /** Trust chips beneath the tracking widget. */
    chips: z.array(z.string()).optional(),
    /** Demo shipments seeded into Lakebed. */
    shipments: z
      .array(
        z.object({
          trackingId: z.string(),
          status: z.string(),
          origin: z.string(),
          destination: z.string(),
          estimatedDelivery: z.string(),
        }),
      )
      .optional(),
    imageAlt: z.string().optional(),
    badgeValue: z.string().optional(),
    badgeLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: logisticsLakebed,
  component: ({ props, lakebed }) => {
    const tracking = useShipmentTracking(lakebed)
    const headingTop = props.headingTop ?? 'Global logistics,'
    const highlight = props.highlight ?? 'simplified.'
    const subheading =
      props.subheading ??
      'Ship to 180+ countries with real-time tracking and guaranteed delivery. From Shenzhen to Chicago, Amsterdam to São Paulo—we move what matters.'
    const trackLabel = props.trackLabel ?? 'Track your shipment'
    const trackPlaceholder =
      props.trackPlaceholder ?? 'Enter tracking number (e.g., SF-7823-9912)'
    const trackButton = props.trackButton ?? 'Track'
    const trackHint =
      props.trackHint ?? 'Try demo: SF-2024-8841, SF-2024-7752, SF-2024-9931'
    const chips = props.chips?.length
      ? props.chips
      : ['Real-time tracking', 'Insurance included', '24/7 support']
    const shipments = props.shipments?.length
      ? props.shipments
      : [
          {
            trackingId: 'SF-2024-8841',
            status: 'In transit',
            origin: 'Shenzhen, CN',
            destination: 'Chicago, US',
            estimatedDelivery: 'Jul 2, 2024',
          },
          {
            trackingId: 'SF-2024-7752',
            status: 'Out for delivery',
            origin: 'Amsterdam, NL',
            destination: 'Berlin, DE',
            estimatedDelivery: 'Jun 28, 2024',
          },
          {
            trackingId: 'SF-2024-9931',
            status: 'Delivered',
            origin: 'São Paulo, BR',
            destination: 'Lima, PE',
            estimatedDelivery: 'Jun 25, 2024',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'Aerial view of a large commercial shipping port with colorful cargo containers and cranes at sunset'
    const badgeValue = props.badgeValue ?? '98.7% on-time'
    const badgeLabel = props.badgeLabel ?? 'Delivery rate in 2024'

    useSyncShipmentCatalog(lakebed, shipments)

    const trackingIdValue = tracking.state?.trackingId ?? ''
    const shipment = tracking.state?.shipment

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('bg-muted/50 py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {headingTop}
                  <br />
                  <span className="text-muted-foreground">{highlight}</span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {subheading}
                </p>
              </div>

              <form
                key={trackingIdValue}
                onSubmit={tracking.submitTracking}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <label
                  htmlFor="logistics-hero-track"
                  className="mb-3 block text-sm font-medium text-card-foreground"
                >
                  {trackLabel}
                </label>
                <div className="flex gap-3">
                  <input
                    id="logistics-hero-track"
                    name="trackingId"
                    type="text"
                    defaultValue={trackingIdValue}
                    placeholder={trackPlaceholder}
                    aria-label="Tracking number"
                    className="flex-1 rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="submit"
                    aria-busy={tracking.isPending}
                    disabled={tracking.isPending}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{trackButton}</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {trackHint}
                </p>

                {trackingIdValue ? (
                  <Card
                    aria-live="polite"
                    variant="outline"
                    padding="sm"
                    className="mt-4 bg-background"
                  >
                    {shipment ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {shipment.trackingId}
                          </p>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {shipment.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipment.origin} &rarr; {shipment.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estimated delivery: {shipment.estimatedDelivery}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No shipment found for &ldquo;{trackingIdValue}&rdquo;.
                      </p>
                    )}
                  </Card>
                ) : null}
              </form>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {chips.map((chip) => (
                  <div key={chip} className="flex items-center gap-2">
                    <Check className="text-primary" />
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={600}
                  className="size-full object-cover"
                />
              </div>
              <Card
                padding="sm"
                shadow="lg"
                className="absolute -bottom-6 -left-6"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {badgeValue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badgeLabel}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
