import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * PhotographyPricing — session-package pricing for a fine-art / wedding
 * photographer site. Thin configuration over the shared `PricingGrid`
 * composite: a centered serif header above three responsive tier cards
 * (portrait, full-day wedding, destination), each with a price, a coverage
 * line, an inclusions list, and a routable "Book a Shoot" CTA. The middle
 * wedding tier is highlighted with a "Most popular" pill. Each CTA routes
 * through useNavigate. Use to present collections for photographers, studios,
 * and elopement shooters. Renders fully with no props via baked-in defaults.
 */
export const PhotographyPricing = defineCapsule({
  name: 'PhotographyPricing',
  description:
    "Session-package pricing for a fine-art / wedding photographer site built on the shared PricingGrid composite: a centered serif header above three responsive tier cards (portrait, full-day wedding, destination), each with a price, a coverage period line, an inclusions list, and a routable 'Book a Shoot' CTA, with the middle wedding tier highlighted by a 'Most popular' pill. Each CTA routes through useNavigate. Use to present collections and session packages for photographers, studios, and elopement shooters.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers: name, price, coverage period, inclusions, CTA, highlight. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Portrait Session',
            price: '$450',
            period: '/ session',
            features: [
              'Up to 90 minutes of coverage',
              'One location of your choice',
              '40+ edited high-resolution images',
              'Private online gallery',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
          },
          {
            name: 'Full-Day Wedding',
            price: '$3,800',
            period: '/ day',
            features: [
              'Up to 10 hours of coverage',
              'Second photographer included',
              '600+ edited images, delivered in 4 weeks',
              'Engagement session included',
              'Heirloom print credit',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
            highlighted: true,
          },
          {
            name: 'Destination',
            price: '$5,500',
            period: '+ travel',
            features: [
              'Multi-day elopement coverage',
              'Travel & lodging coordinated',
              'Full edited gallery, no image cap',
              'Custom film & album add-ons',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
          },
        ]
    return (
      <PricingGrid
        heading={props.heading ?? 'Session packages'}
        subheading={
          props.subheading ??
          'Transparent collections for portraits, weddings, and destinations — every package includes a personal gallery and full editing.'
        }
        tiers={tiers}
        className={props.className}
      />
    )
  },
})
