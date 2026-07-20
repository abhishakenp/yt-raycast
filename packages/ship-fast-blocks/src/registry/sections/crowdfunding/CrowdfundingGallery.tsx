import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * CrowdfundingGallery — a playful-bold product photo GALLERY for a
 * crowdfunding / campaign landing page. On a muted band: an asymmetric header
 * (mono eyebrow + extrabold left-aligned heading left, mono "[ field shots ]"
 * tag right) above a 3-column grid of sharp 2px-bordered 4:3 photo plates that
 * stagger downward in a checker rhythm on desktop, each wearing a rotated
 * sticker-style mono "FIG 0X" index chip in its top-left corner and gently
 * zooming on hover. Imagery uses the alt-driven Image component. Use to
 * showcase product shots, lifestyle photography, packaging, or in-use imagery
 * for a launching product, maker project, or any visual-led campaign.
 */
export const CrowdfundingGallery = defineCapsule({
  name: 'CrowdfundingGallery',
  description:
    "A playful-bold product photo GALLERY for a crowdfunding / campaign landing page on a muted band: an asymmetric header (mono eyebrow + extrabold left-aligned heading left, mono '[ field shots ]' tag right) above a 3-column grid of sharp 2px-bordered 4:3 photo plates that stagger downward in a checker rhythm on desktop, each wearing a rotated sticker-style mono 'FIG 0X' index chip in its top-left corner and gently zooming on hover. Imagery uses the alt-driven Image component. Use to showcase product shots, lifestyle photography, packaging, or in-use imagery for a launching product, maker project, or any visual-led campaign.",
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
      <section
        className={cn('bg-muted py-16 sm:py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={galleryEyebrow}
              title={galleryHeading}
              align="left"
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-4xl"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ field shots ]
            </MonoTag>
          </div>

          <GalleryGrid>
            <GalleryGridItems columns={3} className="gap-5 sm:gap-6">
              {galleryAlts
                .map((alt) => ({ alt }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'rounded-none border-2 border-foreground/60 transition-transform hover:-translate-y-1 motion-reduce:transform-none',
                        i % 2 === 1 && 'sm:translate-y-6',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute left-3 top-3 inline-flex rounded-full border-2 border-foreground bg-background px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[2px_2px_0_0] shadow-foreground/25',
                          i % 2 === 0 ? '-rotate-2' : 'rotate-2',
                        )}
                      >
                        Fig {String(i + 1).padStart(2, '0')}
                      </span>
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
