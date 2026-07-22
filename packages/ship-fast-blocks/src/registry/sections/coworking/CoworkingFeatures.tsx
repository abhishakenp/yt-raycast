import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Clock, Coffee, Phone, Sparkles, Users, Wifi } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { GridField } from '#/section-kit/motion.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CoworkingFeatures — flat editorial amenity LEDGER for a coworking or
 * shared-workspace page. An asymmetric split header (mono index eyebrow with a
 * square accent marker + display heading left, supporting line right) sits
 * above an open hairline ledger: each amenity is a numbered row
 * (`01 / 02 / 03…` mono tabular index) with a small inline monochrome icon,
 * a title, and a benefit-led description laid out across a three-track
 * asymmetric grid, separated by `border-b border-border` hairlines — no cards,
 * no icon tiles, no glass. A restrained architectural hairline field and flat
 * content rails keep the section reading as part of one connected canvas.
 * Renders fully with no props via bright "Northside" defaults. Use to
 * communicate what's included with a membership for coworking spaces, shared
 * offices, flex-office providers, or business centers.
 */
export const CoworkingFeatures = defineCapsule({
  name: 'CoworkingFeatures',
  description:
    "Calm dimensional amenity grid for a coworking or shared-workspace page: editorial split header (mono index eyebrow chip + display heading + supporting line) above a bento of frosted glass amenity cards — each opens with a mono index numeral beside a hairline icon chip that lifts softly on hover, carries a giant ghost numeral in its corner, and a hairline that warms under the pointer — over a connected light-field backdrop (hairline content rails, seam hairline). Defaults produce a varied-span bento; authored features or an explicit column count render a clean uniform grid. Use to communicate what's included with a membership for coworking spaces, shared offices, flex-office providers, or business centers.",
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

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        {/* Restrained architectural hairline field — flat, no glow wash. */}
        <GridField
          className="-z-10 text-foreground/[0.035]"
          size={64}
          mask="radial-gradient(ellipse 90% 70% at 50% 20%, black 25%, transparent 78%)"
        />

        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-border/70 lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border/70 lg:block"
          />

          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  01 / Amenities
                </span>
              </span>
              <h2 className="mt-6 max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {subheading}
            </p>
          </div>

          <div className="mt-14 border-t border-border">
            {features.map((feature, index) => {
              const Icon = icons[index % icons.length]
              return (
                <div
                  key={`${feature.title}-${index}`}
                  className="group grid gap-x-8 gap-y-2.5 border-b border-border py-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-9 lg:grid-cols-[4rem_minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-12"
                >
                  <span className="font-mono text-[11px] uppercase leading-none tracking-[0.16em] tabular-nums text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="flex items-start gap-2.5 text-xl font-semibold tracking-tight text-foreground sm:col-start-2">
                    <Icon
                      className="mt-1 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{feature.title}</span>
                  </h3>
                  {feature.description ? (
                    <p className="text-pretty leading-relaxed text-muted-foreground sm:col-start-2 lg:col-start-3">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
