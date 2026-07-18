import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * CryptoFeatures — 6-up feature capabilities grid for a crypto / DeFi
 * infrastructure landing page. A centered heading + description followed by
 * a responsive three-column card grid. Each card shows a semantic icon in a
 * muted badge, a bold title, and a description paragraph. Icons rotate
 * through a local set (bolt, swap, lock, shield, chart, users). Use to
 * showcase settlement, bridging, custody, security, analytics, or governance
 * capabilities.
 */
export const CryptoFeatures = defineCapsule({
  name: 'CryptoFeatures',
  description:
    '6-up feature capabilities grid for a crypto / DeFi infrastructure landing page: centered heading + description, then a responsive three-column card grid with semantic icons in muted badges, bold titles, and description paragraphs. Icons rotate through bolt, swap, lock, shield, chart, and users. Use to showcase settlement, bridging, custody, security, analytics, or governance capabilities.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description pairs). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to scale'
    const description =
      props.description ??
      'From settlement layers to cross-chain messaging, NexusChain provides modular infrastructure for every DeFi use case.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'High-Speed Settlement',
            description:
              '50,000+ TPS with 400ms finality. Optimistic rollup architecture with ZK-proof verification for maximum throughput.',
          },
          {
            title: 'Cross-Chain Bridge',
            description:
              'Native bridging to Ethereum, Solana, Cosmos, and 15+ chains. $2.4B secured with zero exploit history since 2022.',
          },
          {
            title: 'Institutional Custody',
            description:
              'MPC-based key management with hardware security modules. SOC 2 Type II certified and regulated in 12 jurisdictions.',
          },
          {
            title: 'Smart Contract Security',
            description:
              'Formal verification toolkit and automated auditing. Over 340 protocols secured with $890M in vulnerability prevention.',
          },
          {
            title: 'Real-Time Analytics',
            description:
              'Sub-second indexing of on-chain data. Custom dashboards for TVL, volume, MEV metrics, and protocol health monitoring.',
          },
          {
            title: 'DAO Governance',
            description:
              'On-chain voting with delegation and quadratic mechanisms. 47,000+ active voters governing protocol upgrades and treasury.',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
