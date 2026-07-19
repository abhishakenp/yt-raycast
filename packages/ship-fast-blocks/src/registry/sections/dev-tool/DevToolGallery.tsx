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
 * DevToolGallery — a 2x2 product screenshot gallery for a developer tool / API
 * platform. A centered heading + intro above a responsive 1/2-column grid of
 * figures, each a bordered dark-framed clickable image (alt-driven, zoom-on-hover)
 * with a centered title + caption beneath. Each tile routes through section-kit route links.
 * Use to show dashboard, API explorer, edge network, and team workspace
 * screenshots for developer tools, API platforms, or technical SaaS.
 */
export const DevToolGallery = defineCapsule({
  name: 'DevToolGallery',
  description:
    '2x2 product screenshot gallery for a developer tool / API platform: a centered heading + intro above a responsive 1/2-column grid of figures, each a bordered dark-framed clickable image (alt-driven, zoom-on-hover) with a centered title + caption beneath. Each tile routes through section-kit route links. Use to show dashboard, API explorer, edge network, and team workspace screenshots for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), caption: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Built for modern teams'
    const description =
      props.description ??
      'From the dashboard to your IDE, every touchpoint is designed for developer productivity.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Analytics Dashboard',
            caption: 'Real-time metrics and request logs',
          },
          {
            title: 'API Explorer',
            caption: 'Interactive documentation and testing',
          },
          {
            title: 'Global Edge Network',
            caption: '250+ locations worldwide',
          },
          {
            title: 'Team Workspaces',
            caption: 'Collaborate with your entire engineering team',
          },
        ]

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="gallery-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="gallery-heading"
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <GalleryGrid>
            <GalleryGridItems columns={2}>
              {items
                .map((item) => ({
                  alt: item.title,
                  caption: item.caption,
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
