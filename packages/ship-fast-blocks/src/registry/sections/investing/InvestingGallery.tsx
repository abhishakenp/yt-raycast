import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingGallery — Swiss-fintech dark product-showcase ledger for an investing
 * / brokerage page. An inverted (bg-foreground / text-background) section with an
 * asymmetric mono header (heading + lede left, tabular screen count right) above
 * a collapsed-border grid of app-screen tiles sharing hairline rules; each tile
 * frames a mock 4:3 platform screen with a mono index numeral overlay and a mono
 * caption chip. Tokens only, no links. Use to show off platform / app screens —
 * portfolio view, charts, insights, orders — on a brokerage or trading-app page.
 * Renders fully with no props via six baked-in screens.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const InvestingGallery = defineCapsule({
  name: 'InvestingGallery',
  description:
    'Swiss-fintech dark product-showcase ledger for an investing / brokerage page: an inverted (bg-foreground / text-background) section with an asymmetric mono header (heading + lede left, tabular screen count right) above a collapsed-border grid of app-screen tiles sharing hairline rules, each framing a mock 4:3 platform screen with a mono index numeral overlay and a mono caption chip. Tokens only, no links. Use to show off platform / app screens (portfolio view, charts, insights, orders) on a brokerage or trading-app page.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Showcase cards: title + caption. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'See the platform in action'
    const description =
      props.description ??
      'Designed for clarity. Built for performance. Experience investing without the clutter.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Clean portfolio view',
            description: 'Track all your holdings at a glance',
          },
          {
            title: 'Advanced charts',
            description: 'Technical analysis made simple',
          },
          {
            title: 'Smart insights',
            description: 'AI-powered recommendations',
          },
          {
            title: 'Real-time orders',
            description: 'Live market depth',
          },
          {
            title: 'Social features',
            description: 'Follow top investors',
          },
          {
            title: 'Automated investing',
            description: 'Set it and forget it',
          },
        ]

    return (
      <section
        className={cn('bg-foreground py-24 text-background', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-background/20 pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag tone="inverted" className="mb-4 block">
                Product
                <span aria-hidden="true" className="text-background/50">
                  {' '}
                  / gallery
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-background text-balance sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-background/60 text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              className="shrink-0 tabular-nums text-background/40"
            >
              [ {String(items.length).padStart(2, '0')} screens ]
            </MonoTag>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="gap-0 border-l border-t border-background/20"
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
                      className="rounded-none border-0 border-b border-r border-background/20"
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className="absolute left-3 top-3 border border-background/30 bg-foreground/70 px-2 py-1 font-mono text-[10px] tabular-nums text-background/80 backdrop-blur-sm"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {__iv__.caption && (
                        <GalleryTileCaption className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
