import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * SpaWellnessGallery — serene image grid showcasing a spa's spaces and rituals.
 * Thin configuration over the shared `GalleryGrid` composite: a centered heading
 * above a responsive grid of rounded image tiles, each rendered through the
 * alt-driven Image component with a soft caption strip. Use to give visitors a
 * calming visual tour of treatment rooms, relaxation lounges, pools, and natural
 * details. Renders fully with no props via baked-in defaults.
 */
export const SpaWellnessGallery = defineComponent({
  name: 'SpaWellnessGallery',
  description:
    "Serene image grid showcasing a spa's spaces and rituals built on the shared GalleryGrid composite: a centered heading above a responsive grid of rounded image tiles rendered through the alt-driven Image component, each with a soft caption. Use to give visitors a calming visual tour of treatment rooms, relaxation lounges, pools, and natural details.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Gallery tiles; each alt drives its Image and caption labels it. */
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Inside our sanctuary'
    const subheading =
      props.subheading ??
      'Spaces designed to slow your breath the moment you walk through the door.'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'softly lit spa treatment room with a draped massage table and warm wood tones',
            caption: 'Treatment suites',
          },
          {
            alt: 'tranquil relaxation lounge with linen chairs, plants, and a tea station',
            caption: 'Relaxation lounge',
          },
          {
            alt: 'calm indoor mineral pool surrounded by smooth stone and soft daylight',
            caption: 'Mineral pool',
          },
          {
            alt: 'cedar sauna interior glowing with warm amber light',
            caption: 'Cedar sauna',
          },
          {
            alt: 'shelf of natural botanical oils and folded towels in a serene spa palette',
            caption: 'Botanical apothecary',
          },
          {
            alt: 'outdoor garden courtyard with a quiet fountain and lush greenery',
            caption: 'Garden courtyard',
          },
        ]

    return (
      <GalleryGrid
        heading={heading}
        subheading={subheading}
        images={images}
        className={props.className}
      />
    )
  },
})
