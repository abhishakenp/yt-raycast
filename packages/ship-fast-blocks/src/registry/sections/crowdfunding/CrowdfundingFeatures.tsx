import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * CrowdfundingFeatures — a 6-up product FEATURES grid for a crowdfunding /
 * campaign landing page. On a card surface: a centered uppercase eyebrow +
 * heading above a responsive 1/2/3-column grid of muted feature cards, each
 * with a rounded primary-tinted icon tile (rotating through a set of outline
 * glyphs), a bold title, and a muted description. Use to spell out the product
 * specs / benefits of a launching product, hardware/maker project, or any
 * campaign where concrete feature bullets build buyer confidence.
 */
export const CrowdfundingFeatures = defineCapsule({
  name: 'CrowdfundingFeatures',
  description:
    'A 6-up product FEATURES grid for a crowdfunding / campaign landing page on a card surface: a centered uppercase eyebrow + heading above a responsive 1/2/3-column grid of muted feature cards, each with a rounded primary-tinted icon tile (rotating through a set of outline glyphs), a bold title, and a muted description. Use to spell out the product specs / benefits of a launching product, hardware/maker project, or any campaign where concrete feature bullets build buyer confidence.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresEyebrow = props.eyebrow ?? 'Features'
    const featuresHeading =
      props.heading ?? 'Designed for Performance. Built for the Planet.'
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: '40,000 VPM Sonic Motor',
            description:
              'Clinically proven to remove 10x more plaque than manual brushing with whisper-quiet operation.',
          },
          {
            title: '98% Biodegradable',
            description:
              'Bamboo composite handle breaks down in months, not centuries. Just remove the small motor for recycling.',
          },
          {
            title: 'Replaceable Brush Heads',
            description:
              'Snap-on heads made from plant-based bristles and recyclable aluminum ferrule. 4-pack for $18.',
          },
          {
            title: '30-Day Battery Life',
            description:
              'USB-C rechargeable lithium battery. One charge lasts a month of twice-daily brushing.',
          },
          {
            title: 'Naturally Antimicrobial',
            description:
              "Bamboo's natural antimicrobial properties keep your brush fresher, longer. No chemical coatings needed.",
          },
          {
            title: 'Zero-Plastic Packaging',
            description:
              'Shipped in 100% recycled and recyclable paper-based packaging. No plastic film, no foam.',
          },
        ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {featuresEyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
              {featuresHeading}
            </h2>
          </div>

          <FeatureGrid columns={3}>
            {featureItems.map((f) => {
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
