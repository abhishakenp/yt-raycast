import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * CrowdfundingGallery — a product photo GALLERY for a crowdfunding / campaign
 * landing page. On a muted band: a centered uppercase eyebrow + heading above a
 * responsive 1/2/3-column grid of rounded 4:3 image tiles that gently zoom on
 * hover. Imagery uses the alt-driven Image component. Use to showcase product
 * shots, lifestyle photography, packaging, or in-use imagery for a launching
 * product, maker project, or any visual-led campaign.
 */
export const CrowdfundingGallery = defineCapsule({
  name: 'CrowdfundingGallery',
  description:
    'A product photo GALLERY for a crowdfunding / campaign landing page on a muted band: a centered uppercase eyebrow + heading above a responsive 1/2/3-column grid of rounded 4:3 image tiles that gently zoom on hover. Imagery uses the alt-driven Image component. Use to showcase product shots, lifestyle photography, packaging, or in-use imagery for a launching product, maker project, or any visual-led campaign.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const galleryEyebrow = props.eyebrow ?? 'Gallery'
    const galleryHeading = props.heading ?? 'See EcoBrush in Action'
    const galleryAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Woman holding bamboo toothbrush in minimalist bathroom with white tiles and natural light',
          'Close-up of bamboo toothbrush handle showing ergonomic grip design',
          'EcoBrush charging station on wooden shelf with succulent plant',
          'Bamboo toothbrush heads arranged in compostable packaging materials',
          'Family using EcoBrush products at bathroom sinks together in morning routine',
          'EcoBrush sustainable packaging unboxing experience on linen background',
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {galleryEyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {galleryHeading}
            </h2>
          </div>

          <GalleryGrid
            images={galleryAlts.map((alt) => ({ alt }))}
            columns={3}
          />
        </Container>
      </section>
    )
  },
})
