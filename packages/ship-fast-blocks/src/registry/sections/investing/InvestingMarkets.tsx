import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingMarkets — live market-data section for an investing / fintech page. A
 * centered heading + lead above a responsive 4-up grid of clickable quote tiles
 * (colored symbol badge, company name + exchange, price, green/red change, and
 * an up/down mini sparkline), followed by a dark global-indices band pairing a
 * 2x2 grid of index cards (value + percent change) with a full-bleed trading
 * floor photo. Quote tiles route through useNavigate. Use to surface real-time
 * market quotes and world indices on a brokerage or trading-app home page.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { MarketTable, MarketRow, MarketHeader, MarketBody } from '#/section-kit/MarketTable.tsx'
export const InvestingMarkets = defineCapsule({
  name: 'InvestingMarkets',
  description:
    'Live market-data section for an investing / fintech page: a centered heading + lead above a responsive 4-up grid of clickable quote tiles (colored symbol badge, company name + exchange, price, green/red change and an up/down mini sparkline), followed by a dark global-indices band pairing a 2x2 grid of index cards (value + percent change) with a full-bleed trading-floor photo. Quote tiles route through useNavigate. Use to surface real-time market quotes and world indices on a brokerage or trading-app home page.',
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
    const go = useNavigate()
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
    const symbolTones = [
      'bg-chart-1 text-primary-foreground',
      'bg-destructive text-destructive-foreground',
      'bg-chart-4 text-primary-foreground',
      'bg-chart-2 text-primary-foreground',
    ]
    const trendUp = 'M0,35 Q20,28 40,22 T80,6'
    const trendDown = 'M0,12 Q20,18 40,24 T80,36'
    return (
      <section
        id="markets"
        className={cn('bg-background py-24', props.className)}
      >
        <Container>
          <MarketHeader asChild>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          </MarketHeader>
          <MarketTable
            variant="default"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 border-0"
          >
            <MarketBody asChild>
            <div className="contents">
            {quotes.map((q, i) => (
              <MarketRow asChild key={q.symbol}>
                <Card
                  asChild
                  variant="outline"
                  rounded="xl"
                  padding="md"
                  className="bg-muted/50 text-left transition-shadow hover:shadow-lg"
                >
                <button type="button" onClick={() => go(q.symbol)}>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        'grid size-10 place-items-center rounded-lg text-sm font-bold',
                        symbolTones[i % symbolTones.length],
                      )}
                    >
                      {q.symbol}
                    </div>
                    <div>
                      <p className="font-semibold">{q.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.exchange}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-semibold">{q.price}</p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          q.up ? 'text-chart-1' : 'text-destructive',
                        )}
                      >
                        {q.change}
                      </p>
                    </div>
                    <svg
                      className={cn(
                        'h-10 w-20',
                        q.up ? 'text-chart-1' : 'text-destructive',
                      )}
                      viewBox="0 0 80 40"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        d={q.up ? trendUp : trendDown}
                      />
                    </svg>
                  </div>
                </button>
                </Card>
              </MarketRow>
            ))}
            </div>
            </MarketBody>
          </MarketTable>

          <div className="mt-8 overflow-hidden rounded-2xl bg-foreground p-6 text-background sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-2xl font-semibold">
                  {indicesHeading}
                </h3>
                <p className="mb-6 text-background/60">{indicesNote}</p>
                <div className="grid grid-cols-2 gap-4">
                  {indices.map((idx) => (
                    <div
                      key={idx.name}
                      className="rounded-lg bg-background/10 p-4"
                    >
                      <p className="mb-1 text-sm text-background/60">
                        {idx.name}
                      </p>
                      <p className="text-xl font-semibold">{idx.value}</p>
                      <p
                        className={cn(
                          'text-sm',
                          idx.up ? 'text-chart-1' : 'text-destructive',
                        )}
                      >
                        {idx.change}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64 min-h-[200px] lg:h-full">
                <Image
                  alt={indicesImageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="absolute inset-0 size-full rounded-xl object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
