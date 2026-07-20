import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ArchitectureFirmWork — blueprint drawing-index project gallery for an
 * architecture-studio / design-practice page. An asymmetric header row — mono
 * annotation rail ("01 /" + eyebrow + hairline rule) and huge ultra-thin
 * heading on the left, the descriptive paragraph hanging off a hairline left
 * rule on the right — above a staggered 2/3-column grid of portrait project
 * plates in which every second column drops down, keeping an offset rhythm
 * even on small screens. Each plate is a sharp hairline-framed 4:5 grayscale
 * photograph that regains color and zooms subtly on hover, headed by a mono
 * "PROJ. 01" index row with the location, and captioned with a light title
 * over mono uppercase typology/year metadata. Precise, monochrome,
 * drafting-table calm. Each card routes through section-kit route links. Use
 * as a portfolio / selected-projects / case-study gallery for architecture
 * firms, design studios, interior designers, landscape architects or any
 * project-forward built-environment site. Renders fully with no props via six
 * baked-in project defaults.
 */
export const ArchitectureFirmWork = defineCapsule({
  name: 'ArchitectureFirmWork',
  description:
    'Blueprint drawing-index project gallery for an architecture-studio / design-practice page: an asymmetric header row (mono annotation rail + huge ultra-thin heading left, descriptive paragraph on a hairline rule right) above a staggered 2/3-column grid of portrait project plates where every second column drops down, keeping an offset rhythm even on small screens — each plate a sharp hairline-framed 4:5 grayscale photograph that regains color and zooms subtly on hover, headed by a mono "PROJ. 01" index row with the location and captioned with a light title over mono uppercase typology/year metadata. Precise, monochrome, drafting-table calm. Cards route through section-kit route links. Use as a portfolio / selected-projects / case-study gallery for architecture firms, design studios, interior designers, landscape architects or any project-forward built-environment site.',
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
        className={cn(
          'relative overflow-hidden py-16 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div>
              <div className="mb-6 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">01 /</MonoTag>
                <MonoTag className="shrink-0">{eyebrow}</MonoTag>
                <span aria-hidden="true" className="h-px w-16 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                titleId="architecture-firm-work-heading"
                className="gap-0"
                titleClassName="text-4xl font-extralight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              />
            </div>
            <p className="max-w-md border-l border-border pl-5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <PortfolioGrid
            cols="1-md-2-3"
            className="grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16"
          >
            {items.map((proj, i) => (
              <PortfolioItem
                key={proj.title}
                className={cn(
                  'block w-full',
                  // Staggered plate rhythm: every second column drops.
                  i % 2 === 1 && 'translate-y-6 lg:translate-y-0',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  {/* Mono drawing-index row above the plate. */}
                  <span className="mb-3 flex items-baseline justify-between gap-2">
                    <MonoTag className="text-foreground">
                      Proj. {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <MonoTag className="hidden text-muted-foreground/60 sm:inline">
                      {proj.location}
                    </MonoTag>
                  </span>
                  <PortfolioMedia
                    aspect="4-5"
                    className="mb-4 border border-foreground/25 bg-muted"
                  >
                    <Image
                      alt={proj.imageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                  </PortfolioMedia>
                  <PortfolioCaption>
                    <h3 className="text-base font-light tracking-tight text-foreground sm:text-lg">
                      {proj.title}
                    </h3>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {proj.meta}
                    </p>
                    <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 sm:hidden">
                      {proj.location}
                    </span>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
