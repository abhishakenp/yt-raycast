import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * MusicFestivalStats — a compact dark stats band for a music / arts festival
 * landing page. A full-bleed inverted (foreground) section with a centered
 * two/four-column grid of big bold numbers above muted labels (artists, stages,
 * attendees, days). Use as a punchy by-the-numbers proof band between content
 * sections on music festivals, arts festivals, concert series, or any
 * multi-day live event.
 */
import { Container } from '#/section-kit/Container.tsx'
export const MusicFestivalStats = defineCapsule({
  name: 'MusicFestivalStats',
  description:
    'Compact dark stats band for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) section with a centered two/four-column grid of big bold numbers above muted labels (artists performing, unique stages, music lovers, unforgettable days). Use as a punchy by-the-numbers proof band between content sections on music festivals, arts festivals, concert series, raves, or any multi-day live event.',
  props: z.object({
    /** Stat items (value + label). */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '80+',
            label: 'Artists Performing',
          },
          {
            value: '4',
            label: 'Unique Stages',
          },
          {
            value: '25K',
            label: 'Music Lovers',
          },
          {
            value: '3',
            label: 'Unforgettable Days',
          },
        ]
    return (
      <section
        className={cn(
          'bg-foreground pt-28 pb-16 text-background',
          props.className,
        )}
      >
        <Container>
          <ResponsiveGrid cols="2-md-4" gap="lg" className="text-center">
            {items.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold lg:text-5xl">{s.value}</p>
                <p className="mt-2 text-background/60">{s.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
