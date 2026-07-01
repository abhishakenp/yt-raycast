import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * RestaurantGallery — captioned image gallery for a restaurant page. Thin
 * configuration over the shared `GalleryGrid` composite: a centered serif
 * header (heading + supporting line) above a responsive 3-column grid of
 * dishes and ambiance, each tile a 4:3 photo with a hover zoom and a caption
 * overlay. All imagery is alt-driven. Use to showcase signature plates, the
 * dining room, and the bar for restaurants, bistros, or fine-dining venues.
 * Renders fully with no props via baked-in defaults (six dishes + captions).
 */
export const RestaurantGallery = defineCapsule({
  name: 'RestaurantGallery',
  description:
    'Captioned masonry gallery for a restaurant page: centered serif header above a responsive 1/2/3-column grid of dishes and ambiance, with a tall hero tile, hover zoom, and a token-based gradient caption strip per image. All imagery is alt-driven via the Image component. Use to showcase signature plates, the dining room, and the bar for restaurants, bistros, or fine-dining venues.',
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and an optional caption. */
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
            alt: 'Wood-fired whole branzino on a ceramic platter with charred lemon, capers, and fresh herbs',
            caption: 'Wood-fired branzino',
          },
          {
            alt: 'Warm restaurant dining room at dusk with linen-set tables, soft pendant lighting, and bentwood chairs',
            caption: 'The dining room',
          },
          {
            alt: 'Hand-rolled fresh pasta dusted with flour resting on a wooden board in a restaurant kitchen',
            caption: 'Hand-rolled pasta',
          },
          {
            alt: 'Bartender pouring a craft cocktail into a coupe glass over a dark marble bar with amber bottles behind',
            caption: 'At the bar',
          },
          {
            alt: 'Seared scallops plated with golden corn puree and microgreens, drizzled with brown butter',
            caption: 'Seared scallops',
          },
          {
            alt: 'Decadent chocolate dessert with raspberry coulis and gold leaf on a slate plate under warm light',
            caption: 'Dessert, finally',
          },
        ]
    return (
      <GalleryGrid
        heading={props.heading ?? 'A taste of the evening'}
        subheading={
          props.description ??
          'Seasonal plates, a sunlit dining room, and the little details that make a night out feel like an occasion.'
        }
        images={images}
        className={props.className}
      />
    )
  },
})
