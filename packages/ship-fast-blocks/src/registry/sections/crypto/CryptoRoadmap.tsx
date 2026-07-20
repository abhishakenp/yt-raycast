import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { RoadmapTimeline } from '#/section-kit/RoadmapTimeline.tsx'

/**
 * CryptoRoadmap — Web3-terminal phased changelog for a crypto / DeFi
 * development roadmap. An asymmetric 4/8 split: left column holds a sticky
 * left-aligned heading + description with a mono "[ LOG ] PHASED DELIVERY"
 * meta line and a ghost quarter watermark; right column is a hairline
 * vertical rail of entries, each with a square status node (inverted check
 * block for Completed, primary-outlined pulsing block for In Progress,
 * hairline block for Planned), a mono uppercase status chip + tabular
 * quarter label, a bold title, and a description. Use as a product roadmap
 * for protocols, chains, token projects, or infrastructure platforms.
 */
export const CryptoRoadmap = defineCapsule({
  name: 'CryptoRoadmap',
  description:
    'Web3-terminal phased changelog for a crypto / DeFi development roadmap: asymmetric 4/8 split with a sticky left-aligned heading + mono meta line and ghost watermark, and a hairline vertical rail of entries on the right — each with a square status node (inverted check for Completed, primary-outlined pulsing for In Progress, hairline for Planned), mono uppercase status chip with tabular quarter label, bold title, and description. Use as a product roadmap for protocols, chains, token projects, or infrastructure platforms.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description. */
    description: z.string().optional(),
    /** Roadmap items with status, quarter, title, and description. */
    items: z
      .array(
        z.object({
          status: z.enum(['Completed', 'In Progress', 'Planned']),
          quarter: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Development Roadmap'
    const description =
      props.description ??
      'Our phased approach to building the infrastructure layer for the next generation of DeFi.'
    const items = props.items?.length
      ? props.items
      : [
          {
            status: 'Completed' as const,
            quarter: 'Q1 2024',
            title: 'Mainnet Launch v1.0',
            description:
              'Genesis block production began January 15, 2024. Initial validator set of 64 nodes with 100,000 TPS capacity. Bridge contracts deployed to Ethereum, Solana, and Arbitrum.',
          },
          {
            status: 'Completed' as const,
            quarter: 'Q2 2024',
            title: 'NEX Token Launch',
            description:
              'Public sale completed April 8, 2024. $42M raised from 12,400 participants. Token listed on Binance, Coinbase, and Kraken. Staking rewards activated with 12% APY.',
          },
          {
            status: 'Completed' as const,
            quarter: 'Q3 2024',
            title: 'Institutional Custody Partnership',
            description:
              'Strategic partnership with Fireblocks and Anchorage Digital. $890M in institutional assets onboarded. SOC 2 Type II certification achieved.',
          },
          {
            status: 'In Progress' as const,
            quarter: 'Q4 2024',
            title: 'ZK-Rollup Integration',
            description:
              'Zero-knowledge proof verification for cross-chain transactions. Testing with 47 protocols. Expected 10x reduction in bridge confirmation times.',
          },
          {
            status: 'Planned' as const,
            quarter: 'Q1 2025',
            title: 'Enterprise SDK Release',
            description:
              'Complete TypeScript and Python SDKs with white-label wallet components. Fiat on/off-ramp integrations with Stripe and Circle.',
          },
          {
            status: 'Planned' as const,
            quarter: 'Q2 2025',
            title: 'Validator Expansion',
            description:
              'Validator set expansion to 500 nodes with permissionless entry. Expected throughput increase to 100,000 TPS.',
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const statusStyle = (status: string) => {
      if (status === 'Completed')
        return {
          node: 'bg-foreground text-background',
          line: 'bg-foreground/25',
          chip: 'border-foreground/25 text-foreground',
          pulse: false,
          showCheck: true,
        }
      if (status === 'In Progress')
        return {
          node: 'border border-primary text-primary',
          line: 'bg-border',
          chip: 'border-primary/40 text-primary',
          pulse: true,
          showCheck: false,
        }
      return {
        node: 'border border-border text-muted-foreground',
        line: 'bg-border',
        chip: 'border-border text-muted-foreground',
        pulse: false,
        showCheck: false,
      }
    }

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                  subtitleClassName="text-lg"
                />
                <p
                  aria-hidden="true"
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  [ log ] phased delivery
                </p>
                <span
                  aria-hidden="true"
                  className="pointer-events-none mt-8 hidden select-none font-mono text-[8rem] font-extrabold leading-none tracking-tighter text-foreground/[0.04] tabular-nums lg:block"
                >
                  {items[items.length - 1]?.quarter.split(' ')[0] ?? 'Q4'}
                </span>
              </div>
            </div>
            <div className="lg:col-span-8">
              <RoadmapTimeline className="relative flex flex-col">
                <Watermark className="-right-4 -top-10 font-mono text-[7rem] tabular-nums sm:text-[10rem] lg:hidden">
                  {items[items.length - 1]?.quarter.split(' ')[0] ?? 'Q4'}
                </Watermark>
                {items.map((item, i) => {
                  const s = statusStyle(item.status)
                  const isLast = i === items.length - 1
                  return (
                    <li
                      key={item.title}
                      className="relative flex gap-5 sm:gap-8"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'grid size-10 shrink-0 place-items-center font-mono text-xs font-semibold tabular-nums',
                            s.node,
                          )}
                        >
                          {s.showCheck ? (
                            <Check className="size-4" />
                          ) : (
                            <span className={cn(s.pulse && 'animate-pulse')}>
                              {item.quarter.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        {!isLast && (
                          <div className={cn('mt-2 h-full w-px', s.line)} />
                        )}
                      </div>
                      <div className={cn('flex-1', !isLast && 'pb-10')}>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span
                            className={cn(
                              'border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]',
                              s.chip,
                            )}
                          >
                            {item.status}
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                            {item.quarter}
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-bold tracking-tight">
                          {item.title}
                        </h3>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </RoadmapTimeline>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
