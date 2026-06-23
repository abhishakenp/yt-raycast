import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { GalleryGrid } from "#/section-kit/GalleryGrid.tsx"

/**
 * VacationRentalGallery — an airy property photo gallery for a vacation-rental
 * listing page. Thin configuration over the shared `GalleryGrid` composite: an
 * optional heading/subheading above a responsive grid of alt-driven property
 * tiles (living room, bedroom, pool, kitchen, deck view, bathroom), each with a
 * hover zoom and a caption strip. Theme-token only. Use to showcase the spaces
 * of a vacation rental, beach house, cabin, villa, or boutique short-stay.
 * Renders fully with no props via baked-in defaults.
 */
export const VacationRentalGallery = defineComponent({
  name: "VacationRentalGallery",
  description:
    "Airy property photo gallery for a vacation-rental listing page built on the shared GalleryGrid composite: an optional heading/subheading above a responsive grid of alt-driven property tiles (living room, bedroom, pool, kitchen, deck view, bathroom), each with a hover zoom and a caption strip. Theme-token only. Use to showcase the spaces of a vacation rental, beach house, cabin, villa, or boutique short-stay.",
  props: z.object({
    /** Section heading above the gallery. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Gallery tiles: each an alt (drives the photo) plus an optional caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    /** Column count for the responsive grid. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: "Sunlit open-plan living room with linen sofas and ocean-view windows",
            caption: "Living room",
          },
          {
            alt: "Serene master bedroom with a king bed, white linens, and morning light",
            caption: "Master bedroom",
          },
          {
            alt: "Infinity pool overlooking a turquoise bay at golden hour",
            caption: "Pool & terrace",
          },
          {
            alt: "Bright modern kitchen with marble island and bar stools",
            caption: "Chef's kitchen",
          },
          {
            alt: "Wooden deck with lounge chairs and a panoramic coastline view",
            caption: "Deck & view",
          },
          {
            alt: "Spa-style bathroom with a freestanding soaking tub and natural light",
            caption: "Ensuite bath",
          },
        ]

    return (
      <GalleryGrid
        heading={props.heading ?? "Take the tour"}
        subheading={
          props.subheading ??
          "Every corner designed for comfort, from sun-drenched living spaces to a pool that opens to the horizon."
        }
        images={images}
        columns={props.columns ?? 3}
        className={props.className}
      />
    )
  },
})
