import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingMarkets — Swiss-fintech live market-data ledger for an investing /
 * brokerage page. An asymmetric mono header (heading + lede left, tabular quote
 * count right) sits above a collapsed-border grid of clickable quote cells
 * sharing hairline rules (square symbol tile, company name + exchange, a giant
 * tabular-nums price, a mono ▲/▼ change delta in primary/destructive, and a
 * div-built hairline bar spark), followed by an inverted (bg-foreground /
 * text-background) global-indices band on an asymmetric 7/5 split pairing a
 * collapsed-border 2×2 index ledger (value + percent change) with a full-bleed
 * trading-floor photo. Quote cells route through route links. Use to surface
 * real-time market quotes and world indices on a brokerage or trading-app home
 * page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  MarketTable,
  MarketRow,
  MarketBody,
  MarketChart,
  MarketIndicator,
} from '#/section-kit/MarketTable.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const InvestingMarkets = defineCapsule({
  name: 'InvestingMarkets',
  description:
    'Swiss-fintech live market-data ledger for an investing / brokerage page: an asymmetric mono header (heading + lede left, tabular quote count right) above a collapsed-border grid of clickable quote cells sharing hairline rules (square symbol tile, company name + exchange, a giant tabular-nums price, a mono ▲/▼ change delta in primary/destructive, and a div-built hairline bar spark), followed by an inverted global-indices band on a 7/5 split pairing a collapsed-border 2×2 index ledger (value + percent change) with a full-bleed trading-floor photo. Quote cells route through section-kit route links. Use to surface real-time market quotes and world indices on a brokerage or trading-app home page.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Quote tiles. */
    quotes: z
      .array(
        z.object({
          symbol: z.string(),
          name: z.string(),
          exchange: z.string(),
          price: z.string(),
          change: z.string(),
          up: z.boolean(),
        }),
      )
      .optional(),
    /** Dark indices band heading. */
    indicesHeading: z.string().optional(),
    /** Small note under the indices heading. */
    indicesNote: z.string().optional(),
    /** Alt text for the indices band photo. */
    indicesImageAlt: z.string().optional(),
    /** Index cards. */
    indices: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          change: z.string(),
          up: z.boolean(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Live market data at your fingertips'
    const description =
      props.description ??
      'Track global markets in real-time. From blue-chip stocks to emerging crypto, never miss a movement.'
    const quotes = props.quotes?.length
      ? props.quotes
      : [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            exchange: 'NASDAQ',
            price: '$187.42',
            change: '+1.24 (0.67%)',
            up: true,
          },
          {
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            exchange: 'NASDAQ',
            price: '$248.87',
            change: '-3.42 (1.36%)',
            up: false,
          },
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            exchange: 'Crypto',
            price: '$42,893',
            change: '+856 (2.04%)',
            up: true,
          },
          {
            symbol: 'NVDA',
            name: 'NVIDIA',
            exchange: 'NASDAQ',
            price: '$495.22',
            change: '+8.74 (1.80%)',
            up: true,
          },
        ]
    const indicesHeading = props.indicesHeading ?? 'Global indices overview'
    const indicesNote =
      props.indicesNote ??
      'Major world markets as of January 15, 2025, 4:00 PM EST'
    const indicesImageAlt =
      props.indicesImageAlt ??
      'stock market trading floor with multiple monitors displaying financial charts and data'
    const indices = props.indices?.length
      ? props.indices
      : [
          {
            name: 'S&P 500',
            value: '4,783.45',
            change: '+0.42%',
            up: true,
          },
          {
            name: 'NASDAQ',
            value: '15,055.65',
            change: '+0.68%',
            up: true,
          },
          {
            name: 'DOW JONES',
            value: '37,545.33',
            change: '-0.15%',
            up: false,
          },
          {
            name: 'FTSE 100',
            value: '7,682.30',
            change: '+0.23%',
            up: true,
          },
        ]
    const upBars = ['h-2', 'h-3', 'h-4', 'h-6', 'h-8']
    const downBars = ['h-8', 'h-6', 'h-4', 'h-3', 'h-2']
    return (
      <section
        id="markets"
        className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Markets
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / live
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(quotes.length).padStart(2, '0')} quotes ]
            </MonoTag>
          </div>

          <MarketTable
            variant="default"
            className="grid grid-cols-1 gap-0 rounded-none border-0 border-l border-t border-border md:grid-cols-2 lg:grid-cols-4"
          >
            <MarketBody asChild>
              <div className="contents">
                {quotes.map((q, i) => (
                  <MarketRow
                    asChild
                    key={q.symbol}
                    className="rounded-none border-0 border-b border-r border-border bg-card p-6 text-left transition-colors hover:bg-muted/40"
                  >
                    <NavbarRouteLink href={q.symbol}>
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="grid size-9 place-items-center rounded-none border border-border bg-muted font-mono text-[11px] font-semibold tracking-tight text-foreground"
                          >
                            {q.symbol}
                          </span>
                          <div>
                            <p className="font-semibold tracking-tight text-foreground">
                              {q.name}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {q.exchange}
                            </p>
                          </div>
                        </div>
                        <span
                          aria-hidden="true"
                          className="font-mono text-[10px] tabular-nums text-muted-foreground/50"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <MarketChart className="items-end justify-between gap-3">
                        <div>
                          <p className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
                            {q.price}
                          </p>
                          <MarketIndicator asChild>
                            <p
                              className={cn(
                                'font-mono text-[11px] font-semibold tabular-nums',
                                q.up ? 'text-primary' : 'text-destructive',
                              )}
                            >
                              <span aria-hidden="true">{q.up ? '▲' : '▼'}</span>{' '}
                              {q.change}
                            </p>
                          </MarketIndicator>
                        </div>
                        <span
                          aria-hidden="true"
                          className="flex h-8 items-end gap-1"
                        >
                          {(q.up ? upBars : downBars).map((h, b) => (
                            <span
                              key={b}
                              className={cn(
                                'w-1',
                                h,
                                q.up ? 'bg-primary' : 'bg-destructive',
                              )}
                            />
                          ))}
                        </span>
                      </MarketChart>
                    </NavbarRouteLink>
                  </MarketRow>
                ))}
              </div>
            </MarketBody>
          </MarketTable>

          <div className="relative mt-8 overflow-hidden border border-foreground bg-foreground text-background">
            <div className="grid items-stretch lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-7">
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-background/20 pb-4">
                  <MonoTag tone="inverted">{indicesHeading}</MonoTag>
                  <MonoTag
                    aria-hidden="true"
                    className="shrink-0 tabular-nums text-background/40"
                  >
                    [ {String(indices.length).padStart(2, '0')} ]
                  </MonoTag>
                </div>
                <p className="mb-6 text-sm text-background/60">{indicesNote}</p>
                <div className="grid grid-cols-2 gap-0 border-l border-t border-background/20">
                  {indices.map((idx) => (
                    <div
                      key={idx.name}
                      className="border-b border-r border-background/20 p-5"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-background/60">
                        {idx.name}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold tracking-tight text-background tabular-nums">
                        {idx.value}
                      </p>
                      <p
                        className={cn(
                          'mt-1 font-mono text-[11px] font-semibold tabular-nums',
                          idx.up ? 'text-background' : 'text-destructive',
                        )}
                      >
                        <span aria-hidden="true">{idx.up ? '▲' : '▼'}</span>{' '}
                        {idx.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[220px] lg:col-span-5 lg:min-h-full">
                <Image
                  alt={indicesImageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
