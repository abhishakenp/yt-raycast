import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DotGrid, MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * AiProductGallery — kinetic tech-editorial screenshot index for an AI SaaS /
 * product page. An asymmetric header (left-aligned oversized tight heading +
 * paragraph, mono "[ shots / in-app ]" meta right) above a staggered 1 → 2 → 3
 * column grid of sharp-cornered hairline tiles that ride a vertical offset
 * rhythm on desktop — each a clickable 4:3 alt-driven screenshot with a mono
 * index chip pinned top-left and a mono uppercase caption bar bottom, edging
 * to primary on hover — over a faint dot-grid field. Each card routes through
 * section-kit route links. Use to surface real in-app screenshots or feature
 * highlights for AI tools, SaaS apps, editors, dashboards, or any product
 * worth showing visually. Renders fully with no props via six built-in
 * feature tiles.
 */
export const AiProductGallery = defineCapsule({
  name: 'AiProductGallery',
  description:
    'Kinetic tech-editorial screenshot index for an AI SaaS / product page: an asymmetric header (left-aligned oversized tight heading and paragraph, mono shots meta right) above a staggered 1 → 2 → 3 column grid of sharp-cornered hairline tiles riding a vertical offset rhythm on desktop, each a clickable 4:3 alt-driven screenshot with a mono index chip pinned top-left and a mono uppercase caption bar, edging to primary on hover, over a faint dot-grid field. Each card routes through section-kit route links. Use to surface real in-app screenshots or feature highlights for AI tools, SaaS apps, editors, dashboards, or any product worth showing visually.',
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
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-28',
          props.className,
        )}
      >
        <DotGrid
          tone="faint"
          fade="right"
          className="inset-y-0 right-0 w-1/2"
        />
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-4"
              titleClassName="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tighter"
              subtitleClassName="max-w-xl text-base sm:text-lg"
            />
            <MonoTag aria-hidden="true" className="shrink-0">
              [ {String(items.length).padStart(2, '0')} shots / in-app ]
            </MonoTag>
          </div>
          <GalleryGrid className="gap-0">
            <GalleryGridItems
              columns={3}
              className="gap-5 sm:gap-6 lg:gap-8 lg:pb-12"
            >
              {items
                .map((item) => ({
                  alt: item.title,
                  caption: item.description,
                }))
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
                        'rounded-none transition-colors duration-150 hover:border-primary',
                        i % 3 === 1 && 'lg:translate-y-12',
                        i % 3 === 2 && 'lg:translate-y-6',
                        i % 2 === 1 && 'sm:max-lg:translate-y-8',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bg-foreground px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-background"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {__iv__.caption && (
                        <GalleryTileCaption className="border-t border-border bg-background/85 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
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
