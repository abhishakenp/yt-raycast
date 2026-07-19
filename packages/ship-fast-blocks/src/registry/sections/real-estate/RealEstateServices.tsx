import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * RealEstateServices — a clean services grid for a brokerage covering the core
 * ways clients work with the firm. A centered serif header sits above a
 * responsive 1/2/4-column grid of cards; each card has a numbered token-tinted
 * index chip, a title, and a short description. Defaults cover Buy / Sell /
 * Rent / Invest. Use to summarize what a real-estate brokerage or agent team
 * offers. Renders fully with no props via baked-in defaults.
 */
export const RealEstateServices = defineCapsule({
  name: 'RealEstateServices',
  description:
    'Clean services grid for a brokerage: a centered serif header above a responsive 1/2/4-column grid of cards, each with a numbered token-tinted index chip, a title, and a short description. Defaults cover Buy / Sell / Rent / Invest. Use to summarize what a real-estate brokerage or agent team offers.',
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
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <ServicesGrid heading={heading} subheading={description} columns={4}>
            {services
              .map((service) => ({
                title: service.title,
                description: service.description,
              }))
              .map((f) => {
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
                    <ServiceDescription>
                      {__iv__.description}
                    </ServiceDescription>
                  </ServiceCard>
                )
              })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
