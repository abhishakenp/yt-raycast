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
 * AiProductGallery — a product-screenshot showcase grid for a clean, light AI
 * SaaS / product page. A centered heading + paragraph above a responsive
 * 1 → 2 → 3 column grid of bordered cards, each a clickable tile with a 4:3
 * alt-driven image, a bold title, and a short caption, lifting on hover. Each
 * card routes through useNavigate. Use to surface real in-app screenshots or
 * feature highlights for AI tools, SaaS apps, editors, dashboards, or any
 * product worth showing visually. Renders fully with no props via six built-in
 * feature tiles.
 */
export const AiProductGallery = defineCapsule({
  name: 'AiProductGallery',
  description:
    'Product-screenshot showcase grid for a clean, light AI SaaS / product page: a centered heading and paragraph above a responsive 1 → 2 → 3 column grid of bordered cards, each a clickable tile with a 4:3 alt-driven image, a bold title, and a short caption, lifting with a shadow on hover. Each card routes through useNavigate. Use to surface real in-app screenshots or feature highlights for AI tools, SaaS apps, editors, dashboards, or any product worth showing visually.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery tiles (title drives the image alt + caption). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'See WriteFlow in action'
    const description =
      props.description ??
      'Real screenshots from the app showing powerful features that transform your writing workflow.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Distraction-free editor',
            description: 'Clean interface that keeps you focused on writing.',
          },
          {
            title: 'Real-time collaboration',
            description: 'Work together with your team in real-time.',
          },
          {
            title: 'Writing analytics',
            description: 'Track productivity and improvement over time.',
          },
          {
            title: 'Template library',
            description: '200+ templates to jumpstart any writing project.',
          },
          {
            title: 'Idea capture',
            description: 'Quick capture tools for inspiration anywhere.',
          },
          {
            title: 'Export anywhere',
            description: 'Publish to Word, PDF, or Markdown.',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0 lg:mb-20"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
          />
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
                .map((item) => ({
                  alt: item.title,
                  caption: item.description,
                }))
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
