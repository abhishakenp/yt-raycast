import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

export const ProductDetailGallery = defineCapsule({
  name: 'ProductDetailGallery',
  description:
    'Editorial product gallery band for the Aurora Pro Headphones detail page. Wraps the shared GalleryGrid composite to show the headphones from every angle — front profile, side, folded, on-desk, worn outdoors, ear-cushion close-up, and the charging case. Each stock image resolves from a descriptive alt with a short caption strip. Fully prop-driven: heading, subheading, columns, and the images array can be overridden, with premium Aurora defaults baked in. Place between features and reviews to let buyers inspect the product visually. Theme tokens only.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'See it from every angle'
    const subheading =
      props.subheading ??
      'A closer look at the materials, fit, and finish of the Aurora Pro.'
    const columns = props.columns ?? 3
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Aurora Pro headphones front view on white marble surface',
            caption: 'Front profile',
          },
          {
            alt: 'Aurora Pro headphones side profile showing earcup hinge',
            caption: 'Side detail',
          },
          {
            alt: 'Aurora Pro headphones folded flat for travel on a soft surface',
            caption: 'Folds flat',
          },
          {
            alt: 'Aurora Pro headphones resting on a minimalist wooden desk beside a laptop',
            caption: 'On the desk',
          },
          {
            alt: 'Person wearing Aurora Pro headphones walking outdoors in soft daylight',
            caption: 'On the go',
          },
          {
            alt: 'Macro close-up of Aurora Pro plush memory-foam ear cushion and stitching',
            caption: 'Cushion close-up',
          },
        ]

    return (
      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <GalleryGrid
            heading={heading}
            subheading={subheading}
            images={images}
            columns={columns}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
