import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsServices — an industrial-manifest capabilities ledger for a global-
 * logistics / freight-forwarding company. An asymmetric header (left-aligned
 * heading + lede, mono `$ freight modes --list` meta on the right) above a
 * collapsed-border service ledger: hairline-separated cells (2-col on mobile,
 * 3-col on desktop), each with a mono index tag, a status square, a title, a
 * descriptive paragraph and a mono `starting from` price line pinned to the
 * bottom. A giant ghost route-arrow watermark sits behind. Precise and
 * operational, tokens-only. Use to present shipping modes / a service catalog
 * (air, ocean, ground, warehousing, customs, last-mile) for logistics, freight-
 * forwarding, shipping, courier or cargo/transport companies. Renders fully with
 * no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
export const LogisticsServices = defineCapsule({
  name: 'LogisticsServices',
  description:
    "Industrial-manifest capabilities ledger for a global-logistics / freight-forwarding company: an asymmetric header (left-aligned heading + lede, mono command meta on the right) above a collapsed-border service ledger of hairline-separated cells (2-col mobile, 3-col desktop), each with a mono index tag, a status square, a title, a descriptive paragraph and a mono 'starting from' price line pinned to the bottom. Giant ghost route-arrow watermark behind. Precise and operational, tokens-only. Use to present shipping modes / a service catalog (Air Freight, Ocean Freight, Ground Transport, Warehousing, Customs Brokerage, Last-Mile Delivery) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
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
    return (
      <section
        className={cn(
          'relative overflow-hidden py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-6 font-mono text-[8rem] tracking-tighter sm:text-[12rem] lg:text-[15rem]">
          &rarr;&rarr;
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight lg:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              <span className="text-primary">$</span> freight modes --list
            </p>
          </div>

          <ServicesGrid
            columns={3}
            className="[&>div]:grid-cols-2 [&>div]:gap-px [&>div]:border [&>div]:border-border [&>div]:bg-border [&>div]:lg:grid-cols-3"
          >
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <ServiceCard
                  key={__iv__.title}
                  className="group gap-3 rounded-none border-0 bg-background p-5 shadow-none transition-colors hover:bg-muted/40 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      {`0${i + 1}`.slice(-2)} /
                    </span>
                    <span
                      aria-hidden="true"
                      className="size-1.5 bg-primary opacity-40 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <ServiceTitle className="text-base font-semibold tracking-tight sm:text-lg">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="text-sm leading-relaxed">
                    {__iv__.description}
                  </ServiceDescription>
                  {__iv__.price && (
                    <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground tabular-nums">
                      {__iv__.price}
                    </p>
                  )}
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
