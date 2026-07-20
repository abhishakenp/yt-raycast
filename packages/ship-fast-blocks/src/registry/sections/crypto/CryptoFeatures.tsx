import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * CryptoFeatures — Web3-terminal capability module grid for a crypto / DeFi
 * infrastructure landing page. An asymmetric header (left-aligned heading +
 * description, mono "[ MODULES ]" meta on the right) above a three-column
 * grid of square-cornered hairline cards with hard offset shadows. Each card
 * carries a mono zero-padded index numeral, a tick-bar motif, a bold title,
 * and a description; the middle desktop column is staggered downward for a
 * broken-grid rhythm. A ghost "MODULES" watermark backs the section. Use to
 * showcase settlement, bridging, custody, security, analytics, or governance
 * capabilities.
 */
export const CryptoFeatures = defineCapsule({
  name: 'CryptoFeatures',
  description:
    'Web3-terminal capability module grid for a crypto / DeFi infrastructure landing page: asymmetric left-aligned header with mono meta label, then a three-column grid of square-cornered hairline cards with hard offset shadows — each with a mono zero-padded index numeral, tick-bar motif, bold title, and description, with a staggered middle desktop column and a ghost watermark behind. Use to showcase settlement, bridging, custody, security, analytics, or governance capabilities.',
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

    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6', 'w-12', 'w-4']

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-top-6 right-0 font-mono text-[7rem] sm:text-[11rem]">
          {'{ }'}
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ modules ] 0{Math.min(items.length, 9)} loaded
            </p>
          </div>
          <FeatureGrid columns={3}>
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
                <FeatureCard
                  key={__iv__.title}
                  className={cn(
                    'gap-4 rounded-none p-7 shadow-[6px_6px_0_0] shadow-border transition-transform duration-150 hover:-translate-y-1 hover:border-foreground/30 active:translate-y-0',
                    i % 3 === 1 && 'md:mt-6',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                      /0{i + 1}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex items-center gap-1"
                    >
                      <span
                        className={cn(
                          'h-1 bg-primary',
                          tickWidths[i % tickWidths.length],
                        )}
                      />
                      <span className="h-1 w-1 bg-border" />
                      <span className="h-1 w-1 bg-border" />
                    </span>
                  </div>
                  {__iv__.icon && (
                    <FeatureIcon className="rounded-none">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
