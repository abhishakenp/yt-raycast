import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

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
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
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
    return (
      <section className={cn('bg-muted/50 py-16 lg:py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ServicesGrid columns={3}>
            {items.map((f) => {
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
                <ServiceCard key={__iv__.title}>
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <ServiceTitle>{__iv__.title}</ServiceTitle>
                  <ServiceDescription>{__iv__.description}</ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
