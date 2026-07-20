import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FurnitureStoreFeatures — an editorial guarantees / value-prop ledger. A padded
 * section with an asymmetric left-aligned mono index eyebrow + heading above a
 * collapsed-hairline 4-up grid (1/2/4 columns responsive) of guarantee cells;
 * each rounded-none cell carries a giant mono index numeral, a title, and a
 * short supporting paragraph — a museum-label ledger, not icon-tile cards. An
 * optional icon slot still renders when a caller supplies one. Use to showcase
 * store guarantees, perks, or why-choose-us value props for furniture,
 * home-decor, interiors, or any warm retail brand. Renders fully with no props.
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
export const FurnitureStoreFeatures = defineCapsule({
  name: 'FurnitureStoreFeatures',
  description:
    'Editorial guarantees / value-prop ledger: a padded section with an asymmetric left-aligned mono index eyebrow + heading above a collapsed-hairline 4-up grid (1/2/4 columns responsive) of rounded-none guarantee cells, each carrying a giant mono index numeral, a title, and a short paragraph — a museum-label ledger, not icon-tile cards; an optional icon slot still renders when a caller supplies one. Use to showcase store guarantees, perks, or why-choose-us value props for furniture, home-decor, interiors, or any warm retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Why Haven & Home'
    const heading = props.heading ?? 'Designed for how you live'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Certified Sustainable',
            description:
              'FSC-certified wood, recycled fabrics, and non-toxic finishes on every piece.',
          },
          {
            title: '10-Year Warranty',
            description:
              'Built to last. Every frame, cushion, and joint guaranteed for a decade.',
          },
          {
            title: 'White Glove Delivery',
            description:
              'Room-of-choice delivery, assembly, and packaging removal included.',
          },
          {
            title: '30-Day Returns',
            description:
              'Not the perfect fit? Return or exchange within 30 days, no questions asked.',
          },
        ]
    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-features-heading"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            titleId="furniture-features-heading"
            className="mb-12 gap-0 lg:mb-16"
            eyebrowClassName="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
            titleClassName="text-3xl font-medium tracking-tight lg:text-4xl"
          />
          <FeatureGrid columns={4} className="border-l border-t border-border">
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
                  className="gap-4 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-none hover:translate-y-0 hover:border-border sm:p-8"
                >
                  {__iv__.icon ? (
                    <FeatureIcon className="rounded-none">
                      {__iv__.icon}
                    </FeatureIcon>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-muted-foreground/40"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                  <FeatureTitle className="text-base font-semibold tracking-tight">
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
