import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * WineryBreweryGallery — captioned image gallery for a winery or brewery page.
 * Thin configuration over the shared `GalleryGrid` composite: a centered serif
 * header (heading + supporting line) above a responsive grid of vineyard rows,
 * the barrel room, the taproom, a tasting flight, the cellar, and harvest, each
 * a photo with a hover zoom and a caption overlay. All imagery is alt-driven.
 * Use to showcase the estate, the cellar, and the tasting experience for
 * wineries, vineyards, breweries, taprooms, or cideries. Renders fully with no
 * props via baked-in defaults (six photos + captions).
 */
export const WineryBreweryGallery = defineComponent({
  name: 'WineryBreweryGallery',
  description:
    'Captioned gallery for a winery or brewery page: centered serif header above a responsive 1/2/3-column grid of vineyard rows, the barrel room, the taproom, a tasting flight, the cellar, and harvest, with hover zoom and a token-based caption strip per image. All imagery is alt-driven via the Image component. Use to showcase the estate, cellar, and tasting experience for wineries, vineyards, breweries, taprooms, or cideries.',
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
            alt: 'rows of trellised grapevines stretching over a golden hillside at sunset with distant mountains',
            caption: 'The estate vineyard',
          },
          {
            alt: 'dim stone cellar lined with stacked oak wine barrels lit by warm overhead lanterns',
            caption: 'The barrel room',
          },
          {
            alt: 'rustic wooden taproom bar with brass taps, hanging glassware, and warm pendant lighting',
            caption: 'The taproom',
          },
          {
            alt: 'flight of five wines in tasting glasses arranged on a weathered wooden board with grapes',
            caption: 'A tasting flight',
          },
          {
            alt: 'underground wine cellar with arched brick ceilings and dusty bottles aging in racks',
            caption: 'Down in the cellar',
          },
          {
            alt: 'workers hand-picking ripe grape clusters into wooden crates during the autumn harvest',
            caption: 'Harvest morning',
          },
        ]
    return (
      <GalleryGrid
        heading={props.heading ?? 'From vine to glass'}
        subheading={
          props.description ??
          'Sun-soaked rows, a candlelit barrel room, and the quiet ritual of the cellar — a look at the place behind every pour.'
        }
        images={images}
        className={props.className}
      />
    )
  },
})
