import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LogisticsProcess — an industrial-manifest "how it works" route flow for a
 * global-logistics / freight-forwarding company. Left column: a mono
 * `$ track --route` meta line and a left-aligned heading + lede above a vertical
 * route line — a dashed hairline threading square mono index chips, each beside a
 * `step / 0N` waypoint tag, a title and a paragraph. Right column: a tall
 * warehouse photo framed as a chamfered manifest pane (inverted mono title bar +
 * square window dots) with an inverted metric ledger chip (clock icon + mono
 * label / tabular value) overlapping the top-right corner. Precise and
 * operational, tokens-only. Use to explain the quote-to-delivery / booking
 * process for logistics, freight-forwarding, shipping, courier or cargo/transport
 * companies. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProcessTimeline } from '#/section-kit/ProcessTimeline.tsx'
export const LogisticsProcess = defineCapsule({
  name: 'LogisticsProcess',
  description:
    "Industrial-manifest 'how it works' route flow for a global-logistics / freight-forwarding company: a left column with a mono meta line and a left-aligned heading + lede above a vertical route line (a dashed hairline threading square mono index chips, each beside a waypoint tag, a title and a paragraph), and a right column with a tall warehouse photo framed as a chamfered manifest pane plus an inverted metric ledger chip (clock icon + mono label / tabular value) overlapping the top-right corner. Precise and operational, tokens-only. Use to explain the quote-to-delivery / booking process for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    imageAlt: z.string().optional(),
    badgeLabel: z.string().optional(),
    badgeValue: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How it works'
    const description =
      props.description ??
      "From quote to delivery in four simple steps. Our platform handles the complexity so you don't have to."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Get an instant quote',
            description:
              'Enter origin, destination, and cargo details. Our algorithm compares rates across air, ocean, and ground to find your best option.',
          },
          {
            title: 'Book and schedule',
            description:
              'Confirm your booking online. Choose pickup date, add insurance, and select any additional services like customs brokerage.',
          },
          {
            title: 'We handle pickup & transit',
            description:
              'Our drivers collect your cargo. Track every mile in real-time via GPS, EDI updates, and milestone notifications.',
          },
          {
            title: 'Delivery confirmation',
            description:
              'Cargo arrives with photo proof of delivery. Access POD, BOL, and invoice instantly in your shipment history.',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'A professional logistics worker in a warehouse scanning a package barcode with a handheld device'
    const badgeLabel = props.badgeLabel ?? 'Average booking time'
    const badgeValue = props.badgeValue ?? '3 min'
    return (
      <ProcessTimeline
        className={cn('py-14 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p
                aria-hidden="true"
                className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
              >
                <span className="text-primary">$</span> track --route
              </p>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mb-10 gap-3 lg:mb-12"
                titleClassName="text-3xl font-extrabold tracking-tight lg:text-4xl"
                subtitleClassName="text-lg text-muted-foreground"
              />

              <ol className="relative space-y-7">
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-4 top-3 w-px border-l border-dashed border-border"
                />
                {items.map((step, i) => (
                  <li key={step.title} className="relative flex gap-5">
                    <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-none bg-foreground font-mono text-sm font-semibold text-background">
                      {i + 1}
                    </span>
                    <div className="pt-0.5">
                      <p
                        aria-hidden="true"
                        className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70"
                      >
                        step / {`0${i + 1}`.slice(-2)}
                        {i === 0
                          ? ' — origin'
                          : i === items.length - 1
                            ? ' — arrival'
                            : ' — waypoint'}
                      </p>
                      <h3 className="mb-1.5 text-lg font-semibold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative lg:col-span-5">
              <div className="border border-border bg-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-1.25rem),calc(100%-1.25rem)_100%,0_100%)]">
                <div className="flex items-center justify-between bg-foreground px-3 py-2 text-background">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    ~/warehouse &mdash; scan
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
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -right-3 top-6 flex items-center gap-3 bg-foreground p-4 text-background lg:right-6">
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
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">
                    {badgeLabel}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-background">
                    {badgeValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ProcessTimeline>
    )
  },
})
