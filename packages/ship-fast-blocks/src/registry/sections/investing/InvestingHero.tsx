import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * InvestingHero — Swiss-fintech asymmetric 7/5 split hero for a modern investing
 * / brokerage landing page. The left column carries a mono micro-label index
 * eyebrow + insights pill, a large tracking-tight headline, a lead paragraph,
 * dual CTAs (a square binary-radius primary with a hard offset shadow and
 * mechanical press feedback + a ghost secondary with a play glyph), and a
 * hairline mono row of trust ticks. The narrower right column frames a floating
 * live portfolio ledger card in a sharp bordered surface with a hard offset
 * shadow: a mono label, a giant tabular-nums portfolio value, a positive mono
 * ▲ delta, square 1D/1W/1M range tabs, a div-built hairline bar spark with a
 * floating S&P 500 ticker chip, and a three-up buying-power / dividends / YTD
 * stat ledger — all behind a giant ghost "$" watermark. Both CTAs and the range
 * tabs route through route links. Use as the opening hero for stock brokerages,
 * trading apps, robo-advisors or crypto exchanges. Renders fully with no props.
 */
export const InvestingHero = defineCapsule({
  name: 'InvestingHero',
  description:
    "Swiss-fintech asymmetric 7/5 split hero for a modern investing / brokerage landing page: a left column with a mono micro-label index eyebrow + insights pill, a large tracking-tight headline, a lead paragraph, dual CTAs (a square primary with a hard offset shadow + press feedback and a ghost secondary), and a hairline mono row of trust ticks, paired with a narrower right column framing a floating live portfolio ledger card (sharp bordered surface, hard offset shadow) showing a giant tabular-nums portfolio value, a positive mono ▲ delta, square 1D/1W/1M range tabs, a div-built hairline bar spark with an S&P 500 ticker chip, and a three-up buying-power/dividends/YTD stat ledger, behind a giant ghost '$' watermark. Both CTAs and the range tabs route through section-kit route links. Use as the opening hero for stock brokerages, trading apps, robo-advisors or crypto exchanges.",
  props: z.object({
    /** AI-insights pill badge above the headline. */
    badge: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Lead paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outline secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Green-checked trust ticks beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    /** Live portfolio card: label + value + today's change. */
    portfolioLabel: z.string().optional(),
    portfolioValue: z.string().optional(),
    portfolioChange: z.string().optional(),
    /** Sparkline ticker chip: index label + value. */
    indexLabel: z.string().optional(),
    indexValue: z.string().optional(),
    /** Three-up stat row at the card foot. */
    cardStats: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'Now with AI-powered insights'
    const heading = props.heading ?? 'Invest with clarity and confidence'
    const subheading =
      props.subheading ??
      'Build and track your portfolio with professional-grade tools. Real-time data, zero commission trades, and personalized insights for every investor.'
    const primaryCta = props.primaryCta ?? 'Start investing free'
    const secondaryCta = props.secondaryCta ?? 'View demo'
    const trust = props.trust?.length
      ? props.trust
      : ['$0 commission', 'SEC registered']
    const portfolioLabel = props.portfolioLabel ?? 'Portfolio Value'
    const portfolioValue = props.portfolioValue ?? '$48,293.47'
    const portfolioChange = props.portfolioChange ?? '+$1,247.32 (2.6%) today'
    const indexLabel = props.indexLabel ?? 'S&P 500'
    const indexValue = props.indexValue ?? '4,783.45'
    const cardStats = props.cardStats?.length
      ? props.cardStats
      : [
          { label: 'Buying Power', value: '$12,450' },
          { label: 'Dividends', value: '$89.34' },
          { label: 'YTD Return', value: '+18.4%' },
        ]
    const bars = ['h-5', 'h-8', 'h-6', 'h-12', 'h-7', 'h-16', 'h-10', 'h-20']

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-top-10 right-[-2%] hidden text-[24rem] leading-none lg:block">
          $
        </Watermark>
        <Container className="relative grid items-center gap-12 py-20 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:py-28">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex items-center gap-3">
              <MonoTag className="text-primary">01 / Markets</MonoTag>
              <span aria-hidden="true" className="h-px w-8 bg-border" />
              <MonoTag tone="faint">{badge}</MonoTag>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {subheading}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center gap-2 rounded-none border border-border px-5 py-3 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                href={secondaryCta}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {secondaryCta}
              </NavbarRouteLink>
            </div>
            <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5">
              {trust.map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  <Check className="size-3.5 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-5">
            <DotGrid
              tone="border"
              className="-right-4 -top-4 hidden size-28 sm:block"
            />
            <Card className="relative rounded-none border-foreground bg-card text-card-foreground shadow-[10px_10px_0_0] shadow-foreground">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <MonoTag tone="faint">{portfolioLabel}</MonoTag>
                  <p className="mt-2 text-4xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
                    {portfolioValue}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                    <span aria-hidden="true">▲</span> {portfolioChange}
                  </p>
                </div>
                <div className="flex gap-0 border border-border">
                  {['1D', '1W', '1M'].map((range, i) => (
                    <NavbarRouteLink
                      key={range}
                      className={cn(
                        'px-3 py-1.5 font-mono text-[11px] font-medium tabular-nums transition-colors',
                        i === 1
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:bg-muted',
                        i > 0 ? 'border-l border-border' : '',
                      )}
                      href={`${range} chart`}
                    >
                      {range}
                    </NavbarRouteLink>
                  ))}
                </div>
              </div>
              <div className="relative border border-border bg-muted/30 px-4 pb-4 pt-8">
                <div
                  aria-hidden="true"
                  className="flex h-32 items-end justify-between gap-1.5"
                >
                  {bars.map((h, i) => (
                    <span
                      key={i}
                      className={cn(
                        'w-full',
                        h,
                        i === bars.length - 1
                          ? 'bg-primary'
                          : 'bg-foreground/20',
                      )}
                    />
                  ))}
                </div>
                <div className="absolute right-4 top-3 border border-border bg-background px-3 py-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {indexLabel}
                  </span>
                  <span className="block font-mono text-sm font-semibold tabular-nums text-foreground">
                    {indexValue}
                  </span>
                </div>
              </div>
              <StatGrid
                columns={3}
                className="mt-6 gap-0 border-l border-t border-border"
              >
                {cardStats.map((s, i) => (
                  <StatItem
                    key={s.label}
                    align="left"
                    className="gap-1 border-b border-r border-border p-4"
                  >
                    <StatLabel className="mb-0 font-mono text-[10px] uppercase tracking-[0.14em]">
                      {s.label}
                    </StatLabel>
                    <StatValue
                      className={cn(
                        'mb-0 text-lg font-extrabold tracking-tight tabular-nums',
                        i === cardStats.length - 1
                          ? 'text-primary'
                          : 'text-foreground',
                      )}
                    >
                      {s.value}
                    </StatValue>
                  </StatItem>
                ))}
              </StatGrid>
            </Card>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
