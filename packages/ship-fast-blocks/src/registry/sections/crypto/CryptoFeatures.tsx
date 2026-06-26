import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * CryptoFeatures — 6-up feature capabilities grid for a crypto / DeFi
 * infrastructure landing page. A centered heading + description followed by
 * a responsive three-column card grid. Each card shows a semantic icon in a
 * muted badge, a bold title, and a description paragraph. Icons rotate
 * through a local set (bolt, swap, lock, shield, chart, users). Use to
 * showcase settlement, bridging, custody, security, analytics, or governance
 * capabilities.
 */
export const CryptoFeatures = defineComponent({
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

    const featureIcons: ReactNode[] = [
      <svg
        key="bolt"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      <svg
        key="swap"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>,
      <svg
        key="lock"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>,
      <svg
        key="shield"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>,
      <svg
        key="chart"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>,
      <svg
        key="users"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 text-card-foreground transition-colors hover:border-border/60"
              >
                <div className="mb-4 grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
