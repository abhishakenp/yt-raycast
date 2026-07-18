import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * FintechFeatures — 6-up features grid for a digital-banking / fintech landing
 * page. A centered section heading + description above a responsive 1/2/3-column
 * grid of border-muted cards; each card carries a tokenized primary-colored
 * icon tile (rotating inline line-icons), a title, and a description. Use to
 * showcase product capabilities (transfers, cards, savings, analytics,
 * payments, business accounts). Tokens-only, no links. Renders fully with no
 * props via baked-in defaults.
 */
export const FintechFeatures = defineCapsule({
  name: 'FintechFeatures',
  description:
    '6-up features grid for a digital-banking / fintech landing page: centered section heading + description above a responsive 1/2/3-column grid of border-muted cards, each with a tokenized primary-colored icon tile (rotating inline line-icons), a title and a description. Use to showcase product capabilities (transfers, cards, savings, analytics, payments, business accounts). Tokens-only, no links.',
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
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
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
