import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

export const SalonBarberGallery = defineCapsule({
  name: 'SalonBarberGallery',
  description:
    "Portfolio gallery for a barbershop or salon, rendered through the shared GalleryGrid. Shows a responsive grid of recent cuts, styles, and interior shots with short captions so prospective clients can judge the work at a glance. Use it lower on a barbershop, salon, or men's grooming page to build trust with real-looking before/after style proof.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
            alt: 'barber finishing a crisp skin fade haircut on a young man in a modern barbershop',
            caption: 'Skin fade',
          },
          {
            alt: 'close up of a sharp beard line-up and hot towel shave with straight razor',
            caption: 'Beard line-up',
          },
          {
            alt: 'textured modern quiff hairstyle styled with matte product on a male client',
            caption: 'Textured quiff',
          },
          {
            alt: 'natural blonde highlights and color blend on layered salon haircut',
            caption: 'Color & highlights',
          },
          {
            alt: 'classic pompadour haircut with tight taper on the sides in a barbershop chair',
            caption: 'Classic pompadour',
          },
          {
            alt: 'interior of a stylish barbershop with leather chairs vintage mirrors and warm lighting',
            caption: 'Our shop',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <GalleryGrid
            heading={props.heading ?? 'The Work'}
            subheading={props.description ?? 'Recent cuts & styles'}
            images={images}
          />
        </Container>
      </section>
    )
  },
})
