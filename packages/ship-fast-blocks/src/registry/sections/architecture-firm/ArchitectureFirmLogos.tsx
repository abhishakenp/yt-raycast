import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ArchitectureFirmLogos — "Featured in" publication strip for an
 * architecture-studio / design-practice page. A quiet bordered band on a subtle
 * card surface: a centered wide letter-spaced label above a wrapping, dimmed row
 * of publication names rendered as light wordmarks. Calm, editorial,
 * monochrome. Tokens-only, no links. Use as a press / "as seen in" / featured
 * social-proof strip for architecture firms, design studios, interior designers
 * or any portfolio site that wants understated editorial credibility. Renders
 * fully with no props via baked-in publication defaults.
 */
export const ArchitectureFirmLogos = defineCapsule({
  name: 'ArchitectureFirmLogos',
  description:
    "Quiet 'Featured in' publication strip for an architecture-studio / design-practice page: a bordered band on a subtle card surface with a centered wide letter-spaced label above a wrapping, dimmed row of publication names rendered as light wordmarks. Calm, editorial, monochrome. Tokens-only, no links. Use as a press / 'as seen in' / featured social-proof strip for architecture firms, design studios, interior designers or any portfolio site wanting understated editorial credibility.",
  props: z.object({
    /** Wide letter-spaced label above the publication names. */
    label: z.string().optional(),
    /** Publication / outlet wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : [
          'Dezeen',
          'ArchDaily',
          'Dwell',
          'Wallpaper*',
          'Monocle',
          'Architectural Digest',
        ]

    return (
      <section
        aria-label="Featured publications"
        className={cn('border-y border-border bg-card py-16', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {items.map((item) => (
              <span
                key={item}
                className="text-lg font-light text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
