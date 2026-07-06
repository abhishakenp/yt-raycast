import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Clock, Coffee, Phone, Sparkles, Users, Wifi } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { GridField } from '#/section-kit/motion.tsx'

/**
 * CoworkingFeatures — calm, dimensional amenity grid for a coworking or
 * shared-workspace page. An editorial split header (eyebrow chip + display
 * heading left, supporting line right) above a bento of frosted glass cards:
 * each card carries a gradient icon tile that lifts softly on hover, and a
 * hairline that warms under the pointer. The backdrop continues the page's
 * light-field — hairline content rails and a seam hairline at the top edge —
 * so the section reads as part of one connected canvas. Default content
 * forms a varied-span bento; authored features or an explicit column count
 * render a clean uniform grid. Renders fully with no props via bright
 * "Northside" defaults. Use to communicate what's included with a membership
 * for coworking spaces, shared offices, flex-office providers, or business
 * centers.
 */
export const CoworkingFeatures = defineCapsule({
  name: 'CoworkingFeatures',
  description:
    "Calm dimensional amenity grid for a coworking or shared-workspace page: editorial split header (eyebrow chip + display heading + supporting line) above a bento of frosted glass amenity cards with gradient icon tiles that lift softly on hover, and hairlines that warm under the pointer, over a connected light-field backdrop (hairline content rails, seam hairline). Defaults produce a varied-span bento; authored features or an explicit column count render a clean uniform grid. Use to communicate what's included with a membership for coworking spaces, shared offices, flex-office providers, or business centers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Amenity cards — each a title + benefit-led description. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      typeof props.heading === 'string' && props.heading
        ? props.heading
        : 'Everything you need to do your best work'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'A bright, thoughtfully designed workspace with the amenities that actually move your day forward.'

    const icons = [Wifi, Users, Coffee, Clock, Phone, Sparkles]
    const defaults = [
      {
        title: 'Lightning-fast WiFi',
        description:
          'Symmetrical gigabit fiber on a dedicated business line, with automatic failover so you never drop a call mid-meeting.',
      },
      {
        title: 'Bookable meeting rooms',
        description:
          'Glass-walled rooms for two to twelve, each with a 4K display and whiteboard walls — reserve from the app in seconds.',
      },
      {
        title: 'Unlimited free coffee',
        description:
          'Locally roasted drip, a self-serve espresso bar, fresh tea, and filtered water on tap all day, every day.',
      },
      {
        title: '24/7 keycard access',
        description:
          'Come and go on your own schedule with secure fob entry, on-site staff by day, and round-the-clock monitoring.',
      },
      {
        title: 'Private phone booths',
        description:
          'Soundproof one-person pods on every floor for focused calls, quick standups, and heads-down deep work.',
      },
      {
        title: 'Community events',
        description:
          'Weekly lunch-and-learns, member mixers, and workshops that turn desk neighbors into collaborators and clients.',
      },
    ]

    const authored = props.features
      ?.filter(Boolean)
      .filter((feature) => typeof feature?.title === 'string')
    const features = authored?.length
      ? authored.map((feature) => ({
          title: feature.title,
          description:
            typeof feature.description === 'string' ? feature.description : '',
        }))
      : defaults

    // Bento only for the untouched default composition; authored content or
    // an explicit column count always gets a clean uniform grid.
    const bento = !authored?.length && props.columns == null
    const columns = props.columns ?? 3
    const uniformCols =
      columns === 2
        ? 'sm:grid-cols-2'
        : columns === 4
          ? 'sm:grid-cols-2 lg:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3'
    const bentoSpans = [
      'sm:col-span-2 lg:col-span-4',
      'sm:col-span-1 lg:col-span-2',
      'sm:col-span-1 lg:col-span-2',
      'sm:col-span-2 lg:col-span-4',
      'sm:col-span-1 lg:col-span-3',
      'sm:col-span-2 lg:col-span-3',
    ]

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 sm:py-32',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        />
        <GridField
          className="-z-10 text-foreground/[0.045]"
          size={64}
          mask="radial-gradient(ellipse 90% 70% at 50% 20%, black 25%, transparent 78%)"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 backdrop-blur">
                <Sparkles
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Amenities
                </span>
              </span>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {subheading}
            </p>
          </div>

          <div
            className={cn(
              'mt-14 grid grid-cols-1 gap-5',
              bento ? 'sm:grid-cols-2 lg:grid-cols-6' : uniformCols,
            )}
          >
            {features.map((feature, index) => {
              const Icon = icons[index % icons.length]
              return (
                <div
                  key={`${feature.title}-${index}`}
                  className={cn(
                    'rounded-3xl',
                    bento && bentoSpans[index % bentoSpans.length],
                  )}
                >
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm backdrop-blur transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 transition-transform duration-500 group-hover:-translate-y-1">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-card-foreground">
                      {feature.title}
                    </h3>
                    {feature.description ? (
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
