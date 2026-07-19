import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
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
 * InvestingHero — split hero for a modern investing / fintech brokerage landing
 * page. A two-column layout pairing bold conversion copy (an AI-insights pill
 * badge, a large headline, a lead paragraph, dual primary/secondary CTAs and a
 * row of green-checked trust ticks) on the left with a floating live
 * portfolio-value card on the right: portfolio value + today's change,
 * 1D/1W/1M range tabs, an area-fill sparkline with an S&P 500 ticker chip, and a
 * three-up buying-power / dividends / YTD-return stat row, set against soft
 * blurred accent blobs. Use as the opening hero for stock brokerages, trading
 * apps, robo-advisors or crypto exchanges. Renders fully with no props.
 */
export const InvestingHero = defineCapsule({
  name: 'InvestingHero',
  description:
    "Split hero for a modern investing / fintech brokerage landing page: bold conversion copy (AI-insights pill badge, large headline, lead paragraph, dual primary/secondary CTAs, green-checked trust ticks) on the left paired with a floating live portfolio-value card on the right showing portfolio value + today's change, 1D/1W/1M range tabs, an area-fill sparkline with an S&P 500 ticker chip, and a three-up buying-power/dividends/YTD-return stat row, over soft blurred accent blobs. All CTAs route through section-kit route links. Use as the opening hero for stock brokerages, trading apps, robo-advisors or crypto exchanges.",
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
        <Container size="xl" className="pb-24 pt-16 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-chart-1" />
                {badge}
              </div>
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-chart-1" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 -z-10 size-72 rounded-full bg-muted opacity-60 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -left-8 -z-10 size-72 rounded-full bg-chart-1/15 opacity-60 blur-3xl"
              />
              <Card className="relative text-card-foreground rounded-2xl shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">
                      {portfolioLabel}
                    </p>
                    <p className="text-3xl font-semibold">{portfolioValue}</p>
                    <p className="text-sm font-medium text-chart-1">
                      {portfolioChange}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {['1D', '1W', '1M'].map((range, i) => (
                      <NavbarRouteLink
                        key={range}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          i === 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent',
                        )}
                        href={`${range} chart`}
                      >
                        {range}
                      </NavbarRouteLink>
                    ))}
                  </div>
                </div>
                <div className="relative flex h-48 items-end overflow-hidden rounded-xl bg-gradient-to-b from-chart-1/10 to-transparent px-4 pb-4">
                  <svg
                    className="h-32 w-full text-chart-1"
                    viewBox="0 0 400 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      fillOpacity="0.1"
                      d="M0,80 Q50,70 100,60 T200,40 T300,50 T400,20 L400,100 L0,100 Z"
                    />
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      d="M0,80 Q50,70 100,60 T200,40 T300,50 T400,20"
                    />
                  </svg>
                  <div className="absolute right-4 top-4 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                    <span className="text-muted-foreground">{indexLabel}</span>
                    <span className="block font-semibold">{indexValue}</span>
                  </div>
                </div>
                <StatGrid
                  columns={3}
                  className="mt-6 border-t border-border pt-6 gap-6"
                >
                  {cardStats.map((s, i) => (
                    <StatItem key={s.label} align="left">
                      <StatLabel className="mb-1 text-xs">{s.label}</StatLabel>
                      <StatValue
                        weight="semibold"
                        size="default"
                        className={cn(
                          'text-lg',
                          i === cardStats.length - 1
                            ? 'text-chart-1'
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
          </div>
        </Container>
      </HeroSection>
    )
  },
})
