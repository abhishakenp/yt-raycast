import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * CryptoHero — split-layout hero section for a crypto / DeFi infrastructure
 * landing page. A two-column layout on desktop: left side carries a pulsing
 * mainnet-live status pill, a bold multi-line headline, a supporting
 * paragraph, dual CTAs (filled primary + outlined secondary), and trust
 * chips with check-circle icons; right side displays a live token price card
 * with token details, a mini decorative bar chart, and a background chart
 * image. Use as the opening hero for crypto protocols, DeFi platforms,
 * layer-1/layer-2 chains, bridges, or token projects.
 */
export const CryptoHero = defineCapsule({
  name: 'CryptoHero',
  description:
    'Split-layout hero section for a crypto / DeFi infrastructure landing page: left side has a pulsing mainnet-live status pill, bold multi-line headline, supporting paragraph, dual CTAs (filled primary + outlined secondary), and trust chips with check-circle icons; right side shows a live token price card with token details, mini decorative bar chart, and alt-driven background chart image. Use as the opening hero for crypto protocols, DeFi platforms, layer-1/layer-2 chains, bridges, or token projects.',
  props: z.object({
    /** Status pill text (e.g. 'Mainnet Live • v2.4 Released'). */
    badge: z.string().optional(),
    /** Hero headline. */
    heading: z.string().optional(),
    /** Subheading paragraph. */
    subheading: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust chip lines beneath CTAs. */
    trust: z.array(z.string()).optional(),
    /** Live token price card data. */
    token: z
      .object({
        name: z.string(),
        kind: z.string(),
        change: z.string(),
        price: z.string(),
        marketCap: z.string(),
        imageAlt: z.string(),
        volume: z.string(),
        supply: z.string(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Mainnet Live • v2.4 Released'
    const heading =
      props.heading ?? 'The infrastructure layer for decentralized finance'
    const subheading =
      props.subheading ??
      'NexusChain provides enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization. Process 50,000+ TPS with sub-second finality.'
    const primaryCta = props.primaryCta ?? 'Start Building'
    const secondaryCta = props.secondaryCta ?? 'View Documentation'
    const trust = props.trust?.length
      ? props.trust
      : ['Audited by OpenZeppelin', '$2.4B TVL Secured']
    const token = props.token ?? {
      name: 'NEX Token',
      kind: 'Utility & Governance',
      change: '+12.4%',
      price: '$4.28',
      marketCap: '$856M',
      imageAlt:
        'Abstract data visualization showing upward trending financial chart with gradient glow',
      volume: '24h Volume: $48.2M',
      supply: 'Circulating: 200M NEX',
    }

    const CheckCircle = ({ className }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const heroBars = [40, 55, 45, 70, 60, 85, 100]

    return (
      <section className={cn('relative overflow-hidden', props.className)}>
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-muted to-muted/40"
              />
              <Card
                rounded="2xl"
                shadow="sm"
                className="relative text-card-foreground"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background">
                      <svg
                        className="size-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{token.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {token.kind}
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {token.change}
                  </span>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Price</p>
                    <p className="text-xl font-semibold">{token.price}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Market Cap
                    </p>
                    <p className="text-xl font-semibold">{token.marketCap}</p>
                  </div>
                </div>
                <div className="relative h-32 overflow-hidden rounded-lg bg-muted">
                  <Image
                    alt={token.imageAlt}
                    w={800}
                    h={300}
                    loading="lazy"
                    className="size-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-end p-4">
                    <div className="flex h-20 items-end gap-1">
                      {heroBars.map((h, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-3 rounded-t',
                            i === heroBars.length - 1
                              ? 'bg-foreground'
                              : 'bg-muted-foreground/60',
                          )}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{token.volume}</span>
                  <span>{token.supply}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
