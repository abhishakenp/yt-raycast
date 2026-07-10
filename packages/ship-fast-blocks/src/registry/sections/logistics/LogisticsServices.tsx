import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * LogisticsServices — a services / capabilities grid for a global-logistics /
 * freight-forwarding company on a subtle muted band. A centered heading + lede
 * over a responsive 1 → 2 → 3 column grid of bordered cards; each card carries a
 * rounded icon tile (tints rotate through theme tokens), a title, a descriptive
 * paragraph and a small "starting from" price line, lifting on hover. Clean and
 * corporate on a light surface with a deep slate primary. Use to present shipping
 * modes / service catalog (air, ocean, ground, warehousing, customs, last-mile)
 * for logistics, freight-forwarding, shipping, courier or cargo/transport
 * companies. Renders fully with no props.
 */
export const LogisticsServices = defineCapsule({
  name: 'LogisticsServices',
  description:
    "Services / capabilities grid for a global-logistics / freight-forwarding company on a subtle muted band: a centered heading + lede over a responsive 1 → 2 → 3 column grid of bordered cards, each with a rounded icon tile (tints rotate through theme tokens), a title, a descriptive paragraph and a small 'starting from' price line, lifting on hover. Clean and corporate on a light surface with a deep slate primary. Use to present shipping modes / a service catalog (Air Freight, Ocean Freight, Ground Transport, Warehousing, Customs Brokerage, Last-Mile Delivery) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Complete logistics solutions'
    const description =
      props.description ??
      "From factory floor to customer's door—every mode, every mile, managed seamlessly."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Air Freight',
            description:
              'Express and standard air cargo to 500+ airports. Next-flight-out options for urgent shipments. Typical transit: 1-5 days.',
            price: 'From $4.20/kg',
          },
          {
            title: 'Ocean Freight',
            description:
              'FCL and LCL shipping to major ports worldwide. Full container loads or consolidated cargo. Typical transit: 15-45 days.',
            price: 'From $85/CBM',
          },
          {
            title: 'Ground Transport',
            description:
              'Full truckload (FTL) and less-than-truckload (LTL) across North America and Europe. Real-time GPS tracking included.',
            price: 'From $1.45/mile',
          },
          {
            title: 'Warehousing',
            description:
              '42 facilities across 18 countries. Climate-controlled storage, pick-and-pack, kitting, and inventory management via our WMS.',
            price: 'From $0.45/unit/day',
          },
          {
            title: 'Customs Brokerage',
            description:
              'Licensed customs brokers in 38 countries. Documentation, duty calculation, and compliance management for smooth clearance.',
            price: 'From $125/shipment',
          },
          {
            title: 'Last-Mile Delivery',
            description:
              'White-glove delivery, installation services, and residential delivery with SMS/email notifications and photo confirmation.',
            price: 'From $12.50/delivery',
          },
        ]

    const serviceIcons: ReactNode[] = [
      <svg
        key="air"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      <svg
        key="ocean"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="ground"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
      </svg>,
      <svg
        key="warehouse"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      <svg
        key="customs"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      <svg
        key="lastmile"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
    ]
    const iconTints = [
      'bg-primary/10 text-primary',
      'bg-accent text-accent-foreground',
      'bg-secondary text-secondary-foreground',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-4/15 text-chart-4',
      'bg-destructive/10 text-destructive',
    ]

    return (
      <section className={cn('bg-muted/50 py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card
                key={item.title}
                rounded="2xl"
                padding="lg"
                className="transition-shadow hover:shadow-lg"
              >
                <div
                  className={cn(
                    'mb-6 grid size-14 place-items-center rounded-xl',
                    iconTints[i % iconTints.length],
                  )}
                >
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-sm font-medium text-card-foreground">
                  {item.price}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
