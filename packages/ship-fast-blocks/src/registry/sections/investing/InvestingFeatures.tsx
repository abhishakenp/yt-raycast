import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingFeatures — capabilities grid for an investing / fintech page. A muted
 * section band with a centered heading + lead above a responsive 1/2/3-column
 * grid of hover-lift cards; each card has a rounded tinted icon tile (rotating
 * inline line-icons in rotating token tints), a title and a description. Tokens
 * only, no links. Use to present a brokerage's core features — advanced
 * charting, zero commission, AI insights, security, social investing,
 * auto-invest — or any "everything you need" feature block. Renders fully with
 * no props via six baked-in default features.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
    "Capabilities grid for an investing / fintech page: a muted section band with a centered heading + lead above a responsive 1/2/3-column grid of hover-lift cards, each with a rounded tinted icon tile (rotating inline line-icons in rotating token tints), a title and a description. Tokens only, no links. Use to present a brokerage's core features (advanced charting, zero commission, AI insights, security, social investing, auto-invest) or any 'everything you need' feature block.",
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
        className={cn('bg-muted/50 py-24', props.className)}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FeatureGrid columns={3}>
            {items.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
