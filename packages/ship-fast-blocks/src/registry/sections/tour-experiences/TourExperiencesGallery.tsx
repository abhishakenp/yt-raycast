import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * TourExperiencesGallery — destination gallery for an adventure / guided-tour
 * brand. Composes the shared GalleryGrid composite as a 3-up grid of six vivid
 * destination tiles (each an alt-driven stock photo with a caption overlay)
 * spanning coastline, mountain trail, old town, market, waterfall, and a sunset
 * viewpoint. Use to sell the wanderlust of a trip on tour-operator, expedition,
 * and travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesGallery = defineCapsule({
  name: 'TourExperiencesGallery',
  description:
    'Destination gallery for an adventure / guided-tour brand. Composes the shared GalleryGrid composite as a 3-up grid of six vivid destination tiles (each an alt-driven stock photo with a caption overlay) spanning coastline, mountain trail, old town, market, waterfall, and a sunset viewpoint. Use to sell the wanderlust of a trip on tour-operator, expedition, and travel-experience landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Destination tiles (alt drives the photo, caption is the overlay). */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Dramatic turquoise coastline with cliffs plunging into the sea at golden hour',
            caption: 'Wild Coast Trail',
          },
          {
            alt: 'Hiker on a high alpine mountain trail with snow-capped peaks in the distance',
            caption: 'Summit Ridge Trek',
          },
          {
            alt: 'Sunlit cobblestone street in a historic European old town with pastel buildings',
            caption: 'Old Town Walk',
          },
          {
            alt: 'Bustling open-air street market stalls overflowing with spices, fruit, and textiles',
            caption: 'Market Food Tour',
          },
          {
            alt: 'Powerful jungle waterfall cascading into an emerald pool surrounded by greenery',
            caption: 'Hidden Falls',
          },
          {
            alt: 'Travelers watching a vivid orange sunset from a clifftop viewpoint over the ocean',
            caption: 'Sunset Viewpoint',
          },
        ]

    return (
      <section className="bg-muted/30 px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <GalleryGrid
            heading={props.heading ?? 'Where the trail takes you'}
            subheading={
              props.subheading ??
              'A glimpse of the places, plates, and panoramas waiting on our most-loved tours. Every photo is somewhere our guides will take you.'
            }
            images={images}
            columns={3}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
