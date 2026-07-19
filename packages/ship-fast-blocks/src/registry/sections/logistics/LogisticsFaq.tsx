import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * LogisticsFaq — a narrow, native-accordion FAQ for a global-logistics / freight-
 * forwarding company. A centered heading + lede over a single column of muted,
 * rounded <details> rows; each summary shows the question with a chevron that
 * rotates open, revealing the answer paragraph below. Clean and corporate on a
 * light surface, constrained to a readable measure. Use to answer common shipping
 * questions (tracking, transit times, customs, cargo types, insurance, quotes) for
 * logistics, freight-forwarding, shipping, courier or cargo/transport companies.
 * Renders fully with no props.
 */
export const LogisticsFaq = defineCapsule({
  name: 'LogisticsFaq',
  description:
    'Narrow, native-accordion FAQ for a global-logistics / freight-forwarding company: a centered heading + lede over a single column of muted, rounded <details> rows, each summary showing the question with a chevron that rotates open to reveal the answer paragraph. Clean and corporate on a light surface, constrained to a readable measure. Use to answer common shipping questions (tracking, transit times, customs clearance, cargo types, insurance, quotes) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ??
      'Everything you need to know about shipping with SwiftFreight.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How do I track my shipment?',
            a: "Enter your tracking number in the search bar at the top of our website or in our mobile app. You'll see real-time location updates, estimated delivery time, and any customs clearance milestones. You can also opt in for SMS or email notifications at every stage.",
          },
          {
            q: 'What are your transit times?',
            a: 'Air freight typically takes 1-5 days depending on the route. Ocean freight ranges from 15-45 days. Ground transport within North America is 1-7 days, and within Europe 1-5 days. Express/next-flight-out options are available for urgent shipments.',
          },
          {
            q: 'Do you handle customs clearance?',
            a: 'Yes. Our licensed customs brokers operate in 38 countries. We handle documentation, duty calculation, and ensure compliance with local regulations. Customs brokerage is included in Priority and Express tiers, and available as an add-on for Standard shipments.',
          },
          {
            q: 'What cargo types do you accept?',
            a: 'We handle general cargo, electronics, automotive parts, fashion/apparel, pharmaceuticals (GDP-compliant), perishables (temperature-controlled), and project cargo. Restricted items include hazardous materials without proper classification, weapons, and illegal goods per IATA/IMDG regulations.',
          },
          {
            q: 'Is my shipment insured?',
            a: 'All shipments include basic liability coverage. Standard tier includes $100, Priority includes $500, and Express includes $2,500. Additional cargo insurance is available up to the full declared value. Claims are processed within 14 business days with proper documentation.',
          },
          {
            q: 'How do I get a quote?',
            a: "Use our online quote tool by entering origin, destination, dimensions, weight, and cargo type. You'll receive instant rates for all service tiers. For complex shipments (project cargo, charters, or oversized freight), contact our sales team directly at sales@swiftfreight.com or call +1 (555) 234-5678.",
          },
        ]

    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container size="sm">
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-12 gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q} variant="muted">
                <FaqQuestion className="p-6">
                  <span className="font-semibold">{item.q}</span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
