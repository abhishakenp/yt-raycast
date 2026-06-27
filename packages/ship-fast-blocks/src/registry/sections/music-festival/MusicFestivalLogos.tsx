import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicFestivalLogos — a partner / sponsor logo strip for a festival landing
 * page. A bordered band with a small centered "presented in partnership with"
 * label above a wrapping, centered row of muted text wordmarks that brighten on
 * hover. Each wordmark routes through useNavigate. Use beneath the hero on
 * music festivals, arts festivals, concert series, or any sponsored multi-day
 * event to lend credibility.
 */
export const MusicFestivalLogos = defineCapsule({
  name: 'MusicFestivalLogos',
  description:
    "Partner / sponsor logo strip for a festival landing page: a top-and-bottom bordered band with a small centered 'presented in partnership with' label above a wrapping, centered row of muted text wordmarks that brighten on hover. Each wordmark routes through useNavigate. Use beneath the hero on music festivals, arts festivals, concert series, sponsored events, or any multi-day ticketed event to lend credibility and showcase partners.",
  props: z.object({
    /** Label above the logo row. */
    label: z.string().optional(),
    /** Partner / sponsor wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Presented in partnership with'
    const items = props.items?.length
      ? props.items
      : ['PITCHFORK', 'SPOTIFY', 'SONOS', 'RED BULL', 'BEATS', 'VANS']

    return (
      <section className={cn('border-y border-border py-16', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-foreground/50">{label}</p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="text-xl font-semibold text-foreground/30 transition-colors hover:text-foreground/60"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
