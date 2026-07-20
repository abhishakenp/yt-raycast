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
 * LogisticsFaq — an industrial-manifest manual-page FAQ for a global-logistics /
 * freight-forwarding company. Asymmetric 4/8 split: the left rail carries a mono
 * `$ man swiftfreight` meta line, a left-aligned heading and lede (sticky on
 * desktop); the right column is a collapsed-border accordion ledger of
 * detail/summary rows, each with a mono `Q.NN` index tag and a chevron that
 * rotates on open to reveal the answer. Precise and operational, tokens-only. Use
 * to answer common shipping questions (tracking, transit times, customs, cargo
 * types, insurance, quotes) for logistics, freight-forwarding, shipping, courier
 * or cargo/transport companies. Renders fully with no props.
 */
export const LogisticsFaq = defineCapsule({
  name: 'LogisticsFaq',
  description:
    'Industrial-manifest manual-page FAQ for a global-logistics / freight-forwarding company: an asymmetric 4/8 split with a sticky left rail (mono meta line, heading, lede) and a collapsed-border accordion ledger on the right — detail/summary rows with mono Q-index tags and a chevron that rotates on open. Precise and operational, tokens-only. Use to answer common shipping questions (tracking, transit times, customs clearance, cargo types, insurance, quotes) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.',
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
      <section className={cn('py-14 sm:py-20 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <p
                  aria-hidden="true"
                  className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  <span className="text-primary">$</span> man swiftfreight
                </p>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="text-3xl font-extrabold tracking-tight lg:text-4xl"
                  subtitleClassName="text-lg text-muted-foreground"
                />
                <span
                  aria-hidden="true"
                  className="mt-6 hidden h-1 w-12 bg-primary lg:block"
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 divide-y divide-border border border-border bg-background">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    className="rounded-none border-0 bg-transparent"
                  >
                    <FaqQuestion className="items-baseline gap-4 p-5 sm:p-6">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70"
                      >
                        Q.{`0${i + 1}`.slice(-2)}
                      </span>
                      <span className="flex-1 pr-4 font-semibold tracking-tight text-foreground">
                        {item.q}
                      </span>
                      <FaqQuestionIcon className="self-center" />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="px-5 pb-5 text-sm leading-relaxed sm:px-6 sm:pb-6 sm:pl-[4.25rem]"
                    >
                      <div>{item.a}</div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
