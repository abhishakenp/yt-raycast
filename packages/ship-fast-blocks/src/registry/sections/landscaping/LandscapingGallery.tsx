import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * LandscapingGallery — organic-editorial selected-projects portfolio for a
 * landscaping / outdoor-design company. An asymmetric header (mono "Portfolio"
 * meta, heading + lede left, project count right) sits above a staggered grid of
 * sharp photo plates (rounded-none, hairline framed) whose alternate columns
 * ride an offset so the grid never reads as a uniform block; each plate zooms its
 * photo on hover and carries a botanical museum-label caption — a mono location
 * eyebrow above the project title. A square outlined CTA with press feedback
 * closes the section. Plates and the CTA route through section-kit route links;
 * all imagery uses the alt-driven Image component. Use to showcase completed work
 * for landscapers, garden designers, hardscaping contractors or grounds-keeping
 * companies. Renders fully with no props via baked-in six-project defaults.
 */
export const LandscapingGallery = defineCapsule({
  name: 'LandscapingGallery',
  description:
    'Organic-editorial selected-projects portfolio for a landscaping / outdoor-design company: an asymmetric header (mono portfolio meta, heading + lede left, project count right) above a staggered grid of sharp hairline-framed photo plates (rounded-none) whose alternate columns ride an offset, each zooming its photo on hover and carrying a botanical museum-label caption — a mono location eyebrow above the project title — with a square outlined CTA with press feedback closing the section. Plates and the CTA route through section-kit route links and imagery uses the alt-driven Image component. Use to showcase completed work for landscapers, garden designers, hardscaping contractors or grounds-keeping companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    items: z
      .array(
        z.object({
          location: z.string(),
          title: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Selected projects'
    const description =
      props.description ??
      "A portfolio of residential and commercial transformations across Portland's most distinctive neighborhoods."
    const cta = props.cta ?? 'Start Your Project'
    const items = props.items?.length
      ? props.items
      : [
          {
            location: 'Laurelhurst Residence',
            title: 'Mediterranean Courtyard',
            imageAlt:
              'Backyard patio with natural stone pavers, outdoor dining furniture, and perennial garden beds',
          },
          {
            location: 'Pearl District Condo',
            title: 'Urban Rooftop Garden',
            imageAlt:
              'Modern front yard with ornamental grasses, Japanese maple, and gravel pathways',
          },
          {
            location: 'Lake Oswego Estate',
            title: 'Formal English Garden',
            imageAlt:
              'Lush green lawn with curved garden beds filled with hydrangeas and hostas',
          },
          {
            location: 'Alberta Arts District',
            title: 'Mixed-Use Plaza',
            imageAlt:
              'Commercial plaza with raised planters, bench seating, and native Pacific Northwest plants',
          },
          {
            location: 'Sellwood Family Home',
            title: 'Entertainment Oasis',
            imageAlt:
              'Backyard fire pit area with Adirondack chairs, crushed stone base, and privacy hedges',
          },
          {
            location: 'Forest Park Property',
            title: 'Native Meadow Restoration',
            imageAlt:
              'Native wildflower meadow with walking path, tall grasses, and pollinator-friendly blooms',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          {/* Asymmetric header: heading + lede left, mono project count right. */}
          <div className="mb-14 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Portfolio
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
              {String(items.length).padStart(2, '0')} projects
            </span>
          </div>

          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="gap-6 [&>*:nth-child(3n+2)]:sm:translate-y-8"
            >
              {items.map((item, i) => {
                const __iv__ = item as {
                  location: string
                  title: string
                  imageAlt: string
                }
                return (
                  <GalleryTile
                    key={__iv__.imageAlt}
                    className="rounded-none border-foreground/15"
                  >
                    <GalleryTileImage alt={__iv__.imageAlt} />
                    <GalleryTileCaption className="rounded-none bg-background/85 px-4 py-3">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        {String(i + 1).padStart(2, '0')} / {__iv__.location}
                      </span>
                      <span className="mt-1 block text-base font-semibold tracking-tight text-foreground">
                        {__iv__.title}
                      </span>
                    </GalleryTileCaption>
                  </GalleryTile>
                )
              })}
            </GalleryGridItems>
          </GalleryGrid>
          <div className="mt-16 text-center">
            <NavbarRouteLink
              className="inline-flex items-center rounded-none border border-foreground bg-background px-8 py-4 text-base font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
              href={cta}
            >
              {cta}
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
