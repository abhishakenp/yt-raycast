import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ChurchPartners — muted logo-band section for a church or faith-community site
 * listing partner ministries and affiliated organizations. A top-and-bottom bordered
 * band with a soft muted background, a small centered label, and a flex-wrapped
 * row of plain-text partner names at reduced opacity. Use between the hero and
 * content sections for churches, nonprofits, ministries, or community organizations
 * that want to show alliance credibility. Renders fully with no props via baked-in
 * defaults.
 */
export const ChurchPartners = defineCapsule({
  name: 'ChurchPartners',
  description:
    'Muted partner-ministries logo-band for a church or faith-community site: a top-and-bottom bordered band with a soft muted background, a small centered label, and a flex-wrapped row of plain-text partner names at reduced opacity. Use between the hero and content sections for churches, nonprofits, ministries, or community organizations wanting to show alliance credibility.',
  props: z.object({
    /** Small label above the partner names. */
    label: z.string().optional(),
    /** Partner / ministry names rendered as text badges. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Partner ministries & affiliated organizations'
    const items = props.items?.length
      ? props.items
      : [
          'Portland Rescue Mission',
          'World Vision',
          'Compassion International',
          "Samaritan's Purse",
          'Youth With A Mission',
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-muted/50 py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-10 text-center text-sm text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-16">
            {items.map((p) => (
              <span
                key={p}
                className="text-xl font-medium text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
