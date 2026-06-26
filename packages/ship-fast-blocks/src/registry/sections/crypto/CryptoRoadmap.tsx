import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * CryptoRoadmap — vertical phased timeline for a crypto / DeFi development
 * roadmap. A centered heading + description followed by a vertical timeline
 * with colored status nodes (Completed/In Progress/Planned), connecting lines,
 * status chips, quarter labels, bold titles, and descriptive paragraphs. The
 * node shows a check mark for Completed or the quarter prefix for other
 * statuses. Use as a product roadmap for protocols, chains, token projects,
 * or infrastructure platforms.
 */
export const CryptoRoadmap = defineComponent({
  name: 'CryptoRoadmap',
  description:
    'Vertical phased timeline for a crypto / DeFi development roadmap: centered heading + description, then a vertical timeline with colored status nodes (Completed/In Progress/Planned), connecting lines, status chips with quarter labels, bold titles, and descriptive paragraphs. Completed nodes show a check mark; others show the quarter prefix. Use as a product roadmap for protocols, chains, token projects, or infrastructure platforms.',
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

    const statusStyle = (status: 'Completed' | 'In Progress' | 'Planned') => {
      if (status === 'Completed')
        return {
          node: 'bg-primary/15 text-primary',
          line: 'bg-primary/30',
          chip: 'text-primary bg-primary/10',
          showCheck: true,
        }
      if (status === 'In Progress')
        return {
          node: 'bg-accent text-accent-foreground',
          line: 'bg-border',
          chip: 'text-accent-foreground bg-accent',
          showCheck: false,
        }
      return {
        node: 'bg-muted text-muted-foreground',
        line: 'bg-border',
        chip: 'text-muted-foreground bg-muted',
        showCheck: false,
      }
    }

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto max-w-4xl space-y-8">
            {items.map((item, i) => {
              const s = statusStyle(item.status)
              const isLast = i === items.length - 1
              return (
                <div key={item.title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'grid size-10 place-items-center rounded-full',
                        s.node,
                      )}
                    >
                      {s.showCheck ? (
                        <Check className="size-5" />
                      ) : (
                        <span className="text-sm font-medium">
                          {item.quarter.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    {!isLast && (
                      <div className={cn('mt-2 h-full w-px', s.line)} />
                    )}
                  </div>
                  <div className={cn('flex-1', !isLast && 'pb-8')}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-2 py-1 text-sm font-medium',
                          s.chip,
                        )}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.quarter}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
