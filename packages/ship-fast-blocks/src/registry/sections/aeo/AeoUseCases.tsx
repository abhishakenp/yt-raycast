import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const AeoUseCases = defineCapsule({
  name: 'AeoUseCases',
  description:
    'A use-cases section that explains practical scenarios and outcomes for the product or service. Use on SaaS, services, and product landing pages.',
  props: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
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
    const heading = props.heading ?? 'Popular use cases'
    const intro =
      props.intro ??
      'See how teams and customers use this product in real workflows.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Launch faster',
            description:
              'Ship a credible first version without rebuilding the same sections from scratch.',
          },
          {
            title: 'Explain the offer',
            description:
              'Help visitors understand what you do, who it is for, and why it matters.',
          },
          {
            title: 'Convert with confidence',
            description:
              'Answer common objections with clear benefits, proof, and next steps.',
          },
        ]

    return (
      <section
        className={cn('bg-muted/30 py-12 sm:py-16', props.className)}
        aria-label="Use cases"
      >
        <Container size="lg">
          <SectionHeading
            align="left"
            title={heading}
            subtitle={intro}
            className="mb-10 max-w-2xl gap-0"
            titleClassName="mb-3 text-2xl font-semibold text-foreground sm:text-3xl"
            subtitleClassName="text-muted-foreground"
          />
          <FeatureGrid columns={3}>
            {items
              .map((item) => ({
                title: item.title,
                description: item.description,
              }))
              .map((f) => {
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
                    <FeatureDescription>
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
