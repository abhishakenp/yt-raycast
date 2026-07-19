import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * LandscapingGallery — a centered-header selected-projects portfolio grid for a
 * landscaping / outdoor-design company. A heading + description introduce a
 * responsive 1/2/3-column grid of rounded image tiles; each tile zooms its photo
 * on hover and reveals a bottom gradient overlay with a location eyebrow and a
 * project title. A centered outlined pill CTA closes the section. Tiles and the
 * CTA route through useNavigate; all imagery uses the alt-driven Image component.
 * Calm, organic and premium on the card surface. Use to showcase completed work
 * for landscapers, garden designers, hardscaping contractors or grounds-keeping
 * companies. Renders fully with no props via baked-in six-project defaults.
 */
export const LandscapingGallery = defineCapsule({
  name: 'LandscapingGallery',
  description:
    'Centered-header selected-projects portfolio grid for a landscaping / outdoor-design company: a heading + description introduce a responsive 1/2/3-column grid of rounded image tiles; each tile zooms its photo on hover and reveals a bottom gradient overlay with a location eyebrow and a project title, with a centered outlined pill CTA closing the section. Tiles and the CTA route through useNavigate and imagery uses the alt-driven Image component. Calm, organic and premium on the card surface. Use to showcase completed work for landscapers, garden designers, hardscaping contractors or grounds-keeping companies.',
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
    const go = useNavigate()
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
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 sm:text-4xl"
            subtitleClassName="text-lg"
          />
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
                .map((item) => ({
                  alt: item.imageAlt,
                  caption: item.title,
                }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
                          {__iv__.caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(cta)}
              className="inline-flex items-center rounded-full border border-border bg-muted px-8 py-4 text-base font-medium text-primary transition-colors hover:bg-accent"
            >
              {cta}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
