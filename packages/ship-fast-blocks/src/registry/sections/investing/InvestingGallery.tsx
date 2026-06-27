import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingGallery — dark product-showcase gallery for an investing / fintech
 * page. A dark (foreground-surface) section with a centered heading + lead above
 * a responsive 1/2/3-column grid of cards; each card is a 4:3 gradient-tinted
 * tile (rotating token tints) framing a mock app-screen image with a title +
 * caption beneath. Tokens only, no links. Use to show off platform / app
 * screens — portfolio view, charts, insights, orders — on a brokerage or
 * trading-app page. Renders fully with no props via six baked-in screens.
 */
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
      .array(z.object({ title: z.string(), description: z.string() }))
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
          { title: 'Real-time orders', description: 'Live market depth' },
          { title: 'Social features', description: 'Follow top investors' },
          { title: 'Automated investing', description: 'Set it and forget it' },
        ]

    const galleryTints = [
      'from-chart-1/30',
      'from-primary/30',
      'from-chart-4/30',
      'from-chart-2/30',
      'from-chart-5/30',
      'from-chart-3/30',
    ]

    return (
      <section
        className={cn('bg-foreground py-24 text-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-background/60">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((g, i) => (
              <div
                key={g.title}
                className="group relative overflow-hidden rounded-xl bg-background/10"
              >
                <div
                  className={cn(
                    'flex aspect-[4/3] flex-col bg-gradient-to-br to-background/5 p-6',
                    galleryTints[i % galleryTints.length],
                  )}
                >
                  <div className="mb-4 flex-1 overflow-hidden rounded-lg bg-foreground/80 p-4">
                    <Image
                      alt={`${g.title} — fintech app interface screenshot`}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="size-full rounded-md object-cover opacity-90"
                    />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{g.title}</h3>
                    <p className="text-sm text-background/60">
                      {g.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
