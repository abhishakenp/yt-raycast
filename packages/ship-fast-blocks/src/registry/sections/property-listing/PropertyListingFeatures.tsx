import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * PropertyListingFeatures — portal-benefits grid for a property marketplace. A
 * centered header sits above a responsive 1/2/4-column grid of benefit cards;
 * each card has a token-tinted square icon chip (initial glyph), a title, and a
 * short description. Defaults cover verified listings, map search, saved alerts,
 * and virtual tours. Use to explain why renters and buyers should search on the
 * portal. Renders fully with no props via baked-in defaults.
 */
export const PropertyListingFeatures = defineCapsule({
  name: 'PropertyListingFeatures',
  description:
    'Portal-benefits grid for a property marketplace: a centered header above a responsive 1/2/4-column grid of benefit cards, each with a token-tinted square icon chip, a title, and a short description. Defaults cover verified listings, map search, saved alerts, and virtual tours. Use to explain why renters and buyers should search on the portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Benefit cards. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'A smarter way to search'
    const description =
      props.description ??
      'Everything you need to find the right place faster — and skip the listings that waste your time.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Verified listings',
            description:
              "Every listing is checked for accuracy and freshness, so you never chase a place that's already gone.",
          },
          {
            title: 'Map search',
            description:
              'Draw your area, see commute times, and explore homes right where you want to live.',
          },
          {
            title: 'Saved alerts',
            description:
              "Save a search and we'll ping you the moment a matching home hits the market.",
          },
          {
            title: 'Virtual tours',
            description:
              'Walk through homes in 3D before you book a visit — narrow your shortlist from the couch.',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={heading}
            subheading={description}
            features={features}
            columns={4}
          />
        </Container>
      </section>
    )
  },
})
