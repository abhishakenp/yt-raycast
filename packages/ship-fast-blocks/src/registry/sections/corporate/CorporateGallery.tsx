import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporateGallery — global office / presence gallery for an enterprise /
 * corporate B2B site. A centered section heading above a responsive 2/3-column
 * grid of image cards with gradient-caption overlays; each card has a hover
 * scale effect and is clickable via useNavigate. Use to showcase global
 * presence, workspace culture, or location hubs for large organizations.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const CorporateGallery = defineCapsule({
  name: 'CorporateGallery',
  description:
    'Global office / presence gallery for an enterprise / corporate B2B site: centered heading above a responsive 2/3-column grid of image cards with gradient-caption overlays, hover scale effect, and clickable buttons via useNavigate. Use to showcase global presence, workspace culture, or location hubs for large organizations.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Office cards: title, caption, and image alt text. */
    items: z
      .array(
        z.object({
          title: z.string(),
          caption: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Global presence, local expertise'
    const description =
      props.description ??
      '14 offices across 6 continents, serving clients in 47 countries with round-the-clock support.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'New York Headquarters',
            caption: 'Global HQ & Innovation Center',
            imageAlt:
              'Modern glass skyscraper corporate headquarters at sunset',
          },
          {
            title: 'London Office',
            caption: 'EMEA Regional Hub',
            imageAlt:
              'Tower Bridge and modern city skyline in London at golden hour',
          },
          {
            title: 'Tokyo Office',
            caption: 'APAC Operations Center',
            imageAlt: 'Tokyo cityscape with illuminated skyscrapers at night',
          },
          {
            title: 'Sydney Office',
            caption: 'ANZ Regional Office',
            imageAlt: 'Sydney Opera House and harbor waterfront panorama',
          },
          {
            title: 'Singapore Office',
            caption: 'Southeast Asia Hub',
            imageAlt: 'Singapore Marina Bay skyline with modern architecture',
          },
          {
            title: 'Berlin Office',
            caption: 'European Development Center',
            imageAlt:
              'Modern corporate building in Berlin with contemporary architecture',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
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
        </Container>
      </section>
    )
  },
})
