import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * CrowdfundingFeatures — a playful-bold 6-up product FEATURES grid for a
 * crowdfunding / campaign landing page. An asymmetric header — mono eyebrow +
 * extrabold left-aligned heading on the left, a mono "[ spec sheet ]" tag on
 * the right — above a 3-column grid of sharp 2px-bordered spec cards whose
 * middle column staggers downward on desktop. Each card opens with a mono
 * index numeral riding a tiny token-built progress-tick bar (the campaign's
 * bar motif in miniature), then a bold title and muted description; cards lift
 * on hover with a hard offset shadow. Use to spell out the product specs /
 * benefits of a launching product, hardware/maker project, or any campaign
 * where concrete feature bullets build buyer confidence.
 */
export const CrowdfundingFeatures = defineCapsule({
  name: 'CrowdfundingFeatures',
  description:
    "A playful-bold 6-up product FEATURES grid for a crowdfunding / campaign landing page: an asymmetric header (mono eyebrow + extrabold left-aligned heading left, mono '[ spec sheet ]' tag right) above a 3-column grid of sharp 2px-bordered spec cards whose middle column staggers downward on desktop, each opening with a mono index numeral on a tiny token-built progress-tick bar before a bold title and muted description, lifting on hover with a hard offset shadow. Use to spell out the product specs / benefits of a launching product, hardware/maker project, or any campaign where concrete feature bullets build buyer confidence.",
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

    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6', 'w-9', 'w-4']

    return (
      <section
        className={cn('bg-card py-16 sm:py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={featuresEyebrow}
              title={featuresHeading}
              align="left"
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-4xl"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ spec sheet ]
            </MonoTag>
          </div>

          <FeatureGrid columns={3}>
            {featureItems.map((f, i) => {
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
                  className={cn(
                    'rounded-none border-2 border-foreground/20 bg-background p-6 transition-all hover:-translate-y-1 hover:border-foreground hover:shadow-[5px_5px_0_0] hover:shadow-foreground/15 motion-reduce:transform-none',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <MonoTag>{String(i + 1).padStart(2, '0')}</MonoTag>
                    <span
                      aria-hidden="true"
                      className="flex items-center gap-1"
                    >
                      <span
                        className={cn(
                          'h-1.5 bg-primary',
                          tickWidths[i % tickWidths.length],
                        )}
                      />
                      <span className="h-1.5 w-1.5 bg-foreground/20" />
                      <span className="h-1.5 w-1.5 bg-foreground/20" />
                    </span>
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
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
