import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierName,
  PricingTierPrice,
  PricingTierTagline,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * InteriorDesignPricing — inverted (foreground-surface) services + pricing list
 * for an upscale interior-design / architecture studio. A dramatic two-column
 * band on the dark foreground surface: on the left an uppercase eyebrow, a
 * light-weight heading, a supporting paragraph and a filled inverted CTA; on the
 * right a divided vertical list of service tiers, each with a title, a right-
 * aligned price and a short description. Editorial, refined and high-contrast.
 * The CTA routes through useNavigate. Use to present service packages and
 * pricing for interior designers, design studios or architecture firms. Renders
 * fully with no props via baked-in defaults.
 */
export const InteriorDesignPricing = defineCapsule({
  name: 'InteriorDesignPricing',
  description:
    'Inverted (foreground-surface) services + pricing list for an upscale interior-design / architecture studio: a dramatic two-column band on the dark foreground surface with an uppercase eyebrow, light-weight heading, supporting paragraph and a filled inverted CTA on the left, and a divided vertical list of service tiers — each with a title, right-aligned price and short description — on the right. Editorial, refined and high-contrast; the CTA routes through useNavigate. Use to present service packages and pricing for interior designers, design studios or architecture firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          price: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Services'
    const heading = props.heading ?? 'Comprehensive design services'
    const description =
      props.description ??
      'From initial concept to final installation, we offer a full spectrum of interior design services tailored to projects of every scale.'
    const cta = props.cta ?? 'Request Service Guide'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Full-Service Design',
            price: 'From $25,000',
            description:
              'Complete interior design from concept through installation. Includes space planning, material selection, custom furniture design, and project management.',
          },
          {
            title: 'Design Consultation',
            price: '$500/hour',
            description:
              'Professional guidance for DIY projects or renovation planning. Includes detailed recommendations, material suggestions, and vendor referrals.',
          },
          {
            title: 'Furniture Procurement',
            price: 'Project-based',
            description:
              'Access to trade-only furniture and decor with designer discounts. We source, procure, and coordinate delivery and placement.',
          },
          {
            title: 'Styling & Accessories',
            price: 'From $5,000',
            description:
              'The finishing touches that make a house a home. Art curation, accessory selection, and professional styling for photography or living.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-foreground py-20 text-background md:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <PricingGrid className="grid-cols-1 items-start gap-16 sm:gap-6 md:grid-cols-1 lg:grid-cols-2 lg:gap-24 xl:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                align="left"
                eyebrowClassName="text-xs text-background/60 tracking-widest"
                titleClassName="text-3xl font-light text-background md:text-4xl"
                subtitleClassName="max-w-lg leading-relaxed text-background/70"
                className="mb-12 gap-4"
              />
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center bg-background px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
              >
                {cta}
              </button>
            </div>

            <div className="space-y-8">
              {items.map((item, i) => (
                <PricingTier
                  key={item.title}
                  className={cn(
                    'gap-0 rounded-none border-0 bg-transparent p-0 pb-8 shadow-none',
                    i < items.length - 1 && 'border-b border-background/20',
                  )}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <PricingTierName className="text-xl font-medium text-background">
                      {item.title}
                    </PricingTierName>
                    <PricingTierPrice className="whitespace-nowrap text-sm font-normal text-background/60">
                      {item.price}
                    </PricingTierPrice>
                  </div>
                  <PricingTierTagline className="text-sm leading-relaxed text-background/70">
                    {item.description}
                  </PricingTierTagline>
                </PricingTier>
              ))}
            </div>
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
