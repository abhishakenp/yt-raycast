import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * LogisticsProcess — a two-column "how it works" flow for a global-logistics /
 * freight-forwarding company. Left column: a heading + lede above a vertical list
 * of numbered steps, each a primary circular index beside a titled paragraph.
 * Right column: a tall rounded warehouse photo with a floating, shadowed metric
 * badge (clock icon + label/value) overlapping the top-right corner. Clean and
 * corporate on a light surface with a deep slate primary. Use to explain the
 * quote-to-delivery / booking process for logistics, freight-forwarding, shipping,
 * courier or cargo/transport companies. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepTimeline } from '#/section-kit/StepTimeline.tsx'
export const LogisticsProcess = defineCapsule({
  name: 'LogisticsProcess',
  description:
    "Two-column 'how it works' flow for a global-logistics / freight-forwarding company: a left column with a heading + lede above a vertical list of numbered steps (each a primary circular index beside a titled paragraph), and a right column with a tall rounded warehouse photo plus a floating, shadowed metric badge (clock icon + label/value) overlapping the top-right corner. Clean and corporate on a light surface with a deep slate primary. Use to explain the quote-to-delivery / booking process for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
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
      <StepTimeline className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mb-12 gap-0"
                titleClassName="mb-6 text-3xl font-semibold tracking-tight lg:text-4xl"
                subtitleClassName="text-lg text-muted-foreground"
              />

              <div className="space-y-8">
                {items.map((step, i) => (
                  <div key={step.title} className="flex gap-5">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <Card padding="sm" shadow="lg" className="absolute right-6 top-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
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
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {badgeLabel}
                    </p>
                    <p className="text-2xl font-semibold text-card-foreground">
                      {badgeValue}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
