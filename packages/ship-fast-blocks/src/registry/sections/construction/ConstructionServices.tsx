import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionServices — industrial-brutalist capability board for a
 * construction / general contractor page. A blueprint graph-paper section with
 * an asymmetric header (left-aligned mono eyebrow + extrabold uppercase
 * heading, mono capability index on the right), above a grid of hard-edged
 * service cards: 2px borders, zero radius, hard offset foreground shadows with
 * press feedback, a mono primary index numeral per card, an uppercase title, a
 * description, and a mono "Learn more" link that routes through section-kit
 * route links. Use to present a construction company's offerings — commercial,
 * residential, renovation, project management, design-build,
 * pre-construction. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
export const ConstructionServices = defineCapsule({
  name: 'ConstructionServices',
  description:
    "Industrial-brutalist capability board for a construction / general contractor page: a blueprint graph-paper section with an asymmetric header (left mono eyebrow + extrabold uppercase heading, mono capability index right) above a grid of hard-edged service cards — 2px borders, zero radius, hard offset shadows with press feedback, mono primary index numerals, uppercase titles, descriptions, and a mono 'Learn more' link that routes through section-kit route links. Use to present a construction firm's offerings (commercial, residential, renovation, project management, design-build, pre-construction).",
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
    const cta = props.cta ?? 'Learn more'
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
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <GraphPaper className="inset-0" />
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="mb-4 mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              [ {String(items.length).padStart(2, '0')} ] capabilities
            </p>
          </div>

          <FeatureGrid columns={3}>
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
                  className="group rounded-none border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground transition-all duration-100 hover:-translate-y-1 hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-y-0 active:shadow-[4px_4px_0_0] motion-reduce:transform-none sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-8 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)] text-foreground/25"
                    />
                  </div>
                  {__iv__.icon && (
                    <FeatureIcon className="rounded-none">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <FeatureTitle className="text-base font-extrabold uppercase tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                  <NavbarRouteLink
                    className="mt-auto inline-flex w-fit items-center gap-2 border-t-2 border-transparent pt-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-all hover:gap-3 hover:text-primary"
                    href={__iv__.title}
                  >
                    {__iv__.cta ?? cta}
                    <span aria-hidden="true">→</span>
                  </NavbarRouteLink>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
