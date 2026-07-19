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
  PortfolioTag,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * InteriorDesignProjects — filterable project portfolio gallery for an upscale
 * interior-design / architecture studio. A header row pairs an uppercase eyebrow
 * + light-weight heading with a row of underline-style filter tabs (first
 * active), above a responsive 2/3-column grid of tall project cards — each a
 * zoom-on-hover photo over an uppercase tag, a medium title and a location/year
 * meta line — followed by a centered outlined "view all" button. Editorial and
 * gallery-like; filters, cards and the button route through useNavigate, and
 * photos use the alt-driven Image component. Use to showcase a body of work for
 * interior designers, design studios or architecture firms. Renders fully with
 * no props via baked-in defaults.
 */
export const InteriorDesignProjects = defineCapsule({
  name: 'InteriorDesignProjects',
  description:
    "Filterable project portfolio gallery for an upscale interior-design / architecture studio: a header row pairing an uppercase eyebrow + light-weight heading with underline-style filter tabs (first active), above a responsive 2/3-column grid of tall project cards — each a zoom-on-hover photo over an uppercase tag, a medium title and a location/year meta line — and a centered outlined 'view all' button. Editorial and gallery-like; filters, cards and button route through useNavigate and photos use the alt-driven Image component. Use to showcase a body of work for interior designers, design studios or architecture firms.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    filters: z.array(z.string()).optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          meta: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Portfolio'
    const heading = props.heading ?? 'Selected projects'
    const filters = props.filters?.length
      ? props.filters
      : ['All', 'Residential', 'Commercial']
    const viewAll = props.viewAll ?? 'View All Projects'
    const items = props.items?.length
      ? props.items
      : [
          {
            tag: 'Residential',
            title: 'Tiburon Bay House',
            meta: 'Tiburon, California — 2024',
          },
          {
            tag: 'Residential',
            title: 'Napa Valley Retreat',
            meta: 'St. Helena, California — 2023',
          },
          {
            tag: 'Commercial',
            title: 'Meridian Offices',
            meta: 'San Francisco, California — 2023',
          },
          {
            tag: 'Residential',
            title: 'Presidio Heights Kitchen',
            meta: 'San Francisco, California — 2024',
          },
          {
            tag: 'Hospitality',
            title: 'The Calistoga Inn',
            meta: 'Calistoga, California — 2022',
          },
          {
            tag: 'Residential',
            title: 'Sausalito Master Bath',
            meta: 'Sausalito, California — 2023',
          },
        ]

    return (
      <section
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 md:pt-32 md:pb-28 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
              titleClassName="text-3xl font-light text-foreground md:text-4xl"
            />
            <div className="flex gap-4">
              {filters.map((filter, i) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => go(filter)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors',
                    i === 0
                      ? 'border-b-2 border-foreground text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <PortfolioGrid cols="1-md-2-3" className="md:gap-8">
            {items.map((project) => (
              <PortfolioItem
                key={project.title}
                onClick={() => go(project.title)}
                className="block w-full cursor-pointer"
              >
                <PortfolioMedia aspect="4-5" className="mb-5">
                  <Image
                    alt={`${project.title} — ${project.tag} interior design project`}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-96"
                  />
                </PortfolioMedia>
                <PortfolioCaption>
                  <PortfolioTag className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {project.tag}
                  </PortfolioTag>
                  <h3 className="mb-1 text-xl font-medium text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.meta}
                  </p>
                </PortfolioCaption>
              </PortfolioItem>
            ))}
          </PortfolioGrid>

          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center border border-border px-8 py-4 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              {viewAll}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
