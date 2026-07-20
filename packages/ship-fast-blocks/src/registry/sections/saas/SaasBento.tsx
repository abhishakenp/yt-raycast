import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  BentoGrid,
  BentoTile,
  BentoTileTitle,
  BentoTileDescription,
} from '#/section-kit/BentoGrid.tsx'

/**
 * SaasBento — asymmetric collapsed-border bento grid of product capabilities for
 * a B2B SaaS / AI-product landing page. An asymmetric header (marker-highlighted
 * heading left, mono "[ CAPABILITIES ]" meta right) above a sharp 6-column bento
 * where each tile's optional span ("wide" → 4 cols, "tall" → 2 rows) creates a
 * balanced mix of large and small cells: every cell carries a mono index
 * numeral, a bold title and description; the feature cell inverts to
 * bg-foreground/text-background and carries a product-dashboard screenshot, and
 * a tall cell adds a div-built token bar-chart motif. Sharp corners, hard offset
 * shadow, hover muted wash. Use to highlight a product's standout capabilities
 * with visual rhythm; no CTAs. Renders fully with no props via baked-in
 * defaults.
 */
export const SaasBento = defineCapsule({
  name: 'SaasBento',
  description:
    "Asymmetric collapsed-border bento grid of product capabilities for a B2B SaaS / AI-product landing page: an asymmetric marker-highlighted header with mono meta above a sharp 6-column bento where each tile's optional span ('wide' → 4 cols, 'tall' → 2 rows) mixes large and small cells, each with a mono index numeral, bold title and description. The feature cell inverts to a dark surface with a product-dashboard screenshot, and a tall cell adds a div-built token bar-chart motif. Sharp corners, hard offset shadow, hover muted wash. Use to highlight a product's standout capabilities with visual rhythm; no CTAs.",
  props: z.object({
    /** Centered section heading above the bento grid. */
    heading: z.string().optional(),
    /** Optional supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Bento tiles; span controls the grid footprint of each tile. */
    tiles: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          span: z.enum(['wide', 'tall']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'One platform, every capability'
    const subheading =
      props.subheading ??
      'From the first automation to enterprise-scale rollouts, the building blocks fit together so you can move fast without outgrowing your tools.'
    const tiles = props.tiles?.length
      ? props.tiles
      : [
          {
            title: 'Live product dashboard',
            description:
              'See every workflow, integration, and metric in a single command center built for clarity at a glance.',
            span: 'wide' as const,
          },
          {
            title: 'Automation studio',
            description:
              'Compose multi-step flows with a drag-and-drop canvas and ship them in minutes, not sprints.',
            span: 'tall' as const,
          },
          {
            title: 'Unified inbox',
            description:
              'Triage every signal from every channel in one prioritized stream.',
          },
          {
            title: 'Insight engine',
            description:
              'Turn raw events into forecasts and anomaly alerts your team can act on.',
          },
          {
            title: 'Granular access',
            description:
              'Role-based permissions and audit trails that satisfy security from day one.',
          },
        ]

    const spanClass = (span: string | undefined) =>
      span === 'wide'
        ? 'md:col-span-4'
        : span === 'tall'
          ? 'md:col-span-2 md:row-span-2'
          : 'md:col-span-2'

    const barHeights = ['h-4', 'h-8', 'h-5', 'h-12', 'h-9', 'h-16', 'h-11']
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Capabilities
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · one platform
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ toolkit ] built to compose
            </p>
          </div>

          <BentoGrid
            cols="1-sm-2-md-6"
            className="auto-rows-[200px] gap-0 border-l border-t border-border"
          >
            {tiles.map((tile, i) => {
              const isFeature = i === 0
              return (
                <BentoTile
                  key={tile.title}
                  span={spanClass(tile.span)}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-none border-0 border-b border-r border-border p-6 shadow-none transition-colors duration-150 sm:p-7',
                    isFeature
                      ? 'bg-foreground text-background'
                      : 'bg-card text-card-foreground hover:bg-muted/60',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em]',
                      isFeature
                        ? 'text-background/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                    <span
                      className={cn(
                        isFeature ? 'text-background' : 'text-primary',
                      )}
                    >
                      {' '}
                      /
                    </span>
                  </span>
                  <BentoTileTitle
                    className={cn(
                      'mt-3 text-lg font-bold tracking-tight',
                      isFeature ? 'text-background' : 'text-card-foreground',
                    )}
                  >
                    {tile.title}
                  </BentoTileTitle>
                  <BentoTileDescription
                    className={cn(
                      'mt-2 max-w-md text-sm leading-6',
                      isFeature
                        ? 'text-background/75'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tile.description}
                  </BentoTileDescription>
                  {isFeature ? (
                    <div className="mt-5 flex-1 overflow-hidden border border-background/25">
                      <Image
                        alt="product dashboard screenshot"
                        w={800}
                        h={500}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : tile.span === 'tall' ? (
                    <span
                      aria-hidden="true"
                      className="mt-auto flex items-end gap-1.5 pt-6"
                    >
                      {barHeights.map((h, bi) => (
                        <span
                          key={bi}
                          className={cn(
                            'w-3 sm:w-4',
                            h,
                            bi === barHeights.length - 1
                              ? 'bg-primary'
                              : 'bg-foreground/15',
                          )}
                        />
                      ))}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-auto flex items-center gap-1.5 pt-4"
                    >
                      <span className="h-1 w-8 bg-primary" />
                      <span className="h-1 w-1 bg-foreground/20" />
                      <span className="h-1 w-1 bg-foreground/20" />
                    </span>
                  )}
                </BentoTile>
              )
            })}
          </BentoGrid>
        </Container>
      </section>
    )
  },
})
