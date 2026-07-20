import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporateGallery — Swiss-corporate global presence plates for an enterprise /
 * corporate B2B site. A double-rule asymmetric header (mono "04 / Locations"
 * index, left-aligned heading, lede in the offset right column) above an
 * asymmetric bento grid of hairline-framed, square-edged office plates — the
 * first plate spans two columns (the section's calculated rupture) — each
 * with a museum-label caption bar beneath the photo carrying a mono tabular
 * index numeral, the office title, and its caption line. Use to showcase
 * global presence, workspace culture, or location hubs for large
 * organizations.
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
    'Swiss-corporate global presence plates for an enterprise / corporate B2B site: a double-rule asymmetric header (mono index, left-aligned heading, offset lede) above an asymmetric bento grid of hairline-framed square-edged office plates — the first spanning two columns — each with a museum-label caption bar beneath the photo carrying a mono tabular index numeral, the office title, and its caption line. Use to showcase global presence, workspace culture, or location hubs for large organizations.',
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
      <section className={cn('bg-background py-16 lg:py-28', props.className)}>
        <Container>
          <div className="mb-10 grid gap-6 border-b border-border pb-8 sm:mb-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <span
                aria-hidden="true"
                className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                04 / Locations
              </span>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:self-end">
              {description}
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="gap-x-4 gap-y-8 sm:gap-x-6"
            >
              {items
                .map((item) => ({
                  alt: item.imageAlt,
                  caption: item.title,
                  subCaption: item.caption,
                }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    subCaption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'aspect-auto overflow-visible rounded-none border-0',
                        i === 0 && 'sm:col-span-2',
                      )}
                    >
                      <GalleryTileImage
                        alt={__iv__.alt}
                        className={cn(
                          'aspect-[4/3] rounded-none border border-border group-hover:scale-100',
                          i === 0 && 'sm:aspect-[8/3.05]',
                        )}
                      />
                      <GalleryTileCaption className="static inset-x-auto grid grid-cols-[auto_1fr] gap-x-3 border-b border-border bg-transparent px-0 py-3 backdrop-blur-none">
                        <span
                          aria-hidden="true"
                          className="row-span-2 self-start font-mono text-[11px] uppercase leading-5 tracking-[0.2em] tabular-nums text-primary"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {__iv__.caption && (
                          <span className="block text-sm font-semibold tracking-tight text-foreground">
                            {__iv__.caption}
                          </span>
                        )}
                        {__iv__.subCaption && (
                          <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            {__iv__.subCaption}
                          </span>
                        )}
                      </GalleryTileCaption>
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
