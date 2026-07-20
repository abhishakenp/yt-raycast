import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * RealEstateServices — editorial services ledger for a luxury brokerage. An
 * asymmetric header (mono index rail + serif heading on the left, supporting
 * line on the right) sits above a collapsed-border 1/2/4-column grid of service
 * cells. Each sharp-cornered cell carries a giant ghost tabular index numeral, a
 * mono step label, a serif title, and a short description. Defaults cover Buy /
 * Sell / Rent / Invest. Use to summarize what a real-estate brokerage or agent
 * team offers. Renders fully with no props via baked-in defaults.
 */
export const RealEstateServices = defineCapsule({
  name: 'RealEstateServices',
  description:
    'Editorial services ledger for a luxury brokerage: an asymmetric header (mono index rail + serif heading on the left, supporting line on the right) above a collapsed-border 1/2/4-column grid of sharp-cornered service cells, each with a giant ghost tabular index numeral, a mono step label, a serif title, and a short description. Defaults cover Buy / Sell / Rent / Invest. Use to summarize what a real-estate brokerage or agent team offers.',
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Service cards. */
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How we help you move'
    const description =
      props.description ??
      "Whether you're buying your first place, selling to upgrade, renting flexibly, or building a portfolio — we have a dedicated team for it."
    const services = props.services?.length
      ? props.services
      : [
          {
            title: 'Buy',
            description:
              'Tour homes that match your wishlist, get pre-approved with trusted lenders, and negotiate with an agent who knows the block.',
          },
          {
            title: 'Sell',
            description:
              'Price right, stage well, and market everywhere — we sell faster and for more, backed by local comps and a sharp pricing strategy.',
          },
          {
            title: 'Rent',
            description:
              'Find the right lease or fill your vacancy fast with screened tenants, smooth paperwork, and on-call support.',
          },
          {
            title: 'Invest',
            description:
              'Build long-term wealth with cash-flow analysis, neighborhood forecasts, and off-market deals before they go public.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          {/* Asymmetric editorial header. */}
          <div className="mb-12 grid items-end gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:gap-12 lg:mb-14">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Services
                </span>
              </div>
              <h2 className="mt-5 max-w-xl font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>

          <ServicesGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {services.map((service, i) => (
              <ServiceCard
                key={service.title}
                className="group relative gap-0 overflow-hidden rounded-none border-0 border-b border-r border-border bg-transparent p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none font-semibold leading-none tracking-tighter text-foreground/[0.05] tabular-nums text-[6rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-primary tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ServiceTitle className="relative mt-4 font-serif text-xl font-medium tracking-tight">
                  {service.title}
                </ServiceTitle>
                <ServiceDescription className="relative mt-3 leading-relaxed">
                  {service.description}
                </ServiceDescription>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
