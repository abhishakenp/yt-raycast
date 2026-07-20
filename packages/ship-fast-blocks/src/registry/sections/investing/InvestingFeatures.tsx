import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingFeatures — Swiss-fintech collapsed-border capability ledger for an
 * investing / brokerage page. An asymmetric header (left-aligned heading + lede,
 * mono meta count right) sits above a sharp-cornered, collapsed-border 3-column
 * grid whose cells share hairline rules (binary radius, no gaps); each cell
 * carries a mono index numeral, a title, and a description, with the ink
 * hairline thickening on hover. No icon tiles — the ledger structure and mono
 * indexing carry the rhythm. Tokens only, no links. Use to present a brokerage's
 * core capabilities — advanced charting, zero commission, AI insights, security,
 * social investing, auto-invest — or any "everything you need" feature block.
 * Renders fully with no props via six baked-in default features.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const InvestingFeatures = defineCapsule({
  name: 'InvestingFeatures',
  description:
    "Swiss-fintech collapsed-border capability ledger for an investing / brokerage page: an asymmetric header (left-aligned heading + lede, mono meta count right) above a sharp-cornered, collapsed-border 3-column grid whose cells share hairline rules and carry a mono index numeral, a title and a description with an ink-hairline hover. No icon tiles — the ledger structure carries the rhythm. Tokens only, no links. Use to present a brokerage's core capabilities (advanced charting, zero commission, AI insights, security, social investing, auto-invest) or any 'everything you need' feature block.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to invest smarter'
    const description =
      props.description ??
      'Professional-grade tools made simple. From first-time investors to seasoned traders.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Advanced Charting',
            description:
              'Technical analysis with 50+ indicators, drawing tools, and customizable timeframes. Spot trends before they happen.',
          },
          {
            title: 'Zero Commission',
            description:
              'Trade stocks, ETFs, and options without commission fees. Keep more of what you earn with every transaction.',
          },
          {
            title: 'AI Insights',
            description:
              'Machine learning algorithms analyze your portfolio and market conditions to suggest optimizations and opportunities.',
          },
          {
            title: 'Bank-Grade Security',
            description:
              '256-bit encryption, biometric authentication, and SIPC insurance up to $500,000 protect your assets.',
          },
          {
            title: 'Social Investing',
            description:
              'Follow top investors, share strategies, and learn from a community of over 2 million active traders.',
          },
          {
            title: 'Auto-Invest',
            description:
              'Set up recurring deposits and automatically invest in your preferred assets. Build wealth passively.',
          },
        ]
    return (
      <section
        id="features"
        className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Capabilities
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / {String(items.length).padStart(2, '0')}
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
              [ {String(items.length).padStart(2, '0')} modules ]
            </MonoTag>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
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
                  className="gap-3 rounded-none border-0 border-b border-r border-border bg-transparent p-7 transition-colors duration-150 hover:border-foreground/30 hover:bg-muted/30 sm:p-8"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                  </div>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-semibold tracking-tight">
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
