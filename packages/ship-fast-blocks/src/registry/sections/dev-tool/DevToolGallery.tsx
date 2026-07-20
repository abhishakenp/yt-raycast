import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * DevToolGallery — staggered terminal-pane screenshot gallery for a developer
 * tool / API platform. An asymmetric header (heading + intro left, aria-hidden
 * mono "[ screens ]" count meta right) above an asymmetric 7/5-split grid of
 * sharp-cornered window panes that alternate widths and stagger vertically on
 * desktop. Each pane is a mono title bar (square chrome dots + a "~/slug" path
 * derived from the title) over the alt-driven zoom-on-hover screenshot, with
 * the caption as a hairline-topped mono status row pinned to the bottom.
 * Static figures (no links). Use to show dashboard, API explorer, edge
 * network, and team workspace screenshots for developer tools, API platforms,
 * or technical SaaS.
 */
export const DevToolGallery = defineCapsule({
  name: 'DevToolGallery',
  description:
    "Staggered terminal-pane screenshot gallery for a developer tool / API platform: an asymmetric header (heading + intro left, aria-hidden mono screen-count meta right) above an asymmetric 7/5-split grid of sharp window panes alternating widths and staggering vertically on desktop, each with a mono title bar (square chrome dots + '~/slug' path derived from the title) over the alt-driven zoom-on-hover screenshot and a hairline-topped mono caption status row. Use to show dashboard, API explorer, edge network, and team workspace screenshots for developer tools, API platforms, or technical SaaS.",
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

    const toPath = (title: string) =>
      '~/' +
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="gallery-heading"
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              titleId="gallery-heading"
              className="max-w-2xl gap-4"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ screens ] {String(items.length).padStart(2, '0')} attached
            </MonoTag>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={2}
              className="gap-6 sm:grid-cols-12 lg:gap-8"
            >
              {items
                .map((item) => ({
                  alt: item.title,
                  caption: item.caption,
                }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  const wide = i % 4 === 0 || i % 4 === 3
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'flex aspect-auto flex-col rounded-none border-foreground/20 bg-card',
                        wide ? 'sm:col-span-7' : 'sm:col-span-5',
                        i % 2 === 1 && 'sm:translate-y-6',
                      )}
                    >
                      <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2.5">
                        <div className="flex gap-1.5" aria-hidden="true">
                          <div className="size-2 bg-foreground/25" />
                          <div className="size-2 bg-foreground/25" />
                          <div className="size-2 bg-foreground/50" />
                        </div>
                        <span className="ml-1 truncate font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                          {toPath(__iv__.alt)}
                        </span>
                      </div>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <GalleryTileImage alt={__iv__.alt} />
                      </div>
                      {__iv__.caption && (
                        <GalleryTileCaption className="static border-t border-border bg-card px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-none">
                          <span aria-hidden="true" className="text-primary">
                            &gt;{' '}
                          </span>
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
