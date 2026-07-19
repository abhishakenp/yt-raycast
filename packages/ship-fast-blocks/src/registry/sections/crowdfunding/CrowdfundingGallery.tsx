import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

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
          <SectionHeading
            eyebrow={galleryEyebrow}
            title={galleryHeading}
            className="mb-16 gap-0"
            eyebrowClassName="text-sm font-medium uppercase tracking-wider text-primary"
            titleClassName="mt-3 text-3xl font-semibold sm:text-4xl"
          />

          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {galleryAlts
                .map((alt) => ({ alt }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
                          {__iv__.caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
