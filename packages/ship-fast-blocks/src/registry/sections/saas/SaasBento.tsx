import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * SaasBento — an asymmetric bento grid of product capabilities for a B2B SaaS /
 * AI-product landing page. A centered heading + optional subheading above a
 * responsive 6-column bento (md:grid-cols-6) where each tile's optional span
 * ("wide" → 4 cols, "tall" → 2 rows) creates a balanced mix of large and small
 * cards; one feature tile carries a gradient accent and a product-dashboard
 * screenshot. Rounded-2xl card/muted surfaces with subtle borders. Use to
 * highlight a product's standout capabilities with visual rhythm. Renders fully
 * with no props via baked-in defaults; no CTAs.
 */
export const SaasBento = defineCapsule({
  name: 'SaasBento',
  description:
    "Asymmetric bento grid of product capabilities for a B2B SaaS / AI-product landing page: a centered heading + optional subheading above a responsive 6-column bento (md:grid-cols-6) where each tile's optional span ('wide' → 4 cols, 'tall' → 2 rows) creates a balanced mix of large and small cards. One feature tile carries a gradient accent and a product-dashboard screenshot. Rounded-2xl card/muted surfaces with subtle borders. Use to highlight a product's standout capabilities with visual rhythm; no CTAs.",
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

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
            titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg leading-relaxed"
            className="mx-auto max-w-2xl"
          />

          <div className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-6 lg:gap-6">
            {tiles.map((tile, i) => {
              const isFeature = i === 0
              return (
                <div
                  key={tile.title}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-2xl border border-border p-7 shadow-sm transition-all hover:shadow-lg',
                    isFeature
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                      : 'bg-card text-card-foreground',
                    spanClass(tile.span),
                  )}
                >
                  <h3
                    className={cn(
                      'text-lg font-bold',
                      isFeature
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {tile.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 max-w-md text-sm leading-relaxed',
                      isFeature
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tile.description}
                  </p>
                  {isFeature ? (
                    <div className="mt-5 flex-1 overflow-hidden rounded-xl border border-primary-foreground/20 shadow-lg">
                      <Image
                        alt="product dashboard screenshot"
                        w={800}
                        h={500}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <span className="inline-block size-2 rounded-full bg-chart-2" />
                      <span className="inline-block size-2 rounded-full bg-accent" />
                      <span className="inline-block size-2 rounded-full bg-muted-foreground/40" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
