import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * ArchitectureFirmWork — selected-work / project gallery for an
 * architecture-studio / design-practice page. A heading row (eyebrow + light
 * title on the left, a short descriptive paragraph on the right) above a
 * responsive 1/2/3-column grid of tall 4:5 portrait project cards; each card
 * has an image-zoom-on-hover photo, a project title with typology/year meta and
 * a right-aligned location caption. Calm, editorial, monochrome. Each card
 * routes through useNavigate. Use as a portfolio / selected-projects / case-study
 * gallery for architecture firms, design studios, interior designers, landscape
 * architects or any project-forward built-environment site. Renders fully with
 * no props via six baked-in project defaults.
 */
export const ArchitectureFirmWork = defineCapsule({
  name: 'ArchitectureFirmWork',
  description:
    'Selected-work / project gallery for an architecture-studio / design-practice page: a heading row (eyebrow + light title on the left, a short descriptive paragraph on the right) above a responsive 1/2/3-column grid of tall 4:5 portrait project cards, each with an image-zoom-on-hover photo, a project title with typology/year meta and a right-aligned location caption. Calm, editorial, monochrome. Cards route through useNavigate. Use as a portfolio / selected-projects / case-study gallery for architecture firms, design studios, interior designers, landscape architects or any project-forward built-environment site.',
  props: z.object({
    /** Wide letter-spaced eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Short descriptive paragraph beside the heading. */
    description: z.string().optional(),
    /** Project cards: title, typology/year meta, location, image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          meta: z.string(),
          location: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Selected Work'
    const heading = props.heading ?? 'Projects'
    const description =
      props.description ??
      'A selection of completed and ongoing work spanning residential, commercial, and cultural typologies across Northern Europe.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Villa Kyst',
            meta: 'Residential — 2023',
            location: 'Århus, DK',
            imageAlt:
              'Minimalist coastal villa with floor-to-ceiling glass windows overlooking the ocean at golden hour',
          },
          {
            title: 'Nordic Contemporary',
            meta: 'Cultural — 2022',
            location: 'Oslo, NO',
            imageAlt:
              'Contemporary art museum interior with dramatic spiral staircase and skylight illumination',
          },
          {
            title: 'Tårnby Housing',
            meta: 'Multi-family — 2021',
            location: 'Copenhagen, DK',
            imageAlt:
              'Modern apartment complex with warm wood cladding and balconies integrated into the facade',
          },
          {
            title: 'Fjord Headquarters',
            meta: 'Commercial — 2023',
            location: 'Bergen, NO',
            imageAlt:
              'Minimalist office workspace with natural wood finishes and abundant daylight through large windows',
          },
          {
            title: 'Pakhus 47',
            meta: 'Adaptive Reuse — 2020',
            location: 'Aalborg, DK',
            imageAlt:
              'Restored historic warehouse converted to residential lofts with preserved brickwork and modern interventions',
          },
          {
            title: 'Hotel Sanders',
            meta: 'Hospitality — 2019',
            location: 'Copenhagen, DK',
            imageAlt:
              'Elegant boutique hotel lobby with terrazzo floors and sculptural wooden reception desk',
          },
        ]

    return (
      <section
        aria-labelledby="architecture-firm-work-heading"
        className={cn('py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2
                id="architecture-firm-work-heading"
                className="text-3xl font-light text-foreground sm:text-4xl"
              >
                {heading}
              </h2>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-0">
              {description}
            </p>
          </div>

          <PortfolioGrid cols="1-md-2-3">
            {items.map((proj) => (
              <PortfolioItem
                key={proj.title}
                onClick={() => go(proj.title)}
                className="block w-full"
              >
                <PortfolioMedia aspect="4-5" className="mb-5 bg-muted">
                  <Image
                    alt={proj.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </PortfolioMedia>
                <PortfolioCaption className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {proj.meta}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {proj.location}
                  </span>
                </PortfolioCaption>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
