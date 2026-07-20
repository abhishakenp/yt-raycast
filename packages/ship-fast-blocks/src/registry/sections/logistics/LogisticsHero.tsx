import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { logisticsLakebed } from './logistics-lakebed.ts'
import {
  useShipmentTracking,
  useSyncShipmentCatalog,
} from './logistics-interactions.tsx'

/**
 * LogisticsHero — an industrial-manifest asymmetric hero (7/5 split) for a
 * global-logistics / freight-forwarding company. Left column: a mono
 * `[ manifest ] live tracking` status chip, a large extrabold two-line headline
 * (second line in muted tone), a supporting paragraph, and a sharp-cornered
 * waybill card holding a real-time shipment-tracking widget (mono `TRK #` label +
 * tabular input + square icon "Track" button + hint line) that queries Lakebed
 * and renders the matched shipment as an origin → destination route line with a
 * status chip and mono ETA, plus a row of mono trust rows. Right column: the
 * cargo-port photo framed as a chamfered manifest pane (inverted mono title bar +
 * square window dots) with an inverted stat ledger chip overlapping the lower-
 * left corner. A faint dot-grid and a giant ghost route-arrow watermark sit
 * behind. Precise, operational and freight-flavored, tokens-only. Use as the top
 * hero for logistics providers, freight forwarders, shipping carriers, courier or
 * cargo/transport companies. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
export const LogisticsHero = defineCapsule({
  name: 'LogisticsHero',
  description:
    "Industrial-manifest asymmetric hero (7/5 split) for a global-logistics / freight-forwarding company: a left column with a mono status chip, a large extrabold two-line headline (second line in muted tone), a supporting paragraph, a sharp-cornered waybill card holding a real-time shipment-tracking widget (mono TRK # label + tabular input + square icon 'Track' button + hint line) that queries Lakebed and renders the matched shipment as an origin → destination route line with a status chip and mono ETA, and mono trust rows; a right column with the cargo-port photo framed as a chamfered manifest pane with an inverted stat ledger chip overlapping the lower-left corner. Faint dot-grid and giant ghost route-arrow watermark behind. Precise, operational and freight-flavored, tokens-only. Use as the top hero for logistics providers, freight forwarders, shipping carriers, courier, supply-chain or cargo/transport companies.",
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
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <DotGrid
          density="tight"
          tone="border"
          fade="left"
          className="inset-y-0 right-0 w-1/2"
        />
        <Watermark className="-bottom-12 -left-6 font-mono text-[9rem] tracking-tighter sm:text-[14rem] lg:text-[18rem]">
          &rarr;&rarr;
        </Watermark>
        <Container className="relative py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 animate-pulse bg-primary"
                />
                [ manifest ] live tracking
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {headingTop}
                  <br />
                  <span className="text-muted-foreground">{highlight}</span>
                </h1>
                <p
                  aria-hidden="true"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
                >
                  <span className="text-primary">$</span> track origin &rarr;
                  dest &middot; realtime
                </p>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {subheading}
                </p>
              </div>

              <form
                key={trackingIdValue}
                onSubmit={tracking.submitTracking}
                className="border border-border bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/10 sm:p-6"
              >
                <FormField>
                  <FormFieldLabel
                    htmlFor="logistics-hero-track"
                    className="mb-3 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-card-foreground"
                  >
                    {trackLabel}
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/60"
                    >
                      TRK #
                    </span>
                  </FormFieldLabel>
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <FormFieldControl
                      id="logistics-hero-track"
                      name="trackingId"
                      type="text"
                      defaultValue={trackingIdValue}
                      placeholder={trackPlaceholder}
                      aria-label="Tracking number"
                      className="flex-1 rounded-none border border-input bg-muted/40 px-4 py-3 font-mono text-sm tabular-nums text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                    <button
                      type="submit"
                      aria-busy={tracking.isPending}
                      disabled={tracking.isPending}
                      className="flex items-center justify-center gap-2 rounded-none bg-foreground px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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
                </FormField>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {trackHint}
                </p>

                {trackingIdValue ? (
                  <Card
                    aria-live="polite"
                    variant="outline"
                    className="mt-4 rounded-none border-foreground/15 bg-background p-4"
                  >
                    {shipment ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                            {shipment.trackingId}
                          </p>
                          <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                            {shipment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full bg-foreground"
                          />
                          <span
                            aria-hidden="true"
                            className="h-px flex-1 border-t border-dashed border-border"
                          />
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full border border-foreground bg-background"
                          />
                        </div>
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {shipment.origin} &rarr; {shipment.destination}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                          ETA &middot; {shipment.estimatedDelivery}
                        </p>
                      </div>
                    ) : (
                      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        No shipment found for &ldquo;{trackingIdValue}&rdquo;.
                      </p>
                    )}
                  </Card>
                ) : null}
              </form>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {chips.map((chip) => (
                  <div
                    key={chip}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    <Check className="size-3.5 text-primary" />
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="border border-border bg-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-1.25rem),calc(100%-1.25rem)_100%,0_100%)]">
                <div className="flex items-center justify-between bg-foreground px-3 py-2 text-background">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    ~/port &mdash; manifest
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-1.5"
                  >
                    <span className="size-1.5 bg-background/40" />
                    <span className="size-1.5 bg-background/40" />
                    <span className="size-1.5 bg-background" />
                  </span>
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={600}
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 bg-foreground p-4 text-background lg:-left-6">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center border border-background/20 text-background/80"
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
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p className="text-lg font-semibold tabular-nums tracking-tight text-background">
                    {badgeValue}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">
                    {badgeLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
