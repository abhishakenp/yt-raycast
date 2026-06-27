import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * PhotographyGallery — portfolio image grid for a fine-art / wedding
 * photographer site. Thin configuration over the shared `GalleryGrid`
 * composite: a centered serif header (heading + supporting line) above a
 * responsive 3-column grid of 4:3 photographs, each with a hover zoom and an
 * optional caption overlay. All imagery is alt-driven via the Image component.
 * Use to showcase recent weddings, portraits, and editorial work for
 * photographers, studios, and elopement shooters. Renders fully with no props
 * via baked-in defaults (six portfolio frames + captions).
 */
export const PhotographyGallery = defineCapsule({
  name: 'PhotographyGallery',
  description:
    'Portfolio image grid for a fine-art / wedding photographer site built on the shared GalleryGrid composite: a centered serif header above a responsive 1/2/3-column grid of 4:3 photographs, each with a hover zoom and a token-based caption overlay. All imagery is alt-driven via the Image component. Use to showcase recent weddings, portraits, and editorial work for photographers, studios, and elopement shooters.',
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and a short caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Bride and groom embracing in golden-hour light in a wild meadow, soft documentary wedding portrait',
            caption: 'Golden hour, Tuscany',
          },
          {
            alt: 'Intimate elopement couple holding hands on a misty mountain ridge at dawn',
            caption: 'Dolomites elopement',
          },
          {
            alt: 'Candid black-and-white portrait of a bride laughing while getting ready, natural window light',
            caption: 'Getting ready',
          },
          {
            alt: 'Wedding reception under string lights at dusk with guests dancing in a rustic barn',
            caption: 'First dance',
          },
          {
            alt: 'Editorial portrait of a couple walking along a windswept coastal cliff at sunset',
            caption: 'Coastal session',
          },
          {
            alt: 'Close-up detail of a delicate wildflower bridal bouquet held in soft natural light',
            caption: 'The little details',
          },
        ]
    return (
      <GalleryGrid
        heading={props.heading ?? 'Recent work'}
        subheading={
          props.description ??
          'A selection of weddings, elopements, and portrait sessions captured around the world — emotion over perfection, always.'
        }
        images={images}
        className={props.className}
      />
    )
  },
})
