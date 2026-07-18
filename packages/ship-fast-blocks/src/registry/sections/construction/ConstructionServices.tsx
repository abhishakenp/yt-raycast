import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionServices — six-up services grid for a construction / general
 * contractor page. A centered section heading above a responsive 1/2/3-column
 * grid of hover-highlight cards; each card has a rounded icon tile (rotating
 * inline line-icons), a title, a description, and a "Learn more" link that
 * routes through useNavigate. Use to present a construction company's
 * offerings — commercial, residential, renovation, project management,
 * design-build, pre-construction. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const ConstructionServices = defineCapsule({
  name: 'ConstructionServices',
  description:
    "Six-up services grid for a construction / general contractor page: a centered section heading above a responsive 1/2/3-column grid of hover-highlight cards, each with a rounded icon tile (rotating inline line-icons), a title, a description, and a 'Learn more' link that routes through useNavigate. Use to present a construction firm's offerings (commercial, residential, renovation, project management, design-build, pre-construction).",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Card link label. */
    cta: z.string().optional(),
    /** Service cards: title + description. */
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
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading = props.heading ?? 'Full-service construction solutions'
    const description =
      props.description ??
      'From initial concept to final inspection, we handle every phase of your construction project with precision and care.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Commercial Construction',
            description:
              'Office buildings, retail centers, warehouses, and industrial facilities. Projects from 5,000 to 500,000 square feet.',
          },
          {
            title: 'Residential Building',
            description:
              'Custom homes, multi-family housing, and residential developments. Crafted with attention to every detail.',
          },
          {
            title: 'Renovation & Remodeling',
            description:
              'Transform existing spaces with modern upgrades, structural modifications, and complete interior renovations.',
          },
          {
            title: 'Project Management',
            description:
              'End-to-end oversight including scheduling, budgeting, subcontractor coordination, and quality control.',
          },
          {
            title: 'Design-Build Services',
            description:
              'Integrated design and construction services for streamlined delivery, reduced costs, and faster timelines.',
          },
          {
            title: 'Pre-Construction',
            description:
              'Site analysis, feasibility studies, permitting, budgeting, and value engineering to set your project up for success.',
          },
        ]
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="text-sm tracking-wider text-muted-foreground"
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <FeatureGrid columns={3}>
            {items.map((f) => {
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
