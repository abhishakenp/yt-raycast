import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * LandscapingServices — organic-editorial services ledger for a landscaping /
 * outdoor-design company. An asymmetric header (mono "Services / NN offerings"
 * meta rule, a left tight-tracked heading and lede) sits above a 3-up grid of
 * numbered editorial rows: each offering opens with a mono botanical index
 * ("01 / Landscape Design"), a hairline top rule, a bold title and a descriptive
 * paragraph — open borders and index numerals instead of uniform icon-tile
 * cards. Icons, when provided, ride a small square line-glyph tile. Calm,
 * natural and premium on a muted card surface with a restrained sage accent.
 * Use to showcase capabilities for landscapers, lawn-care services, garden
 * designers, hardscaping contractors or irrigation specialists. Renders fully
 * with no props via baked-in six-service defaults.
 */
export const LandscapingServices = defineCapsule({
  name: 'LandscapingServices',
  description:
    'Organic-editorial services ledger for a landscaping / outdoor-design company: an asymmetric header (mono services meta rule, left tight-tracked heading and lede) above a 3-up grid of numbered editorial rows, each offering opening with a mono botanical index ("01 / Landscape Design"), a hairline top rule, a bold title and a descriptive paragraph — open borders and index numerals instead of uniform icon-tile cards. Icons rotate through a built-in set of garden/maintenance line glyphs (design, installation, seasonal maintenance, hardscaping, irrigation, sustainable gardens). Calm, natural and premium on a muted card surface with a restrained sage accent. Use to showcase capabilities for landscapers, lawn-care services, garden designers, hardscaping contractors or irrigation specialists.',
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
          {/* Asymmetric header: heading + lede left, mono offering count right. */}
          <div className="mb-14 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Services
              </span>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              {String(items.length).padStart(2, '0')} offerings
            </span>
          </div>

          <ServicesGrid columns={3} className="gap-0">
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
                <ServiceCard
                  key={__iv__.title}
                  className="gap-4 rounded-none border-0 border-t-2 border-foreground/15 bg-transparent p-0 pt-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm tabular-nums text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-border"
                    />
                    {__iv__.icon && (
                      <ServiceIcon className="size-8 rounded-none bg-transparent text-primary">
                        {__iv__.icon}
                      </ServiceIcon>
                    )}
                  </div>
                  <ServiceTitle className="text-xl font-semibold tracking-tight">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="leading-relaxed">
                    {__iv__.description}
                  </ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
