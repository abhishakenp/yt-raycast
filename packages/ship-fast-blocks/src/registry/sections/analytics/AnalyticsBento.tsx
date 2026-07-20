import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

const TILE_TICKS = ['w-8', 'w-5', 'w-10', 'w-6']

/**
 * AnalyticsBento — Swiss data-grid capability plate for an analytics product.
 * An asymmetric header (left-aligned oversized title + lede, right-aligned
 * mono figure index) above a collapsed-border 7:5 hairline composition: a
 * large hero plate carries a mono figure label, title, description, and a
 * product screenshot behind a hairline rule with a tabular axis strip, while
 * four supporting cells stack in a 2x2 collapsed grid, each with a mono
 * tabular index, ghost numeral watermark, title, description, and a primary
 * tick-bar motif. Sharp corners, hairline precision, faint wash on hover. Use
 * to showcase a mix of headline and supporting capabilities on any analytics,
 * BI, or data-product site. Renders fully with no props.
 */
export const AnalyticsBento = defineCapsule({
  name: 'AnalyticsBento',
  description:
    'Swiss data-grid capability plate for an analytics product: an asymmetric header (oversized title + lede left, mono figure index right) above a collapsed-border 7:5 hairline composition — a large hero plate with mono figure label, title, description, and a product screenshot over a tabular axis strip, plus four supporting cells in a 2x2 collapsed grid, each with a mono tabular index, ghost numeral watermark, title, description, and primary tick-bar motif. Sharp corners and hairline precision. Use to showcase a mix of headline and supporting capabilities on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    /** Title for the large hero tile. */
    heroTitle: z.string().optional(),
    /** Description for the large hero tile. */
    heroDescription: z.string().optional(),
    /** Four supporting tiles, each a title + description. */
    tiles: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Built for depth'
    const heading = props.heading ?? 'Go from question to answer in seconds'
    const subheading =
      props.subheading ??
      'Every surface is designed to keep you in flow — explore, drill in, and share without breaking your train of thought.'
    const heroTitle = props.heroTitle ?? 'Explore any metric, instantly'
    const heroDescription =
      props.heroDescription ??
      'Slice by cohort, device, or campaign and watch the chart redraw in real time across billions of rows.'
    const tiles = props.tiles?.length
      ? props.tiles
      : [
          {
            title: 'Funnels',
            description:
              'Pinpoint exactly where users drop and recover step-by-step conversion in one view.',
          },
          {
            title: 'Retention',
            description:
              'Cohort grids reveal who comes back — and the features that keep them.',
          },
          {
            title: 'SQL & API',
            description:
              "Drop to raw SQL or query programmatically when the UI isn't enough.",
          },
          {
            title: 'Governance',
            description:
              'Roles, audit logs, and PII controls keep every team safely on the same data.',
          },
        ]

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-10 grid items-end gap-6 sm:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="gap-4 lg:col-span-8"
              titleClassName="text-4xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 lg:col-span-4 lg:flex-col lg:items-end lg:justify-end lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <MonoTag className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Fig. index
              </MonoTag>
              <MonoTag tone="faint" className="tabular-nums">
                01 — {String(tiles.length + 1).padStart(2, '0')}
              </MonoTag>
            </div>
          </div>

          <div className="grid border-l border-t border-border lg:grid-cols-12">
            <div className="flex flex-col border-b border-r border-border lg:col-span-7">
              <div className="p-6 sm:p-8">
                <MonoTag tone="primary" className="tabular-nums">
                  01
                </MonoTag>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {heroTitle}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {heroDescription}
                </p>
              </div>
              <Image
                alt="analytics explore chart drilldown dashboard"
                w={1200}
                h={680}
                className="mt-auto block w-full flex-1 border-t border-border object-cover"
              />
              <div
                aria-hidden="true"
                className="flex items-center justify-between border-t border-border px-6 py-2.5 font-mono text-[10px] tabular-nums text-muted-foreground/60"
              >
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:col-span-5">
              {tiles.map((tile, i) => {
                const index = String(i + 2).padStart(2, '0')
                return (
                  <div
                    key={tile.title}
                    className="group relative flex flex-col border-b border-r border-border p-6 transition-colors duration-150 hover:bg-muted/30 sm:p-7"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-3 select-none font-mono text-6xl font-bold tabular-nums text-foreground/[0.05]"
                    >
                      {index}
                    </span>
                    <MonoTag tone="primary" className="tabular-nums">
                      {index}
                    </MonoTag>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                      {tile.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tile.description}
                    </p>
                    <span
                      aria-hidden="true"
                      className="mt-auto flex items-center gap-1 pt-5"
                    >
                      <span
                        className={cn(
                          'h-1 bg-primary',
                          TILE_TICKS[i % TILE_TICKS.length],
                        )}
                      />
                      <span className="h-1 w-1 bg-border" />
                      <span className="h-1 w-1 bg-border" />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
