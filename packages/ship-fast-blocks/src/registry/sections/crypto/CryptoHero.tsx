import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * CryptoHero — Web3-terminal split hero for a crypto / DeFi infrastructure
 * landing page. Asymmetric 7/5 grid: left column carries a square mono
 * status chip with a pulsing block cursor, a giant tight-leading display
 * headline, supporting paragraph, dual square-cornered CTAs (inverted
 * primary with a hard offset shadow + hairline secondary, both with press
 * feedback), and mono uppercase trust rows with square tick markers; right
 * column is a chamfered-corner ticker terminal card with a mono symbol
 * block, tabular-nums price ledger cells split by hairlines, a ▲ change
 * readout, a bar-chart panel over an alt-driven chart image, and mono
 * volume/supply meta rows. A giant ghost Ξ watermark sits behind the panel.
 * Use as the opening hero for crypto protocols, DeFi platforms,
 * layer-1/layer-2 chains, bridges, or token projects.
 */
export const CryptoHero = defineCapsule({
  name: 'CryptoHero',
  description:
    'Web3-terminal split hero for a crypto / DeFi infrastructure landing page: asymmetric 7/5 layout with a square mono status chip, giant tight display headline, supporting paragraph, dual square CTAs (inverted primary with hard offset shadow + hairline secondary), and mono uppercase trust rows; right side is a chamfered-corner ticker terminal card with mono symbol block, tabular-nums price/market-cap ledger cells, ▲ change readout, mini bar chart over an alt-driven chart image, and mono volume/supply rows, backed by a giant ghost Ξ watermark. Use as the opening hero for crypto protocols, DeFi platforms, layer-1/layer-2 chains, bridges, or token projects.',
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

    const heroBars = [40, 55, 45, 70, 60, 85, 100]
    const chamfer =
      '[clip-path:polygon(0_0,calc(100%-1.5rem)_0,100%_1.5rem,100%_100%,0_100%)]'

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden', props.className)}
      >
        <Watermark className="right-0 top-1/2 -translate-y-1/2 text-[12rem] lg:text-[20rem]">
          Ξ
        </Watermark>
        <Container size="xl" className="relative pb-20 pt-16 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-8 inline-flex items-center gap-3 border border-border px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1 className="mb-6 max-w-2xl text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.95] tracking-tight">
                {heading}
              </h1>
              <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center bg-foreground px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-background shadow-[4px_4px_0_0] shadow-foreground/20 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center border border-border px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-foreground transition-colors duration-150 hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="size-1.5 bg-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className={cn('bg-border p-px', chamfer)}>
                <Card
                  className={cn(
                    'relative rounded-none border-0 text-card-foreground',
                    chamfer,
                  )}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center bg-foreground font-mono text-xl text-background"
                      >
                        Ξ
                      </div>
                      <div>
                        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
                          {token.name}
                        </h3>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {token.kind}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 border border-primary/30 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-primary">
                      <span aria-hidden="true">▲</span>
                      {token.change}
                    </span>
                  </div>
                  <ResponsiveGrid
                    cols="2"
                    className="mb-6 gap-0 divide-x divide-border border-y border-border"
                  >
                    <div className="p-4">
                      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Price
                      </p>
                      <p className="text-2xl font-semibold tabular-nums tracking-tight">
                        {token.price}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Market Cap
                      </p>
                      <p className="text-2xl font-semibold tabular-nums tracking-tight">
                        {token.marketCap}
                      </p>
                    </div>
                  </ResponsiveGrid>
                  <div className="relative h-32 overflow-hidden border border-border bg-muted">
                    <Image
                      alt={token.imageAlt}
                      w={800}
                      h={300}
                      loading="lazy"
                      className="size-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div
                        aria-hidden="true"
                        className="flex h-20 items-end gap-1"
                      >
                        {heroBars.map((h, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-3',
                              i === heroBars.length - 1
                                ? 'bg-foreground'
                                : 'bg-foreground/30',
                            )}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    <span className="tabular-nums">{token.volume}</span>
                    <span className="tabular-nums">{token.supply}</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
