import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * InteriorDesignProjects — editorial-spatial project portfolio gallery for an
 * upscale interior-design / architecture studio. An asymmetric header pairs a
 * mono "03 / PORTFOLIO" rail + light-weight heading with a row of underline-style
 * filter tabs (first active), above a responsive 2/3-column grid of staggered
 * room plates — each a hairline-framed zoom-on-hover photo with a mono index
 * numeral, an uppercase tag, a medium title and a location/year meta line —
 * closed by a hairline "view all" row whose square outlined button inverts to ink
 * with press feedback. Editorial, gallery-like, binary radius; filters, plates
 * and the button route through section-kit route links, and photos use the alt-
 * driven Image component. Use to showcase a body of work for interior designers,
 * design studios or architecture firms. Renders fully with no props via baked-in
 * defaults.
 */
export const InteriorDesignProjects = defineCapsule({
  name: 'InteriorDesignProjects',
  description:
    "Editorial-spatial project portfolio gallery for an upscale interior-design / architecture studio: an asymmetric header pairing a mono '03 / PORTFOLIO' rail + light-weight heading with underline-style filter tabs (first active), above a responsive 2/3-column grid of staggered room plates — each a hairline-framed zoom-on-hover photo with a mono index numeral, an uppercase tag, a medium title and a location/year meta line — closed by a hairline 'view all' row whose square outlined button inverts to ink with press feedback. Editorial, gallery-like, binary radius; filters, plates and button route through section-kit route links and photos use the alt-driven Image component. Use to showcase a body of work for interior designers, design studios or architecture firms.",
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
          'px-4 pt-24 pb-16 sm:px-6 md:pt-28 md:pb-24 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div>
              <MonoTag className="mb-4 flex items-center gap-3 tracking-[0.2em]">
                <span aria-hidden="true" className="size-2 bg-primary" />
                03 / {eyebrow}
              </MonoTag>
              <h2 className="text-3xl font-light tracking-tight text-foreground md:text-5xl">
                {heading}
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {filters.map((filter, i) => (
                <NavbarRouteLink
                  key={filter}
                  className={cn(
                    'rounded-none px-1 pb-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors',
                    i === 0
                      ? 'border-b-2 border-foreground text-foreground'
                      : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground',
                  )}
                  href={filter}
                >
                  {filter}
                </NavbarRouteLink>
              ))}
            </div>
          </div>

          <PortfolioGrid cols="1-md-2-3" className="gap-x-6 gap-y-12">
            {items.map((project, i) => (
              <PortfolioItem
                key={project.title}
                className={cn(
                  'block w-full cursor-pointer',
                  i % 3 === 1 && 'lg:mt-14',
                  i % 3 === 2 && 'lg:mt-7',
                )}
                asChild
              >
                <NavbarRouteLink href={project.title}>
                  <PortfolioMedia
                    aspect={i % 3 === 0 ? '4-5' : '4-3'}
                    className="mb-5 border border-border"
                  >
                    <Image
                      alt={`${project.title} — ${project.tag} interior design project`}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bg-background/90 px-2.5 py-1 font-mono text-[11px] tabular-nums tracking-[0.16em] text-foreground backdrop-blur-sm"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </PortfolioMedia>
                  <PortfolioCaption>
                    <PortfolioTag className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {project.tag}
                    </PortfolioTag>
                    <h3 className="mb-1 text-xl font-medium tracking-tight text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.meta}
                    </p>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>

          <div className="mt-16 flex items-center justify-between gap-6 border-t border-border pt-8">
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="hidden tabular-nums sm:block"
            >
              {String(items.length).padStart(2, '0')} projects
            </MonoTag>
            <NavbarRouteLink
              className="inline-flex items-center rounded-none border border-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
              href={viewAll}
            >
              {viewAll}
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
