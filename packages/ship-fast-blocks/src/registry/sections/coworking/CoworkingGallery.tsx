import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * CoworkingGallery — captioned space tour for a coworking or shared-workspace
 * page. Thin configuration over the shared `GalleryGrid` composite: a centered
 * heading block above a responsive grid of alt-driven photos of the space —
 * open desks, the lounge, a meeting room, the shared kitchen, a phone booth,
 * and the rooftop terrace — each tile a 4:3 image with a short caption overlay.
 * Use to let prospective members picture themselves in the space for coworking
 * spaces, shared offices, or flex-office providers. Renders fully with no props
 * via bright, modern baked-in defaults.
 */
export const CoworkingGallery = defineComponent({
  name: 'CoworkingGallery',
  description:
    'Captioned space-tour gallery for a coworking or shared-workspace page built on the shared GalleryGrid composite: a centered heading block above a responsive grid of alt-driven photos of the space (open desks, lounge, meeting room, shared kitchen, phone booth, rooftop terrace), each a 4:3 image with a short caption overlay. All imagery is alt-driven via the Image component. Use to let prospective members picture themselves in the space for coworking spaces, shared offices, or flex-office providers.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and a short caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Bright open-plan coworking floor with rows of wooden hot desks, ergonomic chairs, leafy plants, and floor-to-ceiling windows',
            caption: 'Open desks',
          },
          {
            alt: 'Sunlit coworking lounge with a green velvet sofa, mid-century armchairs, a coffee table, and warm pendant lighting',
            caption: 'Member lounge',
          },
          {
            alt: 'Glass-walled meeting room with a long wooden table, ergonomic chairs, a wall-mounted display, and a whiteboard',
            caption: 'Meeting room',
          },
          {
            alt: 'Modern shared office kitchen with a marble island, bar stools, an espresso machine, and tall windows',
            caption: 'Shared kitchen',
          },
          {
            alt: 'Soundproof single-person phone booth with a small desk, a stool, and a pendant light inside a coworking space',
            caption: 'Phone booth',
          },
          {
            alt: 'Rooftop terrace of a coworking building at golden hour with lounge seating, string lights, planters, and a city skyline',
            caption: 'Rooftop terrace',
          },
        ]
    return (
      <GalleryGrid
        heading={props.heading ?? 'Take a look around'}
        subheading={
          props.description ??
          'Light-filled floors, comfortable lounges, and the little spaces that make a workday feel good.'
        }
        images={images}
        columns={props.columns ?? 3}
        className={props.className}
      />
    )
  },
})
