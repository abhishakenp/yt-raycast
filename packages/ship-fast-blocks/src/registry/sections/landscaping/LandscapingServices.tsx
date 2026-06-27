import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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

    const serviceIcons: ReactNode[] = [
      <svg
        key="design"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>,
      <svg
        key="install"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      <svg
        key="maintenance"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="hardscape"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg
        key="irrigation"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="sustainable"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
    ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
