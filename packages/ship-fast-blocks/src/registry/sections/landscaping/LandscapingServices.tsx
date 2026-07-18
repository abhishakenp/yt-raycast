import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * LandscapingServices — a centered-header, 6-up services grid for a landscaping /
 * outdoor-design company. A heading + description introduce a responsive grid of
 * soft rounded cards (1/2/3 columns), each with a tinted square line-icon tile,
 * a title and a descriptive paragraph; cards lift to a soft accent tint on hover.
 * Icons rotate through a built-in set of garden/maintenance line glyphs. Calm,
 * organic and premium on the card surface with a sage-green accent. Use to
 * showcase capabilities for landscapers, lawn-care services, garden designers,
 * hardscaping contractors or irrigation specialists. Renders fully with no props
 * via baked-in six-service defaults.
 */
export const LandscapingServices = defineCapsule({
  name: 'LandscapingServices',
  description:
    'Centered-header, 6-up services grid for a landscaping / outdoor-design company: a heading + description introduce a responsive grid of soft rounded cards (1/2/3 columns), each with a tinted square line-icon tile, a title and a descriptive paragraph, lifting to a soft accent tint on hover. Icons rotate through a built-in set of garden/maintenance line glyphs (design, installation, seasonal maintenance, hardscaping, irrigation, sustainable gardens). Calm, organic and premium on the card surface with a sage-green accent. Use to showcase capabilities for landscapers, lawn-care services, garden designers, hardscaping contractors or irrigation specialists.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Comprehensive landscaping services'
    const description =
      props.description ??
      'From initial design to ongoing maintenance, we handle every aspect of your outdoor environment with precision and care.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Landscape Design',
            description:
              "Custom 3D-rendered designs tailored to your property's unique terrain, sunlight patterns, and your lifestyle needs. Includes plant selection and hardscape planning.",
          },
          {
            title: 'Installation',
            description:
              'Complete project execution from soil preparation and irrigation to planting and hardscape construction. All work backed by our 2-year plant guarantee.',
          },
          {
            title: 'Seasonal Maintenance',
            description:
              "Weekly or bi-weekly care including mowing, edging, pruning, fertilization, and seasonal cleanup. Flexible scheduling to match your property's needs.",
          },
          {
            title: 'Hardscaping',
            description:
              "Patios, walkways, retaining walls, fire pits, and outdoor kitchens built with premium materials. Engineered for Portland's freeze-thaw cycles.",
          },
          {
            title: 'Irrigation Systems',
            description:
              'Smart water-efficient irrigation design, installation, and repair. Weather-based controllers that reduce water usage by up to 40% while keeping plants healthy.',
          },
          {
            title: 'Sustainable Gardens',
            description:
              'Native plant gardens, rain gardens, and pollinator habitats designed for minimal water use and maximum ecological benefit. Oregon native specialists.',
          },
        ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
