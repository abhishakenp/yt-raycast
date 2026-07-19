import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingGallery — dark product-showcase gallery for an investing / fintech
 * page. A dark (foreground-surface) section with a centered heading + lead above
 * a responsive 1/2/3-column grid of cards; each card is a 4:3 gradient-tinted
 * tile (rotating token tints) framing a mock app-screen image with a title +
 * caption beneath. Tokens only, no links. Use to show off platform / app
 * screens — portfolio view, charts, insights, orders — on a brokerage or
 * trading-app page. Renders fully with no props via six baked-in screens.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
    'Dark product-showcase gallery for an investing / fintech page: a dark (foreground-surface) section with a centered heading + lead above a responsive 1/2/3-column grid of cards, each a 4:3 gradient-tinted tile (rotating token tints) framing a mock app-screen image with a title + caption beneath. Tokens only, no links. Use to show off platform / app screens (portfolio view, charts, insights, orders) on a brokerage or trading-app page.',
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
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-background/60"
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
