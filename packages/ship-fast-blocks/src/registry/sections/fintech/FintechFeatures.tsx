import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * FintechFeatures — Swiss-fintech collapsed-border capability ledger for a
 * digital-banking landing page. An asymmetric header (left-aligned heading +
 * lede, mono meta count right) sits above a sharp-cornered, collapsed-border
 * 3-column grid whose cells share hairline rules (binary radius, no gaps); each
 * cell carries a mono index numeral, a title, and a description, with the ink
 * hairline thickening on hover. No icon tiles — the ledger structure and mono
 * indexing carry the rhythm. Use to showcase product capabilities (transfers,
 * cards, savings, analytics, payments, business accounts). Tokens-only, no
 * links. Renders fully with no props via baked-in defaults.
 */
export const FintechFeatures = defineCapsule({
  name: 'FintechFeatures',
  description:
    'Swiss-fintech collapsed-border capability ledger for a digital-banking landing page: an asymmetric header (left-aligned heading + lede, mono meta count right) above a sharp-cornered, collapsed-border 3-column grid whose cells share hairline rules and carry a mono index numeral, a title and a description with an ink-hairline hover. No icon tiles — the ledger structure carries the rhythm. Use to showcase product capabilities (transfers, cards, savings, analytics, payments, business accounts). Tokens-only, no links.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need in one place'
    const description =
      props.description ??
      'From instant transfers to smart savings, Vault puts you in complete control of your money.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Instant Transfers',
            description:
              'Send money to anyone, anywhere in seconds. Zero fees between Vault accounts. Real-time notifications on every transaction.',
          },
          {
            title: 'Virtual & Physical Cards',
            description:
              'Generate unlimited virtual cards for online purchases. Order physical cards with customizable designs. Freeze instantly if lost.',
          },
          {
            title: 'Smart Savings Goals',
            description:
              'Set custom savings goals with automatic round-ups. Earn 3.5% APY on your savings. No minimum balance required ever.',
          },
          {
            title: 'Spending Analytics',
            description:
              'Beautiful charts show exactly where your money goes. Categorize transactions automatically. Get weekly spending insights.',
          },
          {
            title: 'Global Payments',
            description:
              'Send money to 180+ countries with competitive exchange rates. Multi-currency accounts. SWIFT and local transfer options.',
          },
          {
            title: 'Business Accounts',
            description:
              'Separate business and personal finances effortlessly. Team access controls. Invoice generation and expense tracking built-in.',
          },
        ]

    return (
      <section className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Capabilities
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / 06
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
